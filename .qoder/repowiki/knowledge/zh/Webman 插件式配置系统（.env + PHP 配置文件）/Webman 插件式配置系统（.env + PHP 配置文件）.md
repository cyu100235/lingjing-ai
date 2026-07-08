---
kind: configuration_system
name: Webman 插件式配置系统（.env + PHP 配置文件）
category: configuration_system
scope:
    - '**'
source_files:
    - server/start.php
    - server/support/bootstrap.php
    - server/config/app.php
    - server/config/server.php
    - server/config/database.php
    - server/config/redis.php
    - server/config/autoload.php
    - server/.env
    - frontend/vite.config.ts
    - frontend/src/stores/siteConfig.ts
---

## 1. 使用的系统与框架

后端基于 **Webman**（Workerman 之上的轻量级 PHP 框架），采用“核心 + 插件”的架构。配置系统由两部分组成：
- **环境变量**：通过 `vlucas/phpdotenv` 加载 `.env`，在 bootstrap 阶段注入到全局 `$_ENV`/`getenv()`。
- **PHP 数组配置文件**：位于 `server/config/` 及每个插件的 `config/*.php`，以纯 PHP 返回数组形式声明配置项，并通过 `Webman\Config` 统一读取。

前端为 Vue3 + Vite 应用，未使用运行时配置中心；构建期变量通过 Vite 的 `import.meta.env.*` 注入，运行期行为主要依赖后端 API 返回的站点配置。

## 2. 关键文件与位置

| 层级 | 路径 | 作用 |
|---|---|---|
| 根启动入口 | `server/start.php` | 调用 `support\App::run()` 触发 Webman 引导流程 |
| Bootstrap 引导 | `server/support/bootstrap.php` | 加载 `.env`、合并所有配置、注册中间件/Bootstrap 类、扫描插件 config 目录并加载路由 |
| 应用基础配置 | `server/config/app.php` | debug、时区、public/runtime 路径、控制器后缀等 |
| 服务器进程配置 | `server/config/server.php` | pid_file、status_file、日志路径、max_package_size 等 |
| 数据库连接池 | `server/config/database.php` | MySQL 驱动、连接池参数（max/min/wait/idle/heartbeat） |
| Redis 连接池 | `server/config/redis.php` | host/port/password/db + 连接池参数 |
| 自动加载文件 | `server/config/autoload.php` | 指定启动时需 include 的全局函数/支持文件 |
| 环境变量模板 | `server/.env` | APP_DEBUG、DB_*、REDIS_*、ADMIN_URL、CACHE_TYPE 等 |
| 插件配置 | `server/plugin/<plugin>/config/*.php` | 各业务插件（xbUser、xbUpload*、xbSms*、xbAiModelAgent 等）各自维护独立配置 |
| 前端构建配置 | `frontend/vite.config.ts` | Vite 构建期环境变量前缀与代理等 |
| 前端站点配置 Store | `frontend/src/stores/siteConfig.ts` | 运行时从后端拉取站点配置并缓存 |

## 3. 架构与约定

### 3.1 加载顺序（单进程生命周期内只执行一次）

1. `start.php` → `support\App::run()`
2. `bootstrap.php` 中：
   - 若存在 `Dotenv\Dotenv` 且根目录有 `.env`，则调用 `createUnsafeMutable(base_path(false))->load()` 将键值对写入环境。
   - `Config::clear()` 清空缓存。
   - `support\App::loadAllConfig(['route'])` 开始加载配置。
   - 根据 `config('app.default_timezone')` 设置默认时区。
   - 遍历 `config('autoload.files')` 和每个插件的 `autoload.files`，逐一 `include_once`。
   - 加载 `middleware`、`bootstrap` 类（含插件）。
   - 扫描 `server/plugin/*/config` 目录，追加到路由加载路径，实现“插件即配置”。

### 3.2 配置分层与覆盖

- **`.env` 提供环境差异值**（开发/测试/生产），通过 `env('KEY', default)` 在任意配置文件中取值。
- **`config/*.php` 提供结构化默认值**，按模块拆分（database、redis、log、session、translation 等）。
- **插件 `config/*.php` 提供领域配置**，由 bootstrap 自动发现并合并进 `config('plugin')` 命名空间。
- 读取侧统一通过 `config('key')` / `config('plugin.xbUser.xxx')` 访问，不直接读 `$_ENV`。

### 3.3 连接池配置模式

数据库与 Redis 均采用相同的连接池结构：
```php
'pool' => [
    'max_connections' => 5,
    'min_connections' => 1,
    'wait_timeout' => 3,
    'idle_timeout' => 60,
    'heartbeat_interval' => 50,
]
```
该模式便于在不同部署环境仅调整 `.env` 中的数量参数即可切换。

### 3.4 前端配置策略

- 构建期：Vite 通过 `vite.config.ts` 暴露 `import.meta.env.VITE_*` 给源码。
- 运行期：`frontend/src/stores/siteConfig.ts` 在应用初始化时调用后端 `/api/config` 接口获取站点开关、域名、上传限制等动态配置，存入 Pinia store 供全组件共享。

## 4. 开发者应遵循的规则

1. **新增配置项优先放入 `.env`**，并在对应 `config/*.php` 中以 `env('KEY', 默认值)` 引用，保持默认值可追踪。
2. **敏感信息（密码、密钥）只出现在 `.env`**，不得硬编码进任何 `config/*.php` 或插件代码。
3. **插件新增配置**：在 `server/plugin/<your-plugin>/config/` 下新建 `*.php` 返回数组，并在插件的 `plugins.json` 中声明 `config` 目录（Webman 会自动扫描）。
4. **连接池参数**：如需调整并发，修改 `.env` 中对应 `*_POOL_*` 或直接改 `config` 下的 `pool` 块，不要在生产环境调大 `max_connections` 超过数据库/Redis 最大连接数。
5. **前端动态配置**：新增站点级开关应在后端提供对应 API，并由 `siteConfig.ts` 拉取，避免在前端写死分支逻辑。
6. **时区与路径**：通过 `config('app.default_timezone')` 和 `base_path()/runtime_path()` 访问，不要自行拼接路径。
