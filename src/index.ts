import './common/main.less';
import Router from './common/router';
import Weixin from './model/weixin';
import 'babel-polyfill';

const Route = new Router(document.getElementById('app'));

Route.page(/^\/share\/merge-msg\/(\d+)/, 'mergeMsg.sve');
Route.page(/.*/, 'notFound.sve');

Route.start();

export { Route, Weixin };
