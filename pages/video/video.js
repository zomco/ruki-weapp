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
      video: null,
      videoPhase: null,
      videoId: null,
      videoTime: 0,
      // 查询状态
      isLoading: false,
      loadingError: null,
      me: null,
    },
    onShow: function () {
      // 获取用户信息
      try {
        const me = wx.getStorageSync('me');
        this.setData({ me });
      } catch (e) {
        console.error(e);
      }
    },
    // 加载页面时获取实例
    onLoad: function(options) {
      const { id, q } = options;
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        // 小程序内根据id获取详情
        this.setData({ videoId: id });
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
        this.setData({ videoId: globalObj.id });
        this.loadVideo(globalObj.id);
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
          if (res.statusCode == '200') {
            me.setData({
              isLoading: false,
              loadingError: null,
              video: res.data.node,
            });
          } else {
            me.setData({
              isLoading: false,
              loadingError: '系统错误',
            });
          }
        },
        fail: function (err) {
          const { errMsg } = err;
          me.setData({ 
            isLoading: false,
            loadingError: errMsg,
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
      // console.log('video play');
      const {
        videoId,
        videoTime: time,
        me,
      } = this.data;
      if (me) {
        // 登录用户直接更新行为
        wafer.request({
          login: true,
          method: 'POST',
          data: {
            action: 'play',
            time,
            videoId,
          },
          url: config.service.viewUrl,
        });
      } else {
        // 非登录用户写到本地缓存里

      }
    },
    // 视频播放暂停
    onVideoPause: function (e) {
      // console.log('video pause');
      const {
        videoId,
        videoTime: time,
        me,
      } = this.data;
      if (me) {
        // 登录用户直接更新行为
        wafer.request({
          login: true,
          method: 'POST',
          data: {
            action: 'pause',
            time,
            videoId,
          },
          url: config.service.viewUrl,
        });
      } else {
        // 非登录用户写到本地缓存里
      }
    },
    // 视频播放结束
    onVideoEnded: function (e) {
      this.setData({ videoPhase: 'end' });
      const {
        videoId,
        videoTime: time,
        me,
      } = this.data;
      if (me) {
        // 登录用户直接更新行为
        wafer.request({
          login: true,
          method: 'POST',
          data: {
            action: 'end',
            time,
            videoId,
          },
          url: config.service.viewUrl,
        });
      } else {
        // 非登录用户写到本地缓存里
      }
    },
    // 视频播放进度变化
    onVideoTimeUpdate: function (e) {
      const { currentTime } = e.detail;
      this.setData({ videoTime: currentTime });
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
            icon: 'none'
          });
        }
      }
    },
    // 点击分享按钮提示
    onShareClick: function () {
      wx.showToast({
        title: '点击右上角「...」转发',
        icon: 'none'
      })
    },
    // 点击附近视频跳转
    onNearbyClick: function (e) {
      const videoContext = wx.createVideoContext('video');
      videoContext.pause();
      const { url } = e.currentTarget.dataset;
      console.log(url);
      wx.navigateTo({ url });
    },
    // 刷新
    onRefreshClick: function () {
      const { videoId } = this.data;
      this.loadVideo(videoId);
    }
});
