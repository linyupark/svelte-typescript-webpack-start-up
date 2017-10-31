/**
 * 支付
 * @author linyu
 */

import { API } from '../common/api';

// 全局函数定义
declare const WeixinJSBridge;

/**
 * 支付参数
 */
interface PayOptions {
  payParams: UnionPayParams;
  onSuccess?: (payParams: UnionPayParams) => void;
  onError?: (payParams: UnionPayParams, msg?: string) => void;
}

/**
 * 支付接口参数
 */
interface UnionPayParams {
  /**
   * 界面给用户显示的价格
   */
  displayPrice?: number;
  /**
   * 支付方式,1：余额支付，2：微信Native支付，3：支付宝支付，4：微信H5支付
   */
  payType?: 1 | 2 | 3 | 4;
  /**
   * 备注信息
   */
  remark?: string;
  /**
   * targetType对应的id 
   */
  targetId?: number;
  /**
   * 要支付的商品对应的类型,其中，
   * 1：聆听回答 ，对应targetId为回答Id，
   * 6：提问，对应targetId为问题id，
   * 7：专辑，对应targetId为专辑id，
   * 8：直播，对应targetId为liveId，
   * 9:直播礼物，对应targetId为giftId，
   * 10:加入群组，对应targetId为teamId，
   * 11:群内发红包，对应targetId为红包id，
   * 12:充值，对应targetId为充值id
   */
  targetType?: 1 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

/**
 * 接口支付返回数据
 */
interface PayResponse {
  paid: boolean;
  payParams: UnionPayParams;
}

export default class Pay {
  /**
   * 我的钱包
   * 00000018.个人中心接口
   */
  static financeAccount() {
    return API('get', '/api/finance');
  }

  /**
   * 收益
   * 00000018.个人中心接口
   */
  static financeIncome(pageNum: number = 1) {
    return API('get', '/api/finance/income', {
      params: { pageNum }
    });
  }

  /**
   * 支出明细
   * 00000018.个人中心接口
   */
  static financeSpend(pageNum: number = 1) {
    return API('get', '/api/finance/pay', {
      params: { pageNum }
    });
  }

  /**
   * 支付结算接口
   */
  async unionPay(options: PayOptions) {
    const { onSuccess = () => {}, onError = () => {}, payParams } = options;
    try {
      const response: PayResponse = await API('post', '/api/union_pay', {
        data: payParams
      });
      if (response.paid) {
        return onSuccess(payParams);
      }
      // 微信H5支付失败则直接尝试调用内部支付
      if (!response.paid && payParams.payType === 4) {
        return Pay.weixinPay(options);
      }
      onError(payParams);
    } catch (err) {
      onError(payParams, err.response);
    }
  }

  /**
   * 微信支付
   */
  static weixinPay(options: PayOptions) {
    const { onSuccess = () => {}, onError = () => {}, payParams } = options;
    WeixinJSBridge.invoke('getBrandWCPayRequest', payParams, res => {
      if (res.err_msg === 'get_brand_wcpay_request:ok') {
        // 使用以上方式判断前端返回
        // 微信团队郑重提示：res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
        onSuccess(payParams);
      } else {
        onError(payParams);
      }
    });
  }
}
