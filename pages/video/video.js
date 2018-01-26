/**
 # MIT License
 #
 # Copyright (c) 2017 Zeu Fung
 #
 # Permission is hereby granted, free of charge, to any person obtaining a copy
 # of this software and associated documentation files (the "Software"), to deal
 # in the Software without restriction, including without limitation the rights
 # to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 # copies of the Software, and to permit persons to whom the Software is
 # furnished to do so, subject to the following conditions:
 #
 # The above copyright notice and this permission notice shall be included in all
 # copies or substantial portions of the Software.
 #
 # THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 # IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 # FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 # AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 # LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 # OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 # SOFTWARE.
 */

const wafer = require('../../vendor/wafer-client-sdk/index');
const base64 = require('../../vendor/base64/index');
const config = require('../../config');

const fromGlobalId = function (globalId) {
  const unbasedGlobalId = base64.decode(globalId);
  const delimiterPos = unbasedGlobalId.indexOf(':');
  return {
    type: unbasedGlobalId.substring(0, delimiterPos),
    id: unbasedGlobalId.substring(delimiterPos + 1)
  };
}

Page({
    data: {
      // 实例
      video: {},
      videoPhase: null,
      // 查询状态
      isLoading: false,
      loadingError: null,
    },
    // 加载页面时获取实例
    onLoad: function(options) {
      const { id, shuffle, q } = options;
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        // 小程序内根据id获取详情
        this.loadVideo(id);
      } else if (q) {
        // 外部二维码获取详情
        const shareUrl = decodeURIComponent(q);
        const regexp = new RegExp('^' + config.host + '/post/((?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?)$', 'i');
        const matches = regexp.exec(shareUrl);
        if (!matches) {
          return;
        }
        const globalId = matches[1];
        const globalObj = fromGlobalId(globalId);
        if (globalObj.type !== 'Post') {
          return;
        }
        this.bindButtonLoad(globalObj.id);
      } else {
        // 无效的参数
      }
    },
    // 加载指定视频
    loadVideo: function (id) {
      const me = this;
      me.setData({
        isLoading: true,
        loadingError: null,
      });
      wafer.request({
        url: `${config.service.videoUrl}/${id}`,
        success: function (res) {
          wx.hideLoading();
          me.setData({
            isLoading: false,
            video: res.data.node,
          });
        },
        fail: function (err) {
          wx.hideLoading();
          const { message } = err;
          me.setData({ 
            isLoading: false,
            loadingError: message,
          });
        }
      });
    },
    onEnderClick: function (e) {
      this.setData({ videoPhase: null });
      const videoContext = wx.createVideoContext('video');
      videoContext.play();
    },
    // 视频播放开始
    onVideoPlay: function (e) {
      console.log('video play');
      // this.setData({ videoPhase: 'load'})
    },
    // 视频播放暂停
    onVideoPause: function (e) {
      console.log('video pause');
    },
    // 视频播放结束
    onVideoEnded: function (e) {
      this.setData({ videoPhase: 'end' });
    },
    // 视频播放进度变化
    onVideoTimeUpdate: function (e) {
      console.log('video time update');
    },
    // 设置转发
    onShareAppMessage: function (options) {
      const { video: { title, posterFile, id } } = this.data;
      return {
        title: title,
        path: `/pages/video/video?id=${id}`,
        imageUrl: posterFile,
        success: function (res) {
          // 转发成功
          wx.showToast({
            title: '转发成功',
            icon: 'success'
          });
        },
        fail: function (res) {
          // 转发失败
          wx.showToast({
            title: '转发失败',
            icon: 'loading'
          });
        }
      }
    }
});
