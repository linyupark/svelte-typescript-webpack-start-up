
import Router from './common/router';
import { EventListener } from 'common/util';
import 'babel-polyfill';

// 头部
// const Header = new HeaderContainer({
//   target: document.querySelector('header')
// });

// 主部分
const Main = new Router(document.getElementById('main'));
Main.add(/^\/share\/merge-msg\/(\d+)/, 'mergeMsg.sve');
// 开发模式下
if(__ENV__ === 'dev') {
  Main.add(/^\/home$/, 'home.sve');
  Main.add(/^\/test$/, 'test.sve');
  Main.add(/^\/$/, 'nav.sve');
}
Main.add(/.*/, 'notFound.sve');
Main.start();

// 底部
// const Footer = new HeaderContainer({
//   target: document.querySelector('header')
// });

const AppEvent = EventListener();

export { AppEvent };
