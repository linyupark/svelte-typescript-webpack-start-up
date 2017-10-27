醒来移动设备项目 [Svelte](https://svelte.technology/guide) 版
============================================================
* 接口文档地址
  - 江南机器（开发）http://192.168.1.165/swagger-ui.html#/ 或 http://192.168.1.141/swagger-ui.html#/
  - 测试服务器 http://192.168.1.105/swagger-ui.html#/
  - 协议规范相关 http://doc.51wakeup.com/index.html
  - mock 数据地址 https://easy-mock.com/mock/59f08a771bd72e7a8889bb88/ （开发使用 dev-mock）

* 域名地址
  - 前端h5 m.51wakeup.com
  - 开发API http://192.168.1.165 或 http://192.168.1.141
  - 测试API test-server.51wakeup.com
  - 正式API gateway.51wakeup.com
  - CDN https://assets.51wakeup.com/assets

* 微信相关
  - 服务号AppId: wx033473a55bf51626

* 开发工具
  - 请求替换、数据截取综合工具（必须）：https://avwo.github.io/whistle/
  - vscode (推荐使用)

**关于whistle的注意点**

* Rules添加规则
   `m.51wakeup.com localhost:8080`
* https 需要开启拦截，帮助说明：https://avwo.github.io/whistle/webui/https.html  

**样式编辑说明**
环境在非 svelte 文件里支持less，推荐component 里使用less以方便样式共享，page 则单独写在svelte中。


**目录结构说明**
* src/component 自定义组件，以功能性区分设置目录，跟随组件的独立图片等静态文件也放入其中，前期不需要再细分子目录。如是多处重复引入的组件，建议样式以less文件的方式引入：
  - avatar : 头像相关
  - audio : 音频相关
  - video : 视频相关
  - svg : svg矢量图相关
  - container : 容器ui相关
    * page.sve, header.sve （这两个是涉及到项目全局的容器，如没有重大调整不用修改名字）
  - loading : 不同形态的loading相关

* src/page 页面展示容器组件，用于拼接各子组件，并依赖主路由展示，此目录下引入的模版中可使用 common/router.ts 中的一些共享数据跟方法

```
# 跳转到某页面 
<a href="javascript:;" on:click="fire('routePush', '/')">跳转</a>

# 离开某页面的时候提醒
<a href="javascript:;" on:click="fire('routeBlock', '确保内容已经保存，离开后就没了')">跳转</a>

# 默认会传递给组件的数据：
Route: {
  action: 'pop' | 'push',
  pathname: 当前页面的地址,
  params: 页面地址分析正则获取到的参数,
  search: 当前页面的查询string
}
```

*（灵活使用 console.dir(this)来查看组件中可用的方法跟属性）*

* src/model 数据对象，需要管理数据状态的组件依赖它们。实现方式 Mobx.js: http://cn.mobx.js.org/，在用到mobx的类请在项目根index.ts中将实例对象export 出来。

* src/common 项目全局可调用的一些帮助函数以及配置文件等
  - asset 全局共享的静态资源，如logo等
  - lib 第三方的库，便于修改引入

**关于布局单元**

以设计稿宽度750px为基准，按设计稿上的px进行布局切图
使用 https://github.com/amfe/lib-flexible
会将页面切割成10份rem，1rem = 75px，推荐使用pxtorem插件来自动实现计算转换。
项目中需要用到改特性的页面以
```
  import Page from '../component/container/page.sve';

  # flexible 不写也可以，默认就是开启
  <Page flexible={{true}}>...</Page>
```
方式启用，且不会影响其他页面。

&nbsp;

&nbsp;

&nbsp;


编译运行方法
================
```
  # install
  > npm i 

  # 开发-接口 (window环境在命令后面都加上:win)
  > npm run dev
  > npm run dev-test
  > npm run dev-mock
  
  # 编译 （自动上传oss需要根目录下创建ossconfig.json，格式参考webpack.config.js中相关代码）
  > npm run build-test
  > npm run build-production
```

Enjoy.
