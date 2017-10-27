import './common/main.less';
import Router from './common/router';
import Weixin from './model/weixin';
import HeaderSection from './page/header.sve';
import 'babel-polyfill';

const Route = new Router(document.getElementById('app'));

// 头部导航等，不需要跟随刷新的
const Header = new HeaderSection({
  target: document.getElementById('header')
})

Route.page(/^\/share\/merge-msg\/(\d+)/, 'mergeMsg.sve');
Route.page(/.*/, 'notFound.sve');

Route.start();

export { Route, Weixin, Header };
