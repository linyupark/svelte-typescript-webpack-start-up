/**
 * 简单够用的 hash 路由实现
 * 目前可以支持 某个页面离开时候提醒：oncreate: Route.block('确定要离开吗?')
 * @author linyu
 */

import createHistory from 'history/createHashHistory';

interface GotoProps {
  path: string;
  state?: 'POP' | 'PUSH' | 'REPLACE';
}

class Router {
  
  private history = createHistory();

  // 挂载点
  private root = null;

  private currentPage = null;

  // 有效页面规则
  private views = [];

  // 页面正则匹配的参数
  private params = [];

  // 取消阻止
  private unblock = null;

  /**
   * 初始化路由
   * @param renderRoot 渲染挂载DOM
   */
  constructor(renderRoot?: HTMLElement) {
    this.root = renderRoot || document.body;
    this.history.listen((location, action) => {
      this.parse(location.pathname, action);
    });
  }

  // 解析地址
  private parse(pathname, action?: string) {
    let isMatch = false;
    for (let page of this.views) {
      const matched = pathname.match(page.rule);
      if (matched) {
        this.params = matched.splice(1);
        import(`view/${page.component}`)
          .then(Page => {

            // 要传递给页面组件的数据
            const data = {
              Route: {
                action: (action && action.toLowerCase()) || '',
                pathname,
                params: this.params,
                search: this.history.location.search
              }
            };

            // 销毁上一页组件
            if (this.currentPage) this.currentPage.destroy();

            // 如果之前有 block 的取消
            if (this.unblock) {
              this.unblock();
              this.unblock = null;
            }

            // 挂载页面组件
            this.currentPage = new Page.default({
              target: this.root, data
            });

            // 强制回到顶部
            window.scrollTo(0, 0);

            // 页面主动跳转
            this.currentPage.on('routePush', data => {
              this.history.push(data);
            });

            // 页面替换
            this.currentPage.on('routeReplace', data => {
              this.history.replace(data);
            });

            // 页面跳转阻止
            this.currentPage.on('routeBlock', message => {
              this.unblock = this.history.block(message);
            })
          })
          .catch(e => {
            throw e;
          });
        isMatch = true;
        return;
      }
    }
    if (!isMatch) {
      console.error('没有匹配路由.');
    }
  }

  // 正式运行
  start() {
    this.parse(this.history.location.pathname);
  }

  add(rule: RegExp, component) {
    this.views.push({ rule, component });
  }

}

export default Router;
