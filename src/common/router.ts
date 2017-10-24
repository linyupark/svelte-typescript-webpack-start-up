// 这里可以切换 history 类型，默认为 hash 模式
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
            this.currentPage = new Page.default({
              target: this.root,
              data: {
                routeAction: (action && action.toLowerCase()) || ''
              }
            });
          })
          .catch(e => {
            console.error(`Route parse error: ${e.message}`);
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

  // 移动到某地址
  goto = (path: string) => {
    this.history.push(path);
  };

  replace = (path: string) => {
    this.history.replace(path);
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
