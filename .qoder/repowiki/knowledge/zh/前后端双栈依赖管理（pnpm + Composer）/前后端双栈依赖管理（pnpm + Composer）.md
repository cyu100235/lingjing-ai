---
kind: dependency_management
name: 前后端双栈依赖管理（pnpm + Composer）
category: dependency_management
scope:
    - '**'
source_files:
    - frontend/package.json
    - frontend/pnpm-lock.yaml
    - frontend/pnpm-workspace.yaml
    - server/composer.json
    - server/composer.lock
---

本仓库采用前后端分离架构，各自使用独立的包管理器进行第三方依赖声明与锁定：前端基于 pnpm，后端基于 Composer。两套系统互不耦合，分别维护自己的清单与锁文件。

## 前端依赖管理（pnpm）
- 清单文件：`frontend/package.json`，以 `dependencies` / `devDependencies` 划分运行期与开发期依赖。
- 锁文件：`frontend/pnpm-lock.yaml`，由 pnpm 生成并纳入版本控制，确保构建可重现。
- 工作区配置：`frontend/pnpm-workspace.yaml` 仅用于允许特定原生模块（sharp、esbuild、vue-demi 等）在构建时编译，未启用多包 workspace 模式。
- 脚本约定：通过 `scripts.dev/build/preview` 暴露 Vite 开发、TypeScript 类型检查+构建、预览命令；图标提取通过自定义 Node 脚本执行。
- 私有源/镜像：未发现 `.npmrc`、`.pnpmrc` 或环境变量中配置私有 registry，默认走 npm 官方源。

## 后端依赖管理（Composer）
- 清单文件：`server/composer.json`，声明 PHP >=8.1 基线及全部运行时依赖（Webman 框架、JWT、验证码、ThinkORM/Cache、Guzzle、云厂商 SDK、PHPMailer 等）。
- 锁文件：`server/composer.lock`，提交至仓库，保证部署一致性。
- 自动加载：根命名空间映射到 `./`、`app\`、`App\` 等目录，遵循 PSR-4。
- 插件钩子：通过 `post-package-install/update`、`pre-package-uninstall` 脚本调用 `support\Plugin::install/uninstall`，实现插件安装/卸载时的数据库迁移与资源初始化。
- 安全审计：`config.audit.block-insecure = false`，显式关闭 Composer 安全审计阻断行为。
- 私有源/镜像：未在 composer.json 的 `repositories` 或全局配置中发现私有 Packagist 镜像或 token 配置。

## 插件生态与依赖隔离
后端采用 Webman 插件化架构，业务功能拆分为 `server/plugin/*` 下的独立插件包（如 xbAiAsset、xbUser、xbUploadCos 等）。每个插件自带 `plugins.json`、`install.sql`、`README.md` 等元数据，但**未作为独立的 Composer package 发布**，而是随主项目源码一起分发，依赖仍集中在根 `composer.json` 中统一声明，插件之间通过共享根项目的 vendor 目录复用公共库。

## 开发者应遵循的规则
1. 新增前端依赖一律写入 `frontend/package.json`，并通过 pnpm 安装以更新 `pnpm-lock.yaml`，禁止手动编辑锁文件。
2. 新增后端 PHP 依赖一律写入 `server/composer.json`，并通过 Composer 安装以更新 `composer.lock`。
3. 不要将 `node_modules`、`vendor` 目录提交到 Git；若需共享静态 JS/CSS（如 `server/plugin/.../public/static/js`），应视为“已构建产物”而非依赖来源。
4. 插件扩展能力通过 `server/plugin/*` 目录组织，不要在插件内再引入独立的 `composer.json` 或 `package.json`，避免依赖分裂。
5. 如需切换私有源，应在 CI 环境通过环境变量注入 `.npmrc`/`.pnpmrc` 与 `COMPOSER_AUTH`，而非修改仓库中的配置文件。