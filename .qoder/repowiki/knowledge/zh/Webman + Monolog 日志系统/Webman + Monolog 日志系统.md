---
kind: logging_system
name: Webman + Monolog 日志系统
category: logging_system
scope:
    - '**'
source_files:
    - server/config/log.php
    - server/support/bootstrap.php
    - server/runtime/logs/webman-2026-07-06.log
    - server/runtime/logs/xb_2026-07-06.log
    - server/runtime/logs/xbAiModelAgent/2026-07-05.log
---

## 系统概述
后端基于 Webman 框架，使用内置的 `Webman\Support\Log` 门面，底层由 Monolog 驱动。前端（Vue3）未集成专用日志库，主要依赖浏览器控制台输出。

## 核心配置与架构
- **配置文件**：`server/config/log.php` 定义默认 logger，采用 `Monolog\Handler\RotatingFileHandler` 按日轮转，保留最近 7 个文件，级别为 `DEBUG`，格式化为 `Y-m-d H:i:s` 前缀的 LineFormatter。
- **运行时目录**：`server/runtime/logs/` 下存放三类日志：
  - `webman-{date}.log` — Webman 框架级日志
  - `xb_{date}.log` — 业务应用日志（通过 `Log::error/info/warning` 写入）
  - `workerman.log` — Workerman 进程日志
  - `runtime/logs/xbAiModelAgent/{date}.log` — xbAiModelAgent 插件独立日志目录
- **启动期日志**：`server/support/bootstrap.php` 在 bootstrap 阶段对缺失类、插件加载异常等场景统一调用 `Log::error` 记录错误。

## 使用方式与约定
- 直接通过全局 `Log` 门面调用：`Log::info()` / `Log::warning()` / `Log::error()` / `Log::debug()`，无需显式 `use`。
- 日志级别使用规范：
  - `error`：安装/更新/卸载插件失败、平滑启动失败、删除目录出错等异常路径
  - `warning`：插件配置格式不合法等非致命问题
  - `info`：插件自动注册登录方式等成功事件
  - `debug`：框架默认 handler 级别，但业务代码中未见显式 debug 调用
- 结构化字段：当前日志以字符串拼接为主，尚未引入 JSON 结构化字段；部分错误日志附带 `$e->getLine()`、`$e->getFile()` 等上下文信息。
- 插件隔离：xbAiModelAgent 插件拥有独立的 `runtime/logs/xbAiModelAgent/` 目录，便于按模块拆分日志。

## 开发者应遵循的规则
1. 统一使用 `Log::info/warning/error/debug` 门面，不要直接实例化 Monolog。
2. 错误日志需包含可定位上下文（如文件名、行号、请求 ID），避免仅记录 `getMessage()`。
3. 新增插件如需独立日志，应在 `config/log.php` 中扩展对应 handler，或沿用 `runtime/logs/<plugin>/` 目录约定。
4. 生产环境建议将日志级别调整为 `INFO` 以上，并接入集中式日志采集（ELK/SLS 等）。