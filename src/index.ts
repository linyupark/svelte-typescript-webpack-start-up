
import './common/main.less';
import Router from './common/router';

const Route = new Router(document.getElementById('app'));

Route.page(/^\/about\/(\d+)$/, 'about.sve');
Route.page(/.*/, 'welcome.sve');


Route.start();

export { Route };
