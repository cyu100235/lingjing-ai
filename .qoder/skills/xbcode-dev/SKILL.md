---
name: xbcode-dev
description: 基于 webman 框架和 xbCode 插件（AMIS 渲染器）进行后端编程开发。涵盖控制器、CRUD 表格、表单、枚举、模型、验证器、插件开发等代码生成规范。在涉及 xbCode、webman、AMIS、积木云、插件开发、后台管理系统等场景时自动应用。
---

# xbCode 插件开发规范

## 技术栈

- 框架：webman（PHP  workerman）
- ORM：ThinkORM（think\Model）
- 前端：百度 AMIS（JSON 配置驱动）
- 渲染器：xbCode Builder（PHP 链式调用生成 AMIS JSON）

## 核心插件

系统运行依赖以下四个核心插件，缺一不可：

| 插件 | 职责 | 说明 |
|------|------|------|
| **xbCode** | 核心框架 | 提供 AMIS 渲染器、BaseController/BaseModel/BaseEnum/BasePlugin、插件管理、菜单管理、配置管理、数据库工具 |
| **xbCrontab** | 定时任务 | Cron 表达式调度引擎，插件通过 `config/crontab.php` 注册定时任务 |
| **xbUpload** | 文件存储 | 统一管理多云存储（本地/OSS/COS 等），表单上传组件依赖此插件 |
| **xbDeveloper** | 开发辅助 | 插件创建、打包、导出、SQL 执行、Git 仓库管理 |

依赖关系：xbCrontab / xbUpload / xbDeveloper 均依赖 xbCode；其他业务插件通常同时依赖这四个核心插件。

## 目录规范

```
plugin/{pluginName}/
├── app/
│   ├── admin/
│   │   ├── controller/       # 后台控制器
│   │   └── view/             # HTML/Vue 视图（按模块划分）
│   ├── model/                # 数据模型
│   └── validate/             # 数据验证器
├── api/                      # 对外 API 类
├── config/                   # 插件配置
├── enum/                     # 枚举类
├── public/                   # 静态资源
└── setting/tabs/             # 插件设置页
```

## 数据库规范

### 表命名

- 表名由**小写字母 a-z 及下划线**组成
- 插件数据表必须以**插件标识为前缀**，如 `foo` 插件的 article 表命名为 `foo_article`
- 主键统一为 `id`，作为索引

### 建表标准

```sql
CREATE TABLE `foo_article` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL DEFAULT '',
  `status` varchar(10) NOT NULL DEFAULT '10',
  `create_at` datetime DEFAULT NULL,
  `update_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

| 项 | 规范 |
|----|------|
| 存储引擎 | **InnoDB** |
| 字符集 | **utf8mb4_general_ci** |
| 时间字段 | 建议使用 **DateTime**（对应 BaseModel 的 `create_at` / `update_at`） |
| 状态字段 | 使用枚举值 **10、20、30...**（禁用/启用/其他），配合枚举类使用 |

### 状态字段设计

状态字段统一使用字符串类型存储枚举值，步长为 10：

| 值 | 含义 |
|----|------|
| 10 | 禁用 / 否 / 未开始 |
| 20 | 启用 / 是 / 进行中 |
| 30 | 其他业务状态 |

状态字段必须配套创建枚举类（继承 `BaseEnum`），禁止在代码中硬编码状态值。

## 控制器开发

### 基础规范

- 控制器仅负责**接收请求参数**与**返回响应**，业务逻辑统一交由 `api/` 目录下的**接口能力类**处理
- `api/` 目录下的能力类中，凡是涉及**增加、修改、删除**（Create / Update / Delete）这三个写操作的，都必须**广播对应事件**，方便其他插件监听并做扩展操作
- 后台控制器继承 `plugin\xbCode\app\admin\controller\BaseController`
- 可用 trait：`JsonTrait`（JSON 响应）、`ViewsTrait`（视图渲染）、`ConfigTrait`（配置读取）、`FieldsTrait`（字段辅助）
- 所有接口返回 JSON，`$this->success()` 前端会弹通知，`$this->successRes()` 纯数据返回
- 直接使用全局 `request()` 函数获取请求对象，不注入 `Request` 类
- 代码符合 PSR-4 自动加载规范
- 类属性及方法以小写开头驼峰命名（如 `$userName`、`public function getList()`）
- 类属性及方法必须包含完整注释（概述、参数、返回类型）

### 标准 CRUD 控制器模板

```php
namespace plugin\MyPlugin\app\admin\controller;

use plugin\xbCode\api\Url;
use plugin\xbCode\builder\Builder;
use plugin\xbCode\builder\Renders\XbCrud;
use plugin\xbCode\builder\Renders\XbForm;
use plugin\MyPlugin\app\model\MyModel;

class MyController extends BaseController
{
    /**
     * 列表页
     * @return \support\Response
     */
    public function index()
    {
        if (request()->get('_act')) {
            // 数据接口：返回分页数据
            $data = MyModel::order('id desc')->paginate();
            return $this->successData($data);
        }
        // 页面接口：返回 AMIS CRUD 配置
        $builder = Builder::crud(function (XbCrud $builder) {
            $builder->addHeaderDialog('添加', Url::make('add'));
            $builder->addColumn('id', '序号')->width(80);
            $builder->addColumn('name', '名称');
            $builder->addRightActionDialog('修改', Url::make('edit'));
            $builder->addRightActionConfirm('删除', Url::make('del'));
        });
        return $this->successRes($builder);
    }

    /**
     * 添加
     * @return \support\Response
     */
    public function add()
    {
        if (request()->method() == 'POST') {
            $post = request()->post();
            $model = new MyModel;
            if (!$model->save($post)) {
                return $this->fail('保存失败');
            }
            return $this->success('保存成功');
        }
        $builder = $this->formView();
        $builder->setSaveMethod('POST');
        return $this->successRes($builder);
    }

    /**
     * 修改
     * @return \support\Response
     */
    public function edit()
    {
        $id = request()->get('id');
        $model = MyModel::where('id', $id)->find();
        if (!$model) {
            return $this->fail('数据不存在');
        }
        if (request()->method() == 'PUT') {
            $post = request()->post();
            if (!$model->save($post)) {
                return $this->fail('保存失败');
            }
            return $this->success('保存成功');
        }
        $builder = $this->formView();
        $builder->setSaveMethod('PUT');
        $builder->setData($model->toArray());
        return $this->successRes($builder);
    }

    /**
     * 删除
     * @return \support\Response
     */
    public function del()
    {
        $id = request()->get('id');
        $model = MyModel::where('id', $id)->find();
        if (!$model) {
            return $this->fail('数据不存在');
        }
        if (!$model->delete()) {
            return $this->fail('删除失败');
        }
        return $this->success('删除成功');
    }

    /**
     * 表单视图（私有方法复用）
     * @return XbForm
     */
    private function formView()
    {
        return Builder::form(function (XbForm $builder) {
            $builder->addRowInput('name', '名称')->required();
            $builder->addRowSelect('status', '状态')->options(StateEnum::options());
        });
    }
}
```

### 常用响应方法

| 方法 | 用途 |
|------|------|
| `$this->success($msg, $data)` | 成功 + 前端通知 |
| `$this->successRes($data, $msg)` | 成功纯数据（无通知） |
| `$this->successData($paginate)` | 返回分页数据（ items/total/page ） |
| `$this->fail($msg, $status)` | 失败 + 通知 |
| `$this->route($path)` | 前端路由跳转 |
| `$this->reload($msg)` | 前端刷新页面 |

## CRUD 表格构建

```php
$builder = Builder::crud(function (XbCrud $builder) {
    // 头部按钮
    $builder->addHeaderDialog('添加', Url::make('add'), ['size' => 'md']);
    $builder->addHeaderDrawer('抽屉添加', Url::make('add_drawer'));
    $builder->addHeaderAjax('批量启用', Url::make('batch_enable'), ['method' => 'PUT']);

    // 列定义
    $builder->addColumn('id', '序号')->width(80)->sortable();
    $builder->addColumn('name', '名称')->minWidth(150);
    $builder->addColumnImage('avatar', '头像')->width(80);
    $builder->addColumnSwitch('status', '状态')->width(100);
    $builder->addColumnMapping('type', '类型', TypeEnum::dict());
    $builder->addColumnDate('create_at', '创建时间')->width(180);
    $builder->addColumn('user.nickname', '关联用户'); // 关联模型

    // 操作列
    $builder->setActionConfig('width', 150);
    $builder->addRightActionDialog('修改', Url::make('edit'));
    $builder->addRightActionConfirm('删除', Url::make('del'), ['msg' => '确认删除？']);
    $builder->addRightActionLink('详情', Url::make('detail'));

    // 批量操作
    $builder->addBulkActionConfirm('批量删除', Url::make('batch_del'));

    // 筛选查询
    $builder->addFilterInput('name', '名称');
    $builder->addFilterSelect('status', '状态')->options(StateEnum::options());
    $builder->addFilterDateRange('create_at', '创建时间');
});
```

### 常用列方法链

- `width(int)` / `minWidth(int)` — 列宽
- `sortable()` — 开启排序
- `searchable()` — 快速搜索

## 表单构建

```php
$builder = Builder::form(function (XbForm $builder) {
    // 基础输入
    $builder->addRowInput('name', '名称')->required();
    $builder->addRowInput('password', '密码')->password();
    $builder->addRowTextarea('desc', '描述')->rows(4);

    // 选择类
    $builder->addRowSelect('status', '状态')->options(StateEnum::options());
    $builder->addRowRadios('gender', '性别')->options(GenderEnum::options());
    $builder->addRowCheckboxes('tags', '标签')->options(TagEnum::options());
    $builder->addRowSwitch('is_top', '是否置顶');

    // 文件/图片
    $builder->addRowUploadImage('cover', '封面图');
    $builder->addRowUploadFile('file', '附件');

    // 数字/日期
    $builder->addRowInputNumber('sort', '排序')->min(0)->max(999);
    $builder->addRowDate('start_date', '开始日期');
    $builder->addRowDateRange('date_range', '日期范围');

    // 编辑器
    $builder->addRowEditor('content', '内容');
    $builder->addRowRichText('detail', '富文本');

    // 树形/级联
    $builder->addRowTreeSelect('pid', '上级')->options($treeData);
    $builder->addRowCascader('region', '地区')->options(RegionEnum::options());

    // 分组布局
    $builder->addRowGroup('base', [
        $builder->addRowInput('name', '名称'),
        $builder->addRowInput('phone', '电话'),
    ]);

    // Grid 多列布局（一行两列或多列）
    $builder->addRowGrid('row1', [
        $builder->addRowInput('a', '字段A'),
        $builder->addRowInput('b', '字段B'),
    ]);
});

// 设置表单数据（编辑时）
$builder->setData($model->toArray());
// 设置提交方法
$builder->setSaveMethod('PUT');
```

### 表单组件常用链式方法

- `required()` — 必填
- `disabled(bool)` — 禁用
- `description(string)` — 字段说明
- `placeholder(string)` — 占位文本
- `defaultValue(mixed)` — 默认值
- `className(string)` — CSS 类名

## 枚举规范

枚举类必须继承 `plugin\xbCode\base\BaseEnum`，状态值使用 **10、20、30...** 步长，禁止硬编码：

```php
namespace plugin\MyPlugin\enum;

use plugin\xbCode\base\BaseEnum;

class StateEnum extends BaseEnum
{
    const STATE10 = [
        'label' => '禁用',
        'value' => '10',
        'style' => '<span class="label label-danger">禁用</span>',
        'icon' => 'fa fa-ban',
    ];
    const STATE20 = [
        'label' => '启用',
        'value' => '20',
        'style' => '<span class="label label-success">启用</span>',
        'icon' => 'fa fa-check',
    ];
}
```

### 枚举常用方法

| 方法 | 返回 | 用途 |
|------|------|------|
| `options()` | `[{label, value}]` | 下拉选项 |
| `dict($field)` | `{value: field}` | Mapping 映射字典 |
| `switch()` | `{onText, offText, trueValue, falseValue}` | Switch 组件配置 |
| `status()` | `{value: {...}}` | 状态枚举（需 icon + label） |
| `getFieldValue($value, $default, $field)` | mixed | 取单个枚举值 |

## 事件广播

api 能力类中涉及**增加、修改、删除**写操作时，必须广播对应事件，方便其他插件监听并做扩展操作。

### 事件枚举类

事件枚举类必须继承 `BaseEnum`，每个常量必须包含 `label`、`value`、`style` 三个字段：

```php
namespace plugin\MyPlugin\enum;

use plugin\xbCode\base\BaseEnum;

/**
 * 插件事件枚举
 * 定义实体的CRUD事件名称，供 Event::dispatch() 使用
 *
 * 事件命名规范：插件标识.功能类名.广播功能
 *
 * 使用示例：
 *   // 触发事件
 *   Event::dispatch(MyPluginEventEnum::USER_REGISTERED['value'], [...]);
 *
 *   // 监听事件（在插件的 config/event.php 中）
 *   return [
 *       MyPluginEventEnum::USER_REGISTERED['value'] => [
 *           [SomeListener::class, 'onUserRegistered'],
 *       ],
 *   ];
 */
class MyPluginEventEnum extends BaseEnum
{
    // ========================================================================
    // 用户事件
    // ========================================================================

    /**
     * 用户注册前置
     * 事件数据：['username' => string, 'email' => string]
     */
    const USER_REGISTER_BEFORE = [
        'label' => '用户注册前置',
        'value' => 'xbUser.User.register.before',
        'style' => '<span class="label label-warning">用户注册前置</span>',
    ];

    /**
     * 用户注册
     * 事件数据：['id' => int, 'username' => string, 'email' => string]
     */
    const USER_REGISTERED = [
        'label' => '用户注册',
        'value' => 'xbUser.User.register',
        'style' => '<span class="label label-success">用户注册</span>',
    ];

    /**
     * 用户注册后置
     * 事件数据：['id' => int, 'username' => string]
     */
    const USER_REGISTER_AFTER = [
        'label' => '用户注册后置',
        'value' => 'xbUser.User.register.after',
        'style' => '<span class="label label-info">用户注册后置</span>',
    ];
}
```

### 事件命名规范

格式：`插件标识.功能类名.广播功能`

| 组成 | 说明 | 示例 |
|------|------|------|
| 插件标识 | 插件唯一标识（驼峰） | `xbUser` |
| 功能类名 | api 目录下的能力类名 | `User` |
| 广播功能 | 具体操作名称 | `register` |

### 事件生命周期

写操作事件按**前置 → 执行 → 后置**三阶段广播：

| 阶段 | 命名 | 用途 |
|------|------|------|
| 前置事件 | `{事件}.before` | 参数校验、数据拦截，可通过返回 `false` 阻断操作 |
| 主事件 | `{事件}` | 核心业务已完成，通知其他插件 |
| 后置事件 | `{事件}.after` | 异步后续处理（日志、通知、缓存清理等） |

用户注册广播事件示例：

```
前置事件：xbUser.User.register.before
注册事件：xbUser.User.register
后置事件：xbUser.User.register.after
```

### 触发与监听

```php
use Webman\Event\Event;
use plugin\MyPlugin\enum\MyPluginEventEnum;

// 在 api 能力类中触发事件
Event::dispatch(MyPluginEventEnum::USER_REGISTER_BEFORE['value'], $data);
// ... 执行业务逻辑 ...
Event::dispatch(MyPluginEventEnum::USER_REGISTERED['value'], $data);
Event::dispatch(MyPluginEventEnum::USER_REGISTER_AFTER['value'], $data);

// 在插件的 config/event.php 中监听事件
return [
    MyPluginEventEnum::USER_REGISTERED['value'] => [
        [SomeListener::class, 'onUserRegistered'],
    ],
];
```

## 模型规范

```php
namespace plugin\MyPlugin\app\model;

use plugin\xbCode\base\BaseModel;

class MyModel extends BaseModel
{
    /**
     * 自动时间戳（BaseModel 已默认开启 datetime 模式）
     * create_at / update_at
     */

    /**
     * 关联用户模型
     * @return \think\model\relation\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * 状态文本获取器
     * @param mixed $value
     * @param array $data
     * @return string
     */
    public function getStatusTextAttr($value, $data)
    {
        return StateEnum::getFieldValue($data['status']);
    }
}
```

### 分页查询

ThinkORM 的 `paginate()` 在 xbCode 中已重写，自动读取 `limit` 参数：

```php
$data = MyModel::with(['user'])
    ->where('status', '20')
    ->order('id desc')
    ->paginate();  // 自动获取 request->get('limit', 30)
return $this->successData($data);
```

## 验证器规范

```php
namespace plugin\MyPlugin\app\validate;

use taoser\Validate;

class MyValidate extends Validate
{
    protected $rule = [
        'name' => 'require|max:50',
        'status' => 'require|in:10,20',
    ];

    protected $message = [
        'name.require' => '名称不能为空',
        'name.max' => '名称最多50个字符',
    ];

    protected $scene = [
        'add' => ['name', 'status'],
        'edit' => ['name', 'status'],
    ];
}
```

控制器中使用：

```php
xbValidate(MyValidate::class, $post, 'add');
```

## 插件开发

新建插件需创建类继承 `plugin\xbCode\base\BasePlugin`：

```php
namespace plugin\MyPlugin;

use plugin\xbCode\base\BasePlugin;

class MyPlugin extends BasePlugin
{
    // BasePlugin 构造函数会自动从 plugins.json 读取并填充以下属性：
    // $name、$title、$version、$author、$desc、$composer、$plugins
    // 子类无需重复定义
}
```

### 生命周期方法

- `installBefore()` / `install()` / `installAfter()`
- `updateBefore()` / `update()` / `updateAfter()`
- `uninstallBefore()` / `uninstall()` / `uninstallAfter()`

BasePlugin 已内置：安装 SQL、配置、菜单、字典、定时任务等标准化安装逻辑。

## URL 生成

使用 `plugin\xbCode\api\Url` 生成控制器路由：

```php
use plugin\xbCode\api\Url;

Url::make('add');                   // 当前控制器/add
Url::make('User/edit');             // User/edit
Url::make('del')->query(['id' => 1]); // 带查询参数
```

## Vue 视图渲染

```php
// 渲染插件内 Vue 文件（传路径）
$builder = Builder::view('app/admin/view/my_page', ['name' => 'value']);
return $this->successRes($builder);

// 不传路径则自动按「当前控制器名（下划线）+ 方法名（下划线）」定位视图
return $this->display(['name' => 'value']);
```

## 核心插件 API

### xbCode 常用 API

```php
use plugin\xbCode\api\PluginsApi;
use plugin\xbCode\api\ConfigApi;
use plugin\xbCode\api\Menus;
use plugin\xbCode\api\Mysql;

// 插件管理
PluginsApi::make()->installed('xbUser');       // 检测插件是否安装
PluginsApi::make()->hasEnabled('xbUser');      // 检测插件是否启用
PluginsApi::make()->get('xbUser');             // 获取插件信息
PluginsApi::make()->getList();                 // 获取插件列表

// 配置管理（分组名支持点号层级）
ConfigApi::make('upload')->get('active', 'local');  // 读取配置
ConfigApi::make('myPlugin')->set(['key' => 'value']); // 保存配置
ConfigApi::make('myPlugin')->level(true)->get('');  // 读取层级配置

// 菜单安装（插件安装时自动调用）
Menus::install($menuData, $pluginName);

// 执行 SQL 文件
Mysql::importSql($filePath, ['xb_', '__PREFIX__']);
```

### xbCrontab 定时任务

插件通过 `config/crontab.php` 注册定时任务，安装时自动导入：

```php
// plugin/MyPlugin/config/crontab.php
return [
    [
        'title' => '每日数据清理',
        'name' => 'daily_cleanup',
        'plugin' => 'MyPlugin',
        'type' => '30',               // 10=shell, 20=url, 30=php
        'cron_expression' => '0 0 * * *',
        'command' => '\\plugin\\MyPlugin\\api\\Task::clean()',
    ],
];
```

```php
use plugin\xbCrontab\api\CrontabApi;

// 手动操作定时任务（通常由 BasePlugin 生命周期自动处理）
CrontabApi::make()->install('MyPlugin');     // 安装插件定时任务
CrontabApi::make()->uninstall('MyPlugin');   // 卸载插件定时任务
```

### xbUpload 文件存储

```php
use plugin\xbUpload\api\UploadApi;
use plugin\xbUpload\api\Files;
use plugin\xbUpload\api\EngineApi;

// 上传文件（自动根据配置选择存储引擎）
$result = UploadApi::make()->upload('file');
$result = UploadApi::make('oss')->upload('file'); // 指定 OSS 引擎

// 链式设置上传参数
UploadApi::make()
    ->setUid(1)
    ->setCid(2)
    ->setSaveDir('custom/path')
    ->setFileName('rename.jpg')
    ->upload('file');

// 下载远程文件并保存
$result = UploadApi::make()->download('https://example.com/file.jpg');

// 获取文件访问 URL
$url = Files::make()->url($uri);
$url = Files::make()->getSignUrl($uri); // 签名 URL（私有 bucket）

// 检测文件是否存在
$exist = Files::make()->exist($uri);

// 删除文件
Files::make()->delete($uri);

// 路径与 URL 互转
$path = Files::make()->path($fullUrl);  // URL 转相对路径
```

### xbDeveloper 开发辅助

```php
use plugin\xbDeveloper\api\DevelopmentApi;

// 插件列表（含 Git 状态、打包权限等）
$list = DevelopmentApi::make()->getList();

// 创建新插件
DevelopmentApi::make()->create([
    'title' => '测试插件',
    'name' => 'TestPlugin',
    'desc' => '插件描述',
    'author' => '作者',
]);

// 执行插件 SQL
DevelopmentApi::make()->sql('MyPlugin');

// 导出插件菜单到 config/menu.php
DevelopmentApi::make()->menus('MyPlugin');

// 构建版本补丁包
DevelopmentApi::make()->buildePatchPackage('MyPlugin', '1.0.1');
```
