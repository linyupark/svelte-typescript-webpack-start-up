/**
 * [转化时间戳为各种格式]
 * @param  {number} time [时间戳]
 * @param  {string} type [将要显示的类型]
 * @return {string}      [返回时间格式]
 */
export const gmt2date = (time, type = 'yy-mm-dd') => {
  try {
    let d = new Date(time);
    let dateObj = {
      day: d.getDate() < 10 ? '0' + d.getDate() : d.getDate(),
      year: d.getFullYear(),
      month:
        d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1,
      hours: d.getHours() < 10 ? '0' + d.getHours() : d.getHours(),
      minutes: d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes(),
      seconds: d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()
    };

    //所有支持的格式
    let typeObj = {
      'yy-mm-dd': () => {
        return `${dateObj.year}-${dateObj.month}-${dateObj.day}`;
      },
      'yy-mm-dd hh:mm': () => {
        return `${dateObj.year}-${dateObj.month}-${dateObj.day} ${dateObj.hours}:${dateObj.minutes}`;
      },
      'mm-dd hh:mm': () => {
        return `${dateObj.month}-${dateObj.day} ${dateObj.hours}:${dateObj.minutes}`;
      },
      'yy/mm/dd': () => {
        return `${dateObj.year}/${dateObj.month}/${dateObj.day}`;
      },
      'yy/mm/dd hh:mm pp': () => {
        return `${dateObj.year}/${dateObj.month}/${dateObj.day} ${dateObj.hours}:${dateObj.minutes} ${dateObj.hours >=
        12
          ? 'PM'
          : 'AM'}`;
      },
      yy年mm月dd日: () => {
        return `${dateObj.year}年${dateObj.month}月${dateObj.day}日`;
      }
    };
    return typeObj[type]();
  } catch (e) {
    console.error('时间戳无法转换成日期', time);
    return '-';
  }
};

/**
 * object => serialize
 * @param  {Object} obj
 * @return {String}
 */
export const serialize = (obj = {}) =>
  Object.keys(obj)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
    .join('&');

/**
 * hash search 转对象
 * ?a=a&b=b => {a:'a',b:'b'}
 * @param  {String} hash
 * @return {Object}
 */
export const search2obj: any = (hash = '') => {
  let ret = {},
    seg = decodeURIComponent(hash)
      .replace(/^\?/, '')
      .split('&'),
    len = seg.length,
    i = 0,
    s;
  for (; i < len; i++) {
    if (!seg[i]) {
      continue;
    }
    s = seg[i].split('=');
    ret[s[0]] = s[1];
  }
  return ret;
};

/**
 * 是否是在微信中
 * @returns {Boolean}
 */
export const isWeixin = () => {
  return navigator.userAgent.toLowerCase().indexOf('micromessenger') >= 0;
};
// export const isQQ = () => {
//   return navigator.userAgent.match(/QQ/i)
// }

/**
 * 监听模式封装
 */
export const EventListener = (el: any = {}) => {

  /**
   * 所有监听中的回调函数
   * @type {Object}
   */
  let _callbacks = {};

  /**
   * object defineProperty 默认
   * writable : false, configurable : false, enumerable : false
   * 避免被复写
   * 自定义事件
   */
  Object.defineProperty(el, 'on', {
    value(event, fn) {
      if (typeof fn == 'function') {
        (_callbacks[event] = _callbacks[event] || []).push(fn);
      }
      return el;
    }
  });

  Object.defineProperty(el, 'once', {
    value(event, fn) {
      let on = (...args) => {
        el.off(event, on);
        fn.apply(el, args);
      };
      return el.on(event, on);
    }
  });

  /**
   * 解除某自定义事件
   */
  Object.defineProperty(el, 'off', {
    value(event, fn) {
      if (event === '*' && !fn) _callbacks = {};
      else {
        if (fn) {
          for (const _i in _callbacks[event]) {
            if (_callbacks[event][_i] == fn) _callbacks[event].splice(_i, 1);
          }
        } else delete _callbacks[event];
      }
      return el;
    }
  });

  /**
   * 触发某自定义事件
   */
  Object.defineProperty(el, 'emit', {
    value(event, ...args) {
      const fns = (_callbacks[event] || []).slice(0);
      fns.forEach(_fn => {
        _fn.apply(el, args);
      });
      if (_callbacks['*'] && event !== '*')
        el.emit.apply(el, ['*', event].concat(args));
      return el;
    }
  });

  return el;
};
