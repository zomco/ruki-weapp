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
const config = require('../../config');
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    tabs: ["现场", "规则", "亮点"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    isLoading: false,
    loadingError: null,
    videoEdges: [],
    videoPageInfo: {},
    videoPhase: null,
    videoCursor: null,
    videoTime: 0,
    me: null,
  },
  // 页码加载时获取slider位置
  onLoad: function () {
    var that = this;
    that.loadVideos(2);
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
  },
  onShow: function () {
    // 页面显示时加载暂停播放的视频
    const { videoCursor: oldVideoCursor } = this.data;
    if (oldVideoCursor) {
      const oldVideoContext = wx.createVideoContext(oldVideoCursor);
      oldVideoContext.play();
    }
    try {
      // 获取用户信息
      const me = wx.getStorageSync('me');
      if (me) {
        this.setData({ me });
      } else {
        this.setData({ me: null });
      }
    } catch (e) {
      console.error(e);
    }
  },
  // 页码拖到顶部时刷新
  onPullDownRefresh: function () {
    const filter = this.data.activeIndex;
    this.setData({
      videoEdges: [],
      videoPageInfo: {},
      videoPhase: null,
      videoCursor: null,
      videoId: null
    });
    this.loadVideos(filter).then(function(){
      wx.stopPullDownRefresh();
    });
  },
  // 页面拖到底部时加载更多
  onReachBottom: function () {
    const filter = this.data.activeIndex;
    this.loadVideos(filter, 5);
  },
  // 加载视频数据
  loadVideos: function (filter, more) {
    const that = this;
    return new Promise(function (resolve, reject) {
      const count = more ? more : 10;
      // 默认加载前10条记录
      const args = { first: count };
      // 往后加载more条记录
      const edges = that.data['videoEdges'];
      const pageInfo = that.data['videoPageInfo'];
      if (edges.length > 0) {
        const lastEdge = edges[edges.length - 1];
        args.after = lastEdge['cursor'];
        args.first = count;
      }
      that.setData({
        isLoading: true,
        loadingError: null,
      });
      // 发请求获取数据
      wafer.request({
        url: config.service.videoUrl,
        data: { ...args, filter },
        success: function (res) {
          if (res.statusCode == '200') {
            const {
              edges: newEdges,
                pageInfo: {
                hasNextPage,
                  hasPreviousPage
              }
            } = res.data.connection;
              that.setData({
                isLoading: false,
                loadingError: null,
                videoEdges: [...edges, ...newEdges],
                videoPageInfo: { hasNextPage, hasPreviousPage }
              });
              resolve('success');
          } else {
            that.setData({
              isLoading: false,
              loadingError: '系统错误',
            });
          }
        },
        fail: function (err) {
          const { errMsg } = err;
          that.setData({
            isLoading: false,
            loadingError: errMsg,
          });
          resolve('fail');
        },
      });
    });
  },
  // 选择tab的时候过滤切换过滤条件
  onNavClick: function (e) {
    const that = this;
    const filter = e.currentTarget.id;
    that.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: filter,
      videoEdges: [],
      videoPageInfo: {},
      videoPhase: null,
      videoCursor: null,
      videoId: null,
    });
    // 初次加载数据
    that.loadVideos(filter);
  },
  // 点击视频封面进行播放，同时暂停其他视频播放
  onPosterClick: function (e) {
    const {
      id: videoCursor,
      dataset: { id: videoId },
    } = e.currentTarget;
    // 先暂停其他播放中的视频
    const { videoCursor: oldVideoCursor } = this.data;
    if (oldVideoCursor) {
      const oldVideoContext = wx.createVideoContext(oldVideoCursor);
      oldVideoContext.pause();
    }
    this.setData({
      videoPhase: 'load',
      videoCursor,
      videoId,
    });
    // 模拟缓冲
    const that = this;
    setTimeout(function () {
      that.setData({
        videoPhase: 'play',
        videoCursor,
        videoId,
      });
      const videoContext = wx.createVideoContext(videoCursor);
      videoContext.play();
    }, 618);
  },
  // 点击视频封底进行重播，同时暂停其他视频播放
  onEnderClick: function (e) {
    const {
      id: videoCursor,
      dataset: { id: videoId },
    } = e.currentTarget;
    const { videoCursor: oldVideoCursor } = this.data;
    if (oldVideoCursor) {
      const oldVideoContext = wx.createVideoContext(oldVideoCursor);
      oldVideoContext.pause();
    }
    const that = this;
    this.setData({
      videoPhase: 'play',
      videoCursor,
      videoId,
    });
    const videoContext = wx.createVideoContext(videoCursor);
    videoContext.play();
  },
  // 视频播放开始
  onVideoPlay: function (e) {
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
    const { id: videoCursor } = e.currentTarget;
    this.setData({ videoPhase: 'end', videoCursor });
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
  // 转发按钮，先暂停其他视频播放，再进入详情页码
  onShareClick: function (e) {
    const { videoCursor: oldVideoCursor } = this.data;
    if (oldVideoCursor) {
      const oldVideoContext = wx.createVideoContext(oldVideoCursor);
      oldVideoContext.pause();
    }
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({ url });
  },
  // 评论按钮
  onLikeClick: function (e) {
    const { videoCursor: oldVideoCursor } = this.data;
    if (oldVideoCursor) {
      const oldVideoContext = wx.createVideoContext(oldVideoCursor);
      oldVideoContext.pause();
    }
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({ url });
  },
  // 刷新按钮
  onRefreshClick: function (e) {
    this.onPullDownRefresh();
  },
});
