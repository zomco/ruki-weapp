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
    activeIndex: 2,
    sliderOffset: 0,
    sliderLeft: 0,
    crashEdges: [],
    crashPageInfo: {},
    ruleEdges: [],
    rulePageInfo: {},
    otherEdges: [],
    otherPageInfo: {},
    videoPhase: 'preload',
    videoId: null,
  },
  // 页码加载时获取slider位置
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
  },
  // 页面显示时加载视频
  onShow: function () {
    const that = this;
    that.loadVideos(2);
  },
  // 加载视频数据
  loadVideos: function (filter, more) {
    const that = this;
    const count = more? more: 10;
    // 默认加载前20条记录
    const args = { first: count };
    // 往后加载10条记录
    let edges = [];
    let pageInfo = {};
    if (filter == 0) {
      edges = that.data['crashEdges'];
      pageInfo = that.data['crashPageInfo'];
    } else if (filter == 1) {
      edges = that.data['ruleEdges'];
      pageInfo = that.data['rulePageInfo'];
    } else if (filter == 2) {
      edges = that.data['otherEdges'];
      pageInfo = that.data['otherPageInfo'];
    }
    if (edges.length > 0) {
      const lastEdge = edges[edges.length - 1];
      args.after = lastEdge['cursor'];
      args.first = count;
    }
    // 发请求获取数据
    wafer.request({
      url: config.service.videoUrl,
      data: { ...args, filter },
      success: function (res) {
        const { 
          edges: newEdges, 
          pageInfo: {
            hasNextPage,
            hasPreviousPage
          } 
        } = res.data.connection;
        if (filter == 0) {
          that.setData({
            crashEdges: [...edges, ...newEdges],
            crashPageInfo: { hasNextPage, hasPreviousPage }
          });
        } else if (filter == 1) {
          that.setData({
            ruleEdges: [...edges, ...newEdges],
            rulePageInfo: { hasNextPage, hasPreviousPage }
          });
        } else if (filter == 2) {
          that.setData({
            otherEdges: [...edges, ...newEdges],
            otherPageInfo: { hasNextPage, hasPreviousPage }
          });
        }
      },
      fail: function (err) {
        const { message } = err;
        wx.showModal({
          title: '加载失败',
          content: '网络或系统问题导致加载失败',
          showCancel: true,
          cancelText: '知道了',
          confirmText: '重试',
          success: function(res) {
            if (res.confirm) {
              // 重新加载
              that.loadCVideos();
            }
          }
        });
      },
    });
  },
  // 选择tab的时候过滤切换过滤条件
  tabClick: function (e) {
    const that = this;
    that.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
    // 初次加载数据
    const filter = e.currentTarget.id;
    if (filter == 0 && that.data['crashEdges'].length == 0) {
      that.loadVideos(filter);
    }
    if (filter == 1 && that.data['ruleEdges'].length == 0) {
      that.loadVideos(filter);
    }
    if (filter == 2 && that.data['otherEdges'].length == 0) {
      that.loadVideos(filter);
    }
  },
  // 视频播放开始
  onVideoPlay: function (e) {
    this.setData({ videoPhase: 'load'})
  },
  // 视频播放暂停
  onVideoPause: function (e) {

  },
  // 视频播放结束
  onVideoEnded: function (e) {

  },
  // 视频播放进度变化
  onVideoTimeUpdate: function (e) {

  }
});
