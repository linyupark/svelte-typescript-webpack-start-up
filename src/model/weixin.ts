import { observable, action } from 'mobx';
import { search2obj, serialize } from '../common/util';
import { API } from '../common/api';
import conf from '../common/config';
import logo from '../common/asset/logo.png';

interface ShareApiParams {
  targetType: 1 | 2 | 3;
  targetId: number;
}

interface JsSDKParams {
  signature?: string;
  appId?: string;
  nonceStr?: string;
  timestamp?: number;
}

// 微信的获取code地址
const getWeiXinOAuthCodeUrl = () => {
  const { pathname, protocol, search, hash } = location;
  const uri = encodeURIComponent(`${protocol}//${conf.domain}${pathname}${search}${hash}`);
  location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${conf.appid}&redirect_uri=${uri}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`;
};

/**
 * 有关微信信息的操作对象
 */
class WeiXin {
  // 微信服务 token
  @observable token = sessionStorage.getItem('token') || null;

  // 微信用户信息
  @observable user: any = {};

  // 调用微信jssdk需要用到的签名参数
  @observable jssdk: JsSDKParams = {};

  // 获取jssdk数据
  // currentUrl: 当前网页的URL，不包含#及其后面部分
  // [invalidCache]{boolean}: 是否强制之前获取的ticket失效，非测试环境请不要设置
  @action
  async getJssdk() {
    try {
      const response = await API('get', '/api/weixin/jssdk/config', {
        params: {
          currentUrl: encodeURIComponent(location.href.split('#')[0]),
          invalidCache: true
        }
      });
      this.jssdk = response;
      return response;
    } catch (e) {
      alert('更新微信jssdk签名信息失败');
    }
  }

  // 退出登录
  @action
  logout() {
    this.token = null;
    sessionStorage.clear();
    this.user = {
      userId: 0,
      userNick: '游客',
      wxNick: '游客',
      avatar: logo,
      unionId: 0,
      sex: 0,
      province: '未知',
      city: '未知',
      country: '未知',
      gmtCreate: 0,
      mobile: null,
      openSharer: false,
      openSharerLevel: 0,
      teacher: false
    };
  }

  // 检查是否已经登录
  get isLogined() {
    // 如果 search中包含code，是会立刻执行登录操作的，因此可视为已经进入登录
    return search2obj(location.search).code || this.token || this.user.userId;
  }

  // 设置用户信息
  @action
  async getUser() {
    try {
      const response = await API('get', '/api/user');
      this.user = response.user;
      return response.user;
    } catch (e) {
      alert('获取用户信息失败');
    }
  }

  // 获取并设置 token
  @action
  async getToken() {
    const search = search2obj(location.search);
    if (this.token) return this.token;
    if (search.code) {
      // 包含?code=xxx直接获取token
      console.log('code', search.code);
      try {
        const response = await API('post', '/api/authorization/code', {
          data: {
            code: search.code
          }
        });
        // 改变了search页面刷新了，状态失效，改用sessionStorage
        // this.token = response.token
        sessionStorage.setItem('token', response.token);
        // 去掉code search，回到原来的地址
        delete search.code;
        delete search.state;
        // console.log(serialize(search))
        location.search = serialize(search);
      } catch (e) {
        alert('获取token失败');
      }
    } else {
      // 没有code，去微信api请求生成 code
      getWeiXinOAuthCodeUrl();
    }
  }

  constructor() {}

  /**
   * 通过服务器获取分享信息
   * params.targetType: 分享的目标对象类型，1：问答，2：直播，3：群组
   * params.targetId: 分享的目标对象对应的ID
   */
  async apiShare(params: ShareApiParams) {
    try {
      const response = await API('get', `/api/share/${params.targetType}/${params.targetId}`);
      this.sdkShare(response);
    } catch (e) {
      alert('自定义分享信息获取失败');
    }
  }

  // 微信jssdk分享
  async sdkShare(customShareData, config = {}) {
    let jssdkParams = this.jssdk;
    let shareData = Object.assign(
      {
        title: '醒来 激发“心”的力量',
        text: '醒来 激发“心”的力量',
        targetUrl: location.href,
        imageUrl: logo
      },
      customShareData
    );
    if (!jssdkParams.signature) {
      jssdkParams = await this.getJssdk();
    }
    import('weixin-js-sdk').then(wx => {
      wx.config(
        Object.assign(
          {
            debug: false,
            appId: jssdkParams.appId,
            timestamp: jssdkParams.timestamp,
            nonceStr: jssdkParams.nonceStr,
            signature: jssdkParams.signature,
            jsApiList: [
              'onMenuShareTimeline',
              'onMenuShareAppMessage',
              'onMenuShareQQ',
              'onMenuShareWeibo',
              'onMenuShareQZone',
              'previewImage'
            ]
          },
          config
        )
      );

      wx.ready(() => {
        // 朋友圈
        wx.onMenuShareTimeline({
          title: shareData.title,
          link: shareData.targetUrl,
          imgUrl: shareData.imageUrl,
          success: function() {},
          cancel: function() {}
        });

        // 分享给朋友
        wx.onMenuShareAppMessage({
          title: shareData.title,
          desc: shareData.text,
          link: shareData.targetUrl,
          imgUrl: shareData.imageUrl,
          type: '',
          dataUrl: '',
          success: function() {},
          cancel: function() {}
        });

        // 分享到QQ
        wx.onMenuShareQQ({
          title: shareData.title,
          desc: shareData.text,
          link: shareData.targetUrl,
          imgUrl: shareData.imageUrl,
          success: function() {},
          cancel: function() {}
        });

        // 分享到腾讯微博
        wx.onMenuShareWeibo({
          title: shareData.title,
          desc: shareData.text,
          link: shareData.targetUrl,
          imgUrl: shareData.imageUrl,
          success: function() {},
          cancel: function() {}
        });

        // QQ空间
        wx.onMenuShareQZone({
          title: shareData.title,
          desc: shareData.text,
          link: shareData.targetUrl,
          imgUrl: shareData.imageUrl,
          success: function() {},
          cancel: function() {}
        });
      });

      wx.error(() => {
        alert('微信分享功能出错');
      });
    });
  }
}

export default new WeiXin();
