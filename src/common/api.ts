import XHR from 'axios';
import Weixin from '../model/weixin';
import { EventListener } from './util';
import conf from './config';

/**
 * 全局跟服务器接口封装处理
 * @author linyu
 */

// 对api请求做全局的事件监听
// 事件绑定： Error | Unauthorized | Forbidden
export const APIListener = EventListener();

APIListener.on('Error', data => {});

/**
 * 服务器端API的封装
 * @param method {string} get|post|patch|put|delete
 * @param url {string}
 * @param setting {object} 
 * @returns Promise
 */
export const API = async (method, url, settings = {}) => {
  try {
    const response = await XHR(
      Object.assign(
        {
          url: `${conf.apiPrefix}${url}?${conf.apiSuffix()}`,
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': Weixin.token || ''
          }
        },
        settings
      )
    );
    // 接口错误信息统一处理
    if (response.status >= 400 || response.status <= 500) {
      APIListener.emit('Error');
    }
    if (response.status == 401) {
      APIListener.emit('Unauthorized');
      console.error('Unauthorized 401');
    }
    if (response.status == 403) {
      APIListener.emit('Forbidden');
      console.error('Forbidden 403');
    }

    return response.data;
  } catch (e) {
    alert('接口请求错误');
  }
};
