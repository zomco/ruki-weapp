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

const { login } = require('../../util');
const wafer = require('../../vendor/wafer-client-sdk/index');
const config = require('../../config');

Page({
  data: {
    cacheSize: '',
    me: null,
    autoPlay: false,
    historyEdges: [],
    itemEdges: [],
    isItemLoading: false,
    itemLoadingError: null,
    isHistoryLoading: false,
    historyLoadingError: null,
  },
  onShow: function () {
    try {
      const that = this;
      // 缓存大小
      const { currentSize } = wx.getStorageInfoSync();
      that.setData({ cacheSize: `${currentSize} kb` });
      // 全局变量自动播放
      const app = getApp();
      this.setData({ autoPlay: app.autoPlay });
      // 获取用户信息
      const me = wx.getStorageSync('me');
      if (me) {
        this.setData({
          me,
          isLoading: true,
          loadingError: null,
        });
        // 获取历史观看
        that.loadHistories();
        // 获取管理视频
        that.loadItems();
      } else {
        // 获取历史观看
        const historyEdges = wx.getStorageSync('historyEdges');
        that.setData({ me, historyEdges });
      }
    } catch (e) {
      console.error(e);
    }
  },
  loadHistories: function () {
    const that = this;
    wafer.request({
      login: true,
      data: { first: 10, filter: '-2' },
      url: config.service.videoUrl,
      success: function (res) {
        if (res.statusCode == '200') {
          const {
            edges: newEdges,
          } = res.data.connection;
          that.setData({
            isHistoryLoading: false,
            historyLoadingError: null,
            historyEdges: newEdges,
          });
        } else {
          that.setData({
            isHistoryLoading: false,
            historyLoadingError: '系统问题',
          });
        }
      },
      fail: function (err) {
        const { errMsg } = err;
        that.setData({
          isHistoryLoading: false,
          historyLoadingError: errMsg,
        });
      }
    });
  },
  loadItems: function () {
    const that = this;
    wafer.request({
      login: true,
      data: { first: 10, filter: '-1' },
      url: config.service.videoUrl,
      success: function (res) {
        if (res.statusCode == '200') {
          const { 
            edges: newEdges,
          } = res.data.connection;
          that.setData({
            isItemLoading: false,
            itemLoadingError: null,
            itemEdges: newEdges,
          });
        } else {
          that.setData({
            isItemLoading: false,
            itemLoadingError: '系统问题',
          });
        }
      },
      fail: function (err) {
        const { errMsg } = err;
        that.setData({
          isItemLoading: false,
          itemLoadingError: errMsg,
        });
      }
    });
  },
  // 全局自动播放切换
  onAutoPlayClick: function () {
    const app = getApp();
    app.autoPlay = !app.autoPlay;
  },
  // 清除缓存
  onCacheClick: function () {
    wx.clearStorage();
    try {
      const res = wx.getStorageInfoSync();
      this.setData({ cacheSize: `${res.currentSize} kb` });
      wx.showToast({
        title: '清理成功',
      });
    } catch (e) {
      // Do something when catch error
    }
  },
  // 游客登录
  onGeustClick: function () {
    const that = this;
    login(function (res) {
      that.setData({ me: res });
      wx.setStorage({
        key: 'me',
        data: res,
      });
    });
  }
});
