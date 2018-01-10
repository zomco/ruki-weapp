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
const QR = require('../../vendor/qrcode/index');
const base64 = require('../../vendor/base64/index');
const config = require('../../config');
const setCanvasSize = function(boxWidth) {
  var size = {};
  try {
    var res = wx.getSystemInfoSync();
    var scale = 750 / 686;//不同屏幕下canvas的适配比例；设计稿是750宽
    var width = boxWidth ? boxWidth / scale: res.windowWidth / scale;
    var height = width;//canvas画布为正方形
    size.w = width;
    size.h = height;
  } catch (e) {
    // Do something when catch error
    console.log("获取设备信息失败" + e);
  }
  return size;
};

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
      item: [],
      // 查询状态
      loading: false,
    },
    // 加载页面时获取实例
    onLoad: function(options) {
      const { id, shuffle, q } = options;
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        // 小程序内根据id获取详情
        this.bindButtonLoad(id);
      } else if ( shuffle == 1) {
        // 随机获取详情
        this.bindButtonShuffle();
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
    // 点击刷新，执行加载
    bindButtonLoad: function (id) {
      const me = this;
      wx.showLoading({ title: '加载中..' });
      me.setData({ loading: true });
      wafer.request({
        url: config.service.watchUrl,
        data: { id },
        success: function (res) {
          wx.hideLoading();
          me.setData({
            loading: false,
            item: res.data.result,
          });
        },
        fail: function (err) {
          wx.hideLoading();
          const { message } = err;
          me.setData({ loading: false });
          wx.showModal({
            title: '加载失败',
            content: '网络或系统问题导致加载失败',
          });
        }
      });
    },
    // 点击继续看看，执行查询
    bindButtonShuffle: function (e) {
      const me = this;
      wx.showLoading({ title: '加载中..' });
      me.setData({ loading: true });
      wafer.request({
        url: config.service.shuffleUrl,
        success: function (res) {
          wx.hideLoading();
          me.setData({
            loading: false,
            item: res.data.result,
          }); 
        },
        fail: function (err) {
          wx.hideLoading();
          me.setData({ loading: false });
          const { message } = err;
          wx.showModal({
            title: '加载失败',
            content: '网络或系统问题导致加载失败',
          });
        }
      });
    },
    // onReady: function () {
    //   const size = setCanvasSize(100);
    //   const { item: { source } } = this.data;
    //   QR.qrApi.draw(source, "mycanvas", size.w, size.h);
    // },
    // 点击复制按钮
    bindCopyLink: function () {
      const { item: { source } } = this.data;
      wx.setClipboardData({
        data: source,
        success: function (res) {
          wx.showToast({
            title: '复制成功',
          });
        }
      })
    },
    // 设置转发
    onShareAppMessage: function (options) {
      const { item: { title, posterFile, id } } = this.data;
      return {
        title: title,
        path: `/pages/detail/detail?id=${id}`,
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
