
import './common/main.less';
import Router from './common/router';

const Route = new Router(document.getElementById('app'));

Route.page(/^\/about$/, import('./page/about.sve'));
Route.page(/.*/, import('./page/welcome.sve'));


Route.start();

export { Route };
