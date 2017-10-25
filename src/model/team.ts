/**
 * 群组
 * @author linyu
 */

import { API } from '../common/api';

export default class Team {
  /**
   * 查询单个合并消息
   */
  static async getMergeMsg(mergeId: number) {
    let images = [];
    const response = await API('get', `/api/merge_msg/${mergeId}`);
    response.mergeMsgItems.forEach(item => {
      // 收集图片类型里的所有图片
      if (item.type == 1) {
        images.push(item.body.url);
      }
    });
    return { response, images };
  }
}
