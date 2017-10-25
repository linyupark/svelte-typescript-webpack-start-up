/**
 * 全局设置
 */

let config = {
  domain: 'm.51wakeup.com',
  appid: 'wx033473a55bf51626',
  apiPrefix: 'http://192.168.1.165',
  apiSuffix: function() {
    return `appkey=9104743067411130&t=${Date.now()}&sign=xcvbnm&suid=${sessionStorage.getItem(
      'suid'
    )}`;
  }
};

if (__API__ === 'test') {
  config.apiPrefix = 'http://test-server.51wakeup.com';
}

if (__API__ === 'production') {
  config.apiPrefix = 'http://gateway.51wakeup.com';
}

export default config;
