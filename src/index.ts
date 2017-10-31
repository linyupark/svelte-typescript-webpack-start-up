
import Router from './common/router';
import Weixin from './model/weixin';
import HeaderContainer from './component/container/header.sve';
import { EventListener } from './common/util';
import 'babel-polyfill';

// 路由
const Route = new Router(document.getElementById('app'));
Route.page(/^\/share\/merge-msg\/(\d+)/, 'mergeMsg.sve');
// 开发模式下允许匹配的路由
if(__ENV__ === 'developer') {
  Route.page(/^\/home$/, 'home.sve');
  Route.page(/^\/$/, 'nav.sve');
}
Route.page(/.*/, 'notFound.sve');
Route.start();

// 全局事件
const App = EventListener();

// 头部导航等，不需要跟随刷新的
const Header = new HeaderContainer({
  target: document.getElementById('header')
});

export { App, Route, Weixin, Header };
