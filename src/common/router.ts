
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
  private pages = [];

  // 页面正则匹配的参数
  private pageParams = [];

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
    for (let page of this.pages) {
      const matched = pathname.match(page.rule);
      if (matched) {
        this.pageParams = matched.splice(1);
        import(`../page/${page.component}`)
          .then(Page => {
            if (this.currentPage) this.currentPage.destroy();
            // 如果之前有 block 的取消
            if (this.unblock) {
              this.unblock();
              this.unblock = null;
            }
            this.currentPage = new Page.default({
              target: this.root,
              data: {
                routeAction: (action && action.toLowerCase()) || ''
              }
            });
          })
          .catch(e => {
            throw e;
          });
        isMatch = true;
        return;
      }
    }
    if (!isMatch) {
      console.error('No route matched.');
    }
  }

  // 正式运行
  start() {
    this.parse(this.history.location.pathname);
  }

  page(rule: RegExp, component) {
    this.pages.push({ rule, component });
  }

  /**
   * path可以是字符串路径
   * 也可以是{pathname: '/xx', search: '?x=x'}
   */
  goto = (path: any) => {
    this.history.push(path);
  };

  /**
   * path可以是字符串路径
   * 也可以是{pathname: '/xx', search: '?x=x'}
   */
  replace = (path: any) => {
    this.history.replace(path);
  };

  block = (message: any) => {
    this.unblock = this.history.block(message);
  };

  methods = (fn: string, params: any) => {
    try {
      return this[fn](params);
    } catch (e) {
      throw e;
    }
  };

  get path() {
    return this.history.location.pathname;
  }

  get search() {
    return this.history.location.search;
  }

  get params() {
    return this.pageParams;
  }
}

export default Router;
