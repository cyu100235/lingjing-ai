---
trigger: always_on
---

# xbCode 插件开发规范与约束

> 本规范基于 xbCode 核心插件的架构设计，适用于所有插件开发。

## 一、枚举规范

### 1.1 枚举存放目录
所有插件枚举必须存放在 `plugin/插件标识/enum` 目录下。

### 1.2 枚举基类继承
所有插件枚举必须继承 `plugin/xbCode/base/BaseEnum.php`。

```php
<?php
namespace plugin\xbUpload\enum;

use plugin\xbCode\base\BaseEnum;

class UploadEnum extends BaseEnum
{
    // 枚举定义
}
```

### 1.3 枚举实现方式

枚举有两种实现方式，根据实际需求选择：

#### 方式一：数组常量（推荐用于简单状态/开关类枚举）

适用于简单的状态、开关、是否等二元或多元枚举，通过常量数组定义，包含 label/value/style 字段。

```php
<?php
namespace plugin\xbCode\enum;

use plugin\xbCode\base\BaseEnum;

/**
 * 封禁状态枚举
 * @copyright 贵州云铺网络科技有限公司
 * @author 楚羽幽 958416459@qq.com
 */
class BanEnum extends BaseEnum
{
    const STATE10 = [
        'label' => '已封禁',
        'value' => '10',
        'style' => '<span class="label label-warning">已封禁</span>',
    ];
    const STATE20 = [
        'label' => '未封禁',
        'value' => '20',
        'style' => '<span class="label label-success">未封禁</span>',
    ];
}
```

**字段说明：**
- `label`: 显示文本
- `value`: 枚举值（字符串类型）
- `style`: HTML 样式标签（可选）

**命名规范：**
- 状态类：`STATE10`、`STATE20`、`STATE30` 等（数字递增）
- 是否类：`YES`、`NO`
- 开关类：`ON`、`OFF`

#### 方式二：类方法（推荐用于复杂业务枚举）

适用于需要返回数组结构的复杂业务枚举，通过静态方法返回关联数组。

```php
<?php
namespace plugin\xbAiGateway\enum;

use plugin\xbCode\base\BaseEnum;

/**
 * AI网关枚举类
 * @copyright 贵州云铺网络科技有限公司
 * @author 楚羽幽 958416459@qq.com
 */
class AiGatewayEnum extends BaseEnum
{
    /**
     * 服务类型
     */
    const TYPE_IMAGE = 'image';      // 图像生成
    const TYPE_AUDIO = 'audio';      // 语音合成
    const TYPE_TEXT = 'text';        // 文本生成

    /**
     * 状态
     */
    const STATUS_DISABLED = 0;  // 禁用
    const STATUS_ENABLED = 1;   // 启用

    /**
     * 服务类型枚举
     * @return array
     */
    public static function serviceType(): array
    {
        return [
            self::TYPE_IMAGE => ['label' => '图像生成', 'value' => self::TYPE_IMAGE],
            self::TYPE_AUDIO => ['label' => '语音合成', 'value' => self::TYPE_AUDIO],
            self::TYPE_TEXT => ['label' => '文本生成', 'value' => self::TYPE_TEXT],
        ];
    }

    /**
     * 状态枚举
     * @return array
     */
    public static function status(): array
    {
        return [
            self::STATUS_DISABLED => ['label' => '禁用', 'value' => self::STATUS_DISABLED, 'icon' => 'CircleCloseFilled', 'color' => 'danger'],
            self::STATUS_ENABLED => ['label' => '启用', 'value' => self::STATUS_ENABLED, 'icon' => 'SuccessFilled', 'color' => 'success'],
        ];
    }
}
```

**字段说明：**
- `label`: 显示文本
- `value`: 枚举值（可为字符串或数字）
- `icon`: Element Plus 图标名（可选）
- `color`: 颜色类型（success/danger/warning/info，可选）

**使用场景：**
- 多个枚举维度需要在一个类中管理
- 需要在枚举中附加图标、颜色等 UI 属性
- 需要动态生成枚举数据

### 1.4 BaseEnum 核心方法
| 方法 | 说明 |
|------|------|
| `toArray()` | 转换为数组，包含 key/label/value |
| `switch()` | 获取开关枚举配置 |
| `status()` | 获取状态枚举（需定义 icon/label） |
| `options(?callback)` | 获取选项枚举 |
| `dict(field)` | 获取字典数据 |
| `getColumn(name, value)` | 获取字段列 |
| `getFieldValue(value, default, field)` | 获取字段值 |

---

## 二、控制器规范

### 2.1 HTTP 请求入口

**重要说明**：所有涉及 **HTTP 网络请求**的控制器必须放在 `plugin/插件标识/app/模块/controller` 目录中。

### 2.1.1 插件模块职责

插件支持多模块架构，每个模块有明确的职责定位：

| 模块 | 职责定位 | 使用场景 | 示例 |
|------|----------|----------|------|
| **admin** | 后台管理模块 | 管理员后台操作、系统配置、数据管理 | 用户管理、插件配置、数据统计 |
| **home** | PC端前台模块 | PC端网站展示、公开访问页面 | 首页、列表页、详情页 |
| **user** | 用户中心模块 | 用户个人操作、会员中心 | 个人资料、订单管理、我的作品 |
| **api** | 第三方API模块 | 提供API接口给第三方系统调用 | 开放API、Webhook、数据接口 |
| **自定义** | 其他业务模块 | 根据业务需求自定义模块 | mobile(移动端)、miniapp(小程序) |

### 2.1.2 模块目录结构

```
plugin/插件标识/
├── app/
│   ├── admin/              # 后台管理模块
│   │   ├── controller/     # HTTP 控制器
│   │   ├── view/           # 视图模板
│   │   └── validate/       # 验证器
│   ├── home/               # PC端前台模块
│   │   ├── controller/
│   │   ├── view/
│   │   └── validate/
│   ├── user/               # 用户中心模块
│   │   ├── controller/
│   │   ├── view/
│   │   └── validate/
│   ├── api/                # 第三方API模块
│   │   └── controller/     # API 控制器
│   └── mobile/             # 自定义模块示例（移动端）
│       ├── controller/
│       └── view/
```

### 2.1.3 模块使用示例

**admin 模块示例（后台管理）：**
```php
// plugin/xbUpload/app/admin/controller/UploadController.php
namespace plugin\xbUpload\app\admin\controller;

use plugin\xbCode\XbController;
use plugin\xbUpload\api\AdminApi;

/**
 * 后台管理 - 文件上传控制器
 */
class UploadController extends XbController
{
    public function index(Request $request)
    {
        // 后台管理列表
        $list = AdminApi::getFileList($request->get());
        return $this->successData($list);
    }
}
```

**home 模块示例（PC端前台）：**
```php
// plugin/xbMovieApp/app/home/controller/MovieController.php
namespace plugin\xbMovieApp\app\home\controller;

use plugin\xbCode\XbController;
use plugin\xbMovieApp\api\HomeApi;

/**
 * PC端前台 - 漫剧展示控制器
 */
class MovieController extends XbController
{
    public function detail(Request $request)
    {
        // 漫剧详情页
        $movie = HomeApi::getMovieDetail($request->get('id'));
        return $this->successRes($movie);
    }
}
```

**user 模块示例（用户中心）：**
```php
// plugin/xbMovieApp/app/user/controller/OrderController.php
namespace plugin\xbMovieApp\app\user\controller;

use plugin\xbCode\XbController;
use plugin\xbMovieApp\api\UserApi;

/**
 * 用户中心 - 订单管理控制器
 */
class OrderController extends XbController
{
    public function myOrders(Request $request)
    {
        // 我的订单列表
        $orders = UserApi::getUserOrders($userId, $request->get());
        return $this->successData($orders);
    }
}
```

**api 模块示例（第三方API）：**
```php
// plugin/xbAiGateway/app/api/controller/GatewayController.php
namespace plugin\xbAiGateway\app\api\controller;

use plugin\xbCode\XbController;
use plugin\xbAiGateway\api\GatewayApi;

/**
 * 第三方API - AI网关接口控制器
 */
class GatewayController extends XbController
{
    public function generate(Request $request)
    {
        // 提供AI生成接口给第三方调用
        $result = GatewayApi::process($request->post());
        return $this->successRes($result);
    }
}
```

### 2.1.4 模块命名规范

- 模块名称使用**小写字母**
- 多个单词使用**下划线**或**驼峰**命名
- 建议使用简短、语义清晰的名称
- 常见模块：`admin`、`home`、`user`、`api`、`mobile`、`miniapp`

### 2.2 控制器基类
所有插件控制器必须继承 `plugin/xbCode/XbController.php`。

```php
<?php
namespace plugin\xbUpload\app\admin\controller;

use plugin\xbCode\XbController;

class UploadController extends XbController
{
    // 控制器代码
}
```

### 2.3 自动路由

**重要说明**：xbCode 框架采用**自动路由机制**，**不需要手动配置路由文件**。

#### 2.3.1 自动路由规则

路由格式：`app/插件标识/模块名称/控制器名称/方法名`

```
URL示例：app/xbCode/admin/Index/index
         ↓    ↓      ↓      ↓     ↓
       前缀 插件标识  模块   控制器  方法
```

#### 2.3.2 路由解析示例

| URL路径 | 对应文件 | 说明 |
|---------|----------|------|
| `app/xbCode/admin/Index/index` | `plugin/xbCode/app/admin/controller/IndexController.php` 的 `index()` 方法 | 后台管理首页 |
| `app/xbUpload/admin/Upload/index` | `plugin/xbUpload/app/admin/controller/UploadController.php` 的 `index()` 方法 | 上传管理列表 |
| `app/xbMovieApp/home/Movie/detail` | `plugin/xbMovieApp/app/home/controller/MovieController.php` 的 `detail()` 方法 | 漫剧详情页 |
| `app/xbMovieApp/user/Order/myOrders` | `plugin/xbMovieApp/app/user/controller/OrderController.php` 的 `myOrders()` 方法 | 我的订单 |
| `app/xbAiGateway/api/Gateway/generate` | `plugin/xbAiGateway/app/api/controller/GatewayController.php` 的 `generate()` 方法 | AI网关接口 |

#### 2.3.3 路由参数传递

**GET 参数：**
```
URL: app/xbMovieApp/home/Movie/detail?id=123&status=1

控制器接收：
public function detail(Request $request)
{
    $id = $request->get('id');      // 123
    $status = $request->get('status'); // 1
}
```

**POST 参数：**
```
URL: app/xbUpload/admin/Upload/upload

控制器接收：
public function upload(Request $request)
{
    $file = $request->post('file');
    $name = $request->post('name');
}
```

#### 2.3.4 路由命名规范

- **插件标识**：使用三段式驼峰命名，如 `xbCode`、`xbUpload`、`xbMovieApp`
- **模块名称**：小写字母，如 `admin`、`home`、`user`、`api`
- **控制器名称**：大驼峰命名（PascalCase），如 `Index`、`Upload`、`Movie`
- **方法名称**：小驼峰命名（camelCase），如 `index`、`myOrders`、`getUserInfo`

### 2.4 控制器职责

**控制器中不允许写业务代码**，所有业务逻辑必须放在 `plugin/插件标识/api` 目录下。

控制器职责：
- 接收 HTTP 请求参数
- 调用 API 业务类处理业务
- 返回 HTTP 响应数据
- 渲染视图页面

### 2.5 控制器与 API 的关系

```
HTTP 请求流程：
客户端请求 
  → app/模块/controller (接收请求)
    → api/业务类 (处理业务逻辑)
      → 返回业务数据
    → controller (返回响应)
  → 客户端接收响应
```

**示例：**
```php
// app/admin/controller/UploadController.php
namespace plugin\xbUpload\app\admin\controller;

use plugin\xbCode\XbController;
use plugin\xbUpload\api\AdminApi;

class UploadController extends XbController
{
    /**
     * HTTP 接口：处理文件上传请求
     */
    public function upload(Request $request)
    {
        // 1. 接收 HTTP 请求参数
        $params = $request->post();
        
        // 2. 调用 API 业务类处理
        $result = AdminApi::uploadFile($params);
        
        // 3. 返回 HTTP 响应
        return $this->successRes($result);
    }
}
```

### 2.6 安全字段过滤

**重要说明**：前端传来的参数必须使用 `ouputFields` 方法进行安全过滤，只保留允许的字段。

#### 2.6.1 方法说明

`ouputFields` 方法来自 `FieldsTrait`，用于过滤数组数据，只保留指定的安全字段。

```php
/**
 * 输出安全字段
 * @param array $data 所需处理数据
 * @param array $fields 安全字段
 * @return array
 */
protected function ouputFields(array $data, array $fields)
```

#### 2.6.2 使用场景

- 接收前端 POST/GET 参数时
- 处理用户提交的数据时
- 需要限制可修改字段时
- 防止恶意字段注入时

#### 2.6.3 使用示例

**基础使用：**
```php
public function save(Request $request)
{
    // 1. 获取前端提交的所有参数
    $allParams = $request->post();
    
    // 2. 定义允许的安全字段
    $allowedFields = ['title', 'content', 'status', 'sort'];
    
    // 3. 使用 ouputFields 过滤参数
    $safeParams = $this->ouputFields($allParams, $allowedFields);
    
    // 4. 调用 API 处理安全参数
    $result = AdminApi::saveData($safeParams);
    
    return $this->success('保存成功');
}
```

**编辑场景：**
```php
public function edit(Request $request)
{
    // 获取提交参数
    $post = $request->post();
    
    // 定义允许修改的字段
    $allowedFields = ['name', 'email', 'phone', 'avatar'];
    
    // 安全过滤
    $safeData = $this->ouputFields($post, $allowedFields);
    
    // 执行业务逻辑
    $result = AdminApi::updateUser($safeData);
    
    return $this->success('更新成功');
}
```

**列表查询场景：**
```php
public function index(Request $request)
{
    // 获取查询参数
    $queryParams = $request->get();
    
    // 只允许查询特定字段
    $allowedFields = ['keyword', 'status', 'page', 'limit'];
    
    // 安全过滤
    $safeQuery = $this->ouputFields($queryParams, $allowedFields);
    
    // 查询数据
    $list = AdminApi::getList($safeQuery);
    
    return $this->successData($list);
}
```

#### 2.6.4 最佳实践

1. **始终过滤**：所有接收前端参数的接口都应该使用 `ouputFields` 过滤
2. **明确字段**：明确定义允许的字段列表，不要使用通配符
3. **场景分离**：不同操作场景使用不同的字段列表
4. **配合验证器**：`ouputFields` 用于字段过滤，验证器用于数据校验，两者配合使用

```php
// 完整示例：过滤 + 验证
public function create(Request $request)
{
    // 1. 获取参数
    $post = $request->post();
    
    // 2. 安全字段过滤
    $allowedFields = ['title', 'content', 'category_id', 'tags'];
    $safeParams = $this->ouputFields($post, $allowedFields);
    
    // 3. 数据验证
    xbValidate(ArticleValidate::class, $safeParams, 'add');
    
    // 4. 业务处理
    $result = AdminApi::createArticle($safeParams);
    
    return $this->success('创建成功', $result);
}
```

#### 2.6.5 注意事项

- `ouputFields` 只会保留在 `$fields` 数组中存在的字段
- 不在白名单中的字段会被自动过滤掉
- 该方法不会验证数据格式，需要配合验证器使用
- 敏感字段（如 id、user_id、create_time 等）不应包含在允许字段中

---

## 三、业务代码规范（API 目录）

### 3.1 API 目录定位

**重要说明**：`plugin/插件标识/api` 目录**并非 HTTP 网络请求接口**，而是存放**业务类接口**，用于：
- 封装插件的核心业务逻辑
- 提供可复用的业务方法
- **供其他插件或控制器调用的接口类文件**
- 实现业务逻辑与控制器分离

### 3.2 API 目录结构
```
plugin/插件标识/
├── api/                    # 业务逻辑接口目录
│   ├── AdminApi.php        # 管理端业务接口
│   ├── AppApi.php          # 应用端业务接口
│   └── ...                 # 其他业务接口类
```

### 3.3 API 类规范

API 类负责所有业务逻辑处理：
- 数据查询与处理
- 业务规则验证
- 复杂业务逻辑封装
- 返回业务数据供控制器或他插件使用

```php
<?php
namespace plugin\xbUpload\api;

class AdminApi
{
    /**
     * 上传文件业务接口
     * 可被控制器或其他插件调用
     * 
     * @param array $params 参数
     * @return array 业务数据
     */
    public static function uploadFile(array $params): array
    {
        // 业务逻辑处理
        // 返回业务数据
        return [
            'code' => 200,
            'msg' => '上传成功',
            'data' => $fileInfo
        ];
    }
}
```

### 3.4 调用方式

**控制器调用：**
```php
// 控制器中调用 API 类
public function upload(Request $request)
{
    $params = $request->post();
    $result = AdminApi::uploadFile($params);
    return $this->successRes($result);
}
```

**其他插件调用：**
```php
// 其他插件中调用
use plugin\xbUpload\api\AdminApi;

$result = AdminApi::uploadFile($params);
```

---

## 四、验证器规范

### 4.1 验证器目录
验证器存放在 `plugin/插件标识/app/validate` 目录下。

### 4.2 验证器使用场景
所有 `api` 目录下的接口类，涉及 **添加** 和 **修改** 操作时，必须使用验证器。

### 4.3 验证器调用方式
```php
// 使用 xbValidate 助手函数
xbValidate(AdminValidate::class, $post, 'add');  // 添加场景
xbValidate(AdminValidate::class, $post, 'edit'); // 修改场景
```

---

## 五、插件安装规范

### 5.1 自动导入文件
插件安装时，系统自动导入以下文件：

| 文件 | 说明 |
|------|------|
| `plugin/插件标识/install.sql` | 数据库表结构 |
| `plugin/插件标识/config/menu.php` | 后台菜单配置 |
| `plugin/插件标识/config/crontab.php` | 定时任务配置 |

### 5.2 install.sql 规范
```sql
-- 删除表语句
DROP TABLE IF EXISTS `xb_table_name`;
-- 表结构定义
CREATE TABLE `xb_table_name` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '序号',
  ...
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='表说明';
```

### 5.3 menu.php 规范
菜单配置数组，每项包含：
- `title`: 菜单名称
- `path`: 菜单路径
- `method`: 请求方式
- `type`: 类型（10目录/20菜单/30按钮）
- `icon`: 菜单图标
- `is_show`: 是否显示
- `state`: 状态
- `sort`: 排序
- `children`: 子菜单

---

## 六、插件标识命名规范

### 6.1 命名格式
插件标识使用 **三段式驼峰命名**：
- `xbCode` - 核心框架
- `xbUpload` - 文件上传
- `xbMovieApp` - 漫剧应用

### 6.2 目录结构
```
plugin/
├── xbCode/           # 核心插件
├── xbUpload/         # 上传插件
├── xbMovieApp/       # 漫剧应用
├── xbMovieScene/     # 漫剧场景
└── ...
```

---

## 七、核心文件说明

| 文件路径 | 说明 |
|----------|------|
| `plugin/xbCode/XbController.php` | 控制器基类，提供路由解析方法 |
| `plugin/xbCode/base/BaseEnum.php` | 枚举基类，所有枚举需继承 |
| `plugin/xbCode/builder/` | UI构建器组件 |
| `plugin/xbCode/api/` | 核心业务接口 |

---

## 八、控制器响应方法（JsonTrait）

### 8.1 方法引入
控制器通过继承 `XbController` 后，自动引入 `JsonTrait`，可直接使用以下响应方法。

### 8.2 响应方法说明
| 方法 | 说明 | 使用场景 |
|------|------|----------|
| `success(msg, data)` | 返回成功并弹出通知消息 | 操作成功提示 |
| `successRes(data, msg)` | 返回成功数据（不弹通知） | 返回JSON数据 |
| `successData(model)` | 返回分页/列表数据 | 列表接口 |
| `fail(msg, status)` | 返回失败消息 | 操作失败提示 |
| `kickout(msg)` | 踢出登录 | 登录失效 |
| `redirect(url, delay, target)` | 重定向到指定URL | 页面跳转 |
| `route(path, routeRaw)` | 执行路由跳转 | 内部路由 |
| `reload(msg, delay)` | 刷新当前页面 | 刷新操作 |
| `json(msg, status, data, option)` | 原始JSON返回 | 自定义响应 |

### 8.3 使用示例
```php
class UploadController extends XbController
{
    public function index(Request $request)
    {
        // 返回成功并通知
        return $this->success('保存成功');
        
        // 返回成功数据
        return $this->successRes($builder);
        
        // 返回分页列表
        return $this->successData($list);
        
        // 返回失败
        return $this->fail('数据不存在');
        
        // 页面重定向
        return $this->redirect('/admin/index');
        
        // 踢出登录
        return $this->kickout('登录已过期');
    }
}
```

---

## 九、页面渲染规范

**重要说明**：xbCode 基于 **webman + amis** 框架进行开发，所有页面渲染必须使用以下指定的渲染器类。

### 9.1 渲染器类说明

| 渲染类型 | 渲染器类 | 说明 |
|----------|----------|------|
| 表格渲染 | `plugin/xbCode/builder/Renders/XbCrud.php` | 用于列表页面、数据表格展示 |
| 表单渲染 | `plugin/xbCode/builder/Renders/XbForm.php` | 用于表单页面、数据编辑 |
| 选项卡表单渲染 | `plugin/xbCode/builder/Renders/XbTabForm.php` | 用于多选项卡的表单页面 |
| Vue页面渲染 | `plugin/xbCode/trait/ViewsTrait.php` display方法 | 用于渲染自定义Vue远程页面 |

### 9.2 表格渲染（XbCrud）

适用于列表页面、数据表格展示，支持分页、筛选、排序、操作按钮等功能。

#### 9.2.1 核心方法

| 方法 | 说明 |
|------|------|
| `make(?callable $callback)` | 创建表格实例，传入回调函数配置 |
| `addColumn($name, $title, $option)` | 添加普通文本列 |
| `addColumnImage($name, $label, $option)` | 添加图片列 |
| `addColumnTag($name, $label, $option)` | 添加标签列 |
| `addColumnDateTime($name, $label, $option)` | 添加日期时间列 |
| `addColumnAvatar($name, $label, $option)` | 添加头像列 |
| `addColumnNumber($name, $label, $option)` | 添加数字列 |
| `addColumnSelect($name, $label, $quickEdit, $option)` | 添加下拉选择列（快速编辑） |
| `addColumnSwitch($name, $label, $option)` | 添加开关列 |
| `addColumnMap($name, $label, $mapping, $option)` | 添加映射转换列 |
| `addColumnCard($name, $label, $fields, $option)` | 添加卡片列 |
| `addColumnTpl($name, $label, $tpl, $option)` | 添加模板列 |
| `addColumnIcon($name, $label, $option)` | 添加图标列 |
| `addColumnProgress($name, $label, $option)` | 添加进度条列 |
| `addColumnUrl($name, $label, $url, $option)` | 添加URL列 |
| `addColumnLink($name, $title, $url, $option)` | 添加链接列 |
| `addColumnDialog($name, $label, $url, $option)` | 添加弹窗列 |
| `addColumnDrawer($name, $title, $url, $option)` | 添加抽屉列 |
| `addColumnConfirm($name, $title, $url, $content, $cTitle, $option)` | 添加确认操作列 |
| `addColumnApiUrl($name, $label, $url, $option)` | 添加API请求列 |
| `addColumnDownload($name, $title, $url, $option)` | 添加下载列 |
| `addColumnAudio($name, $label, $option)` | 添加音频列 |
| `addColumnVideo($name, $label, $option)` | 添加视频列 |
| `addColumnVueRemote($name, $label, $url, $option)` | 添加Vue远程组件列 |
| `addColumnVueRender($name, $label, $template, $option)` | 添加Vue渲染列 |
| `addColumnVue($name, $label, $path, $option)` | 添加Vue本地组件列 |
| `setActionConfig($key, $value)` | 设置操作列配置 |
| `addHeaderDialog($title, $url, $option)` | 添加头部弹窗按钮 |
| `addHeaderActionDialog($title, $url, $option)` | 添加头部操作弹窗 |
| `addRightActionDialog($title, $url, $option)` | 添加右侧操作弹窗 |
| `addRightActionConfirm($title, $url, $option)` | 添加右侧确认操作 |
| `setData($data)` | 设置表单数据 |
| `setPrimaryKey($key)` | 设置主键字段 |

#### 9.2.2 使用示例

```php
// plugin/xbCode/app/admin/controller/AdminController.php
namespace plugin\xbCode\app\admin\controller;

use plugin\xbCode\XbController;
use plugin\xbCode\builder\Builder;
use plugin\xbCode\builder\Renders\XbCrud;
use plugin\xbCode\api\Url;

class AdminController extends XbController
{
    public function index(Request $request)
    {
        // 数据接口响应
        $act = $request->get('_act');
        if ($act) {
            $data = Admin::with(['role'])->paginate();
            return $this->successData($data);
        }
        
        // 渲染表格
        $builder = Builder::crud(function (XbCrud $builder) {
            // 添加头部弹窗按钮
            $builder->addHeaderDialog('添加用户', Url::make('Admin/add'), [
                'title' => '添加管理员用户',
                'size' => 'md',
            ]);
            
            // 添加普通列
            $builder->addColumn('id', '序号')->width(100);
            $builder->addColumn('username', '登录账号');
            $builder->addColumn('nickname', '用户昵称');
            $builder->addColumn('role.title', '所属角色')->minWidth(180);
            $builder->addColumn('login_ip', '登录IP')->minWidth(150);
            
            // 添加图片列
            $builder->addColumnImage('avatar', '用户头像');
            
            // 设置操作列宽度
            $builder->setActionConfig('width', 130);
            
            // 添加右侧操作弹窗
            $builder->addRightActionDialog('修改', Url::make('edit'), [
                'title' => '修改管理员用户',
                'size' => 'md',
            ]);
            
            // 添加右侧确认操作
            $builder->addRightActionConfirm('删除', Url::make('del'));
        });
        
        return $this->successRes($builder);
    }
}
```

### 9.3 表单渲染（XbForm）

适用于表单页面、数据编辑场景，支持表单项、验证、提交等功能。

#### 9.3.1 核心方法

| 方法 | 说明 |
|------|------|
| `make(?callable $callback)` | 创建表单实例，传入回调函数配置 |
| `addRow($type, $field, $title, $value, $option)` | 添加表单项（通用方法） |
| `addRowInput($field, $title, $value, $option)` | 添加输入框 |
| `addRowTextarea($field, $title, $value, $option)` | 添加文本域 |
| `addRowNumber($field, $title, $value, $option)` | 添加数字输入 |
| `addRowPassword($field, $title, $value, $option)` | 添加密码框 |
| `addRowSelect($field, $title, $value, $option)` | 添加下拉选择 |
| `addRowCheckbox($field, $title, $value, $option)` | 添加复选框 |
| `addRowRadio($field, $title, $value, $option)` | 添加单选框 |
| `addRowSwitch($field, $title, $value, $option)` | 添加开关 |
| `addRowDate($field, $title, $value, $option)` | 添加日期选择 |
| `addRowDateTime($field, $title, $value, $option)` | 添加日期时间选择 |
| `addRowDateRange($field, $title, $value, $option)` | 添加日期范围 |
| `addRowDateTimeRange($field, $title, $value, $option)` | 添加日期时间范围 |
| `addRowTime($field, $title, $value, $option)` | 添加时间选择 |
| `addRowImage($field, $title, $value, $option)` | 添加图片上传 |
| `addRowVideo($field, $title, $value, $option)` | 添加视频上传 |
| `addRowAudio($field, $title, $value, $option)` | 添加音频上传 |
| `addRowFile($field, $title, $value, $option)` | 添加文件上传 |
| `addRowEditor($field, $title, $value, $option)` | 添加富文本编辑器 |
| `addRowMarkdown($field, $title, $value, $option)` | 添加Markdown编辑器 |
| `addRowTreeSelect($field, $title, $value, $option)` | 添加树形选择 |
| `addRowCity($field, $title, $value, $option)` | 添加城市选择 |
| `addRowColor($field, $title, $value, $option)` | 添加颜色选择 |
| `addRowHidden($field, $value)` | 添加隐藏字段 |
| `addRowStatic($field, $title, $value)` | 添加静态文本 |
| `addRowDivider($title)` | 添加分隔线 |
| `addRowAlert($title, $body, $level)` | 添加提示框 |
| `addRowGrid($columns)` | 添加栅格布局 |
| `addRowFlex($name, $columns)` | 添加Flex布局 |
| `addRowTabs($tabs)` | 添加选项卡 |
| `addRowFieldSet($title, $rows)` | 添加字段集 |
| `addRowGroup($name, $rows)` | 添加分组 |
| `addRowRenderComponent($component)` | 添加成品组件 |
| `addRowRenderComponents($components)` | 批量添加成品组件 |
| `addFormButton($option)` | 设置自定义提交按钮 |
| `setSaveApi($api)` | 设置保存接口 |
| `setSaveMethod($method)` | 设置保存方法（GET/POST/PUT/DELETE） |
| `setData($data)` | 设置表单数据 |
| `useForm()` | 获取表单组件实例 |

#### 9.3.2 使用示例

```php
// plugin/xbCode/app/admin/controller/AdminController.php
namespace plugin\xbCode\app\admin\controller;

use plugin\xbCode\XbController;
use plugin\xbCode\builder\Builder;
use plugin\xbCode\builder\Renders\XbForm;
use plugin\xbCode\builder\Components\Form\Group;

class AdminController extends XbController
{
    public function profile(Request $request)
    {
        $model = Admin::where('id', $request->uid)->find();
        $formData = $model->toArray();
        
        $builder = Builder::form(function (XbForm $builder) {
            $builder->useForm()->wrapWithPanel(false);
            
            // 添加输入框
            $builder->addRowInput('username', '登录账号')->disabled(true);
            $builder->addRowInput('nickname', '用户昵称');
            
            // 添加密码框
            $builder->addRowPassword('originpwd', '原登录密码');
            $builder->addRowPassword('newpassword', '新登录密码');
            
            // 添加图片上传
            $builder->addRowUploadImage('upload', '用户头像');
        });
        
        $builder->setSaveMethod('PUT');
        $builder->setData($formData);
        
        return $this->successRes($builder);
    }
    
    // 带Flex布局的表单示例
    private function formView()
    {
        $roles = AdminRole::column('title as label,id as value');
        
        $builder = Builder::form(function (XbForm $builder) use ($roles) {
            // Flex布局
            $builder->addRowFlex('login', [
                $builder->addRowUploadImage('avatar', ''),
                Group::make()->className('flex-1')->body([
                    $builder->addRowInput('username', '登录账号')->columnRatio(12),
                    $builder->addRowInput('password', '登录密码')->className('mt-1')->password(),
                ]),
            ])->justify('flex-start')->alignItems('start');
            
            // 分组
            $builder->addRowGroup('user', [
                $builder->addRowSelect('role_id', '所属角色')->options($roles),
                $builder->addRowInput('nickname', '用户昵称'),
            ]);
        });
        
        return $builder;
    }
}
```

### 9.4 选项卡表单渲染（XbTabForm）

适用于多选项卡的表单页面，将复杂表单拆分为多个选项卡。

#### 9.4.1 核心方法

| 方法 | 说明 |
|------|------|
| `make(?callable $callback)` | 创建实例 |
| `addTab($name, $title, $components)` | 添加选项卡（components为数组） |
| `setTabsField($field)` | 设置选项卡字段名 |
| `useTabs()` | 获取选项卡实例 |
| `setSaveApi($api)` | 设置保存接口 |
| `setSaveMethod($method)` | 设置保存方法 |
| `setData($data)` | 设置表单数据 |

#### 9.4.2 使用示例

```php
// plugin/xbCode/app/admin/controller/PluginsController.php
namespace plugin\xbCode\app\admin\controller;

use plugin\xbCode\XbController;
use plugin\xbCode\builder\Builder;
use plugin\xbCode\builder\Renders\XbTabForm;

class PluginsController extends XbController
{
    public function config()
    {
        $pluginName = request()->get('name', '');
        
        if (request()->method() == 'POST') {
            $post = request()->post();
            // 保存配置...
            return $this->success('保存成功');
        }
        
        // 获取配置数据
        $formData = ConfigApi::make($path)->get();
        
        // 创建选项卡表单
        $builder = Builder::tabForm(function (XbTabForm $builder) use ($pluginName) {
            // 获取模板规则（数组格式）
            $template = PluginsApi::make()->config($pluginName);
            foreach ($template as $value) {
                // 添加选项卡（数组格式）
                $builder->addTab($value['name'], $value['title'], $value['body']);
            }
        });
        
        $api = Url::make('config')->query(['name' => $pluginName]);
        $builder->setSaveApi($api);
        $builder->setSaveMethod('POST');
        $builder->setData($formData);
        
        return $this->successRes($builder);
    }
}
```

**注意**：XbTabForm 的 addTab 方法第三个参数是组件数组，每个元素需要符合 amis 的表单项格式。

### 9.5 Vue页面渲染（display方法）

适用于渲染自定义Vue远程页面，控制器需要继承 `XbController`，使用 `ViewsTrait` 的 `display()` 方法。

```php
// plugin/xbCode/app/admin/controller/IndexController.php
namespace plugin\xbCode\app\admin\controller;

use plugin\xbCode\XbController;

class IndexController extends XbController
{
    /**
     * 渲染Vue远程页面
     * @return \support\Response
     */
    public function toolbar()
    {
        $toolbar = $this->getConfig('toolbar', []);
        $toolbar = list_sort_by($toolbar, 'sort', 'asc');
        $toolbar = array_column($toolbar, 'name');
        
        // 传递变量给Vue页面
        return $this->display([
            'toolbar' => $toolbar
        ]);
    }
    
    /**
     * 获取工作台远程视图
     * @return \support\Response
     */
    public function workbench()
    {
        $workbench = $this->getConfig('workbench', []);
        $workbench = list_sort_by($workbench, 'sort', 'asc');
        $workbench = array_column($workbench, 'name');
        
        return $this->display([
            'workbench' => $workbench
        ]);
    }
    
    /**
     * 渲染指定Vue文件
     * @return \support\Response
     */
    public function special()
    {
        $vars = ['data' => '传递给Vue的数据'];
        
        // 渲染指定的Vue文件（需要提供完整路径）
        return $this->display($vars, 'app/admin/view/index/special');
    }
}
```

### 9.6 渲染场景对照表

| 业务场景 | 推荐渲染器 | 使用方式 |
|----------|------------|----------|
| 数据列表/管理表格 | XbCrud | `Builder::crud(function($b){})` → `$this->successRes()` |
| 单个表单/数据编辑 | XbForm | `Builder::form(function($b){})` → `$this->successRes()` |
| 分组表单/多选项卡 | XbTabForm | `Builder::tabForm(function($b){})` → `$this->successRes()` |
| 自定义Vue页面 | display() | `$this->display($vars, $file)` |

### 9.7 响应模式

| 方法 | 说明 | 使用场景 |
|------|------|----------|
| `$this->successRes($data)` | 返回渲染器构建的数据 | XbCrud/XbForm/XbTabForm |
| `$this->successData($data)` | 返回分页/列表数据 | 数据接口（_act=1） |
| `$this->display($vars)` | 渲染Vue页面 | 自定义Vue视图 |

### 9.8 组件命名规范

**XbCrud 表格列方法命名**：`addColumn` + 列类型（如 Image、Tag、DateTime）
**XbForm 表单项方法命名**：`addRow` + 表单类型（如 Input、Textarea、Select）

---

## 十、模型规范

### 10.1 模型基类继承

所有插件模型必须继承 `plugin/xbCode/Model.php`（即 `plugin\xbCode\Model`），该类已内置 SAAS 多租户支持、自动时间戳等能力。

```php
<?php
namespace plugin\xbUpload\app\model;

use plugin\xbCode\Model;

class UploadFile extends Model
{
    // 模型代码
}
```

### 10.2 模型存放目录

模型文件存放在 `plugin/插件标识/app/model` 目录下。

```
plugin/插件标识/
├── app/
│   └── model/
│       ├── Order.php
│       └── OrderItem.php
```

### 10.3 模型继承链

```
think\Model
  └── plugin\xbCode\base\BaseModel    # 自动时间戳（create_at / update_at）
        └── plugin\xbCode\Model       # SAAS 多租户全局范围 + 常用方法
              └── 各插件业务模型
```

| 类 | 说明 |
|---|---|
| `plugin\xbCode\base\BaseModel` | 开启自动时间戳，字段为 `create_at` / `update_at` |
| `plugin\xbCode\Model` | 全局 SAAS appid 查询范围、写入/删除前自动注入 appid |

### 10.4 关联关系

使用 ThinkORM 标准关联方法定义，方法权限为 `protected`。

```php
class Admin extends Model
{
    /**
     * 关联角色（HasOne）
     * @return \think\model\relation\HasOne
     */
    protected function role()
    {
        return $this->hasOne(AdminRole::class, 'id', 'role_id');
    }
}
```

**常用关联方法：**
| 方法 | 说明 |
|------|------|
| `hasOne($model, $foreignKey, $localKey)` | 一对一关联 |
| `hasMany($model, $foreignKey, $localKey)` | 一对多关联 |
| `belongsTo($model, $foreignKey, $localKey)` | 反向关联 |
| `belongsToMany($model, $table, $foreignKey, $localKey)` | 多对多关联 |

### 10.5 属性修改器

使用 `set{Field}Attr` / `get{Field}Attr` 定义字段的写入/读取修改器，方法权限为 `protected`。

```php
class Admin extends Model
{
    /**
     * 写入修改器：存储前处理头像路径
     */
    protected function setAvatarAttr($value)
    {
        if ($value && PluginsApi::make()->exists('xbUpload')) {
            $value = Files::make()->path($value);
        }
        return $value;
    }

    /**
     * 读取修改器：读取时还原为完整 URL
     */
    protected function getAvatarAttr($value)
    {
        if ($value && PluginsApi::make()->exists('xbUpload')) {
            $value = Files::make()->url($value);
        }
        return $value;
    }

    /**
     * 写入修改器：密码自动加密
     */
    protected function setPasswordAttr($value)
    {
        if ($value) {
            $value = PasswdUtil::create($value);
        }
        return $value;
    }
}
```

### 10.6 JSON 字段

需要自动序列化/反序列化的 JSON 字段，通过 `$json` 和 `$jsonAssoc` 属性声明：

```php
class AdminRole extends Model
{
    // 声明 JSON 字段
    protected $json = ['rule'];
    // JSON 数据返回数组（而非对象）
    protected $jsonAssoc = true;
}
```

### 10.7 pickOption 选择器方法

`plugin\xbCode\Model` 内置 `pickOption` 静态方法，用于快速获取下拉选择器数据：

```php
// 默认返回 id as value, title as label
$options = AdminRole::pickOption();

// 自定义字段
$options = AdminRole::pickOption('id as value,name as label');
```

### 10.8 注意事项

- 模型中**不允许写业务逻辑**，复杂业务封装到 `api/` 目录的业务类中
- 敏感字段（如密码）必须通过写入修改器加密处理
- 需要关联上传文件插件时，应先通过 `PluginsApi::make()->exists('xbUpload')` 判断插件是否存在
- 自动时间戳字段为 `create_at` / `update_at`，**不是** `created_at` / `updated_at`

---

**注意**：xbCode 核心插件不应包含其他插件的业务代码，业务代码应放在各自插件目录下。
