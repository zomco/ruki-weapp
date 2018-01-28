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

Page({
  data: {
    cacheSize: '',
    me: null,
  },
  onShow: function () {
    const that = this;
    wx.getStorageInfo({
      success: function(res) {
        that.setData({ cacheSize: `${res.currentSize} kb` });
      },
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
    wx.getUserInfo({
      success: function (res) {
        that.setData({ me: res.userInfo });
        wx.setStorage({
          key: 'me',
          data: res.userInfo,
        });
      },
      fail: function (res) {
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        })
      }
    })
  }
});
