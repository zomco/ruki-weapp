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

const QR = require('../../vendor/qrcode/index');
const setCanvasSize = function() {
  var size = {};
  try {
    var res = wx.getSystemInfoSync();
    var scale = 750 / 686;//不同屏幕下canvas的适配比例；设计稿是750宽
    var width = res.windowWidth / scale;
    var height = width;//canvas画布为正方形
    size.w = width;
    size.h = height;
  } catch (e) {
    // Do something when catch error
    console.log("获取设备信息失败" + e);
  }
  return size;
};

Page({
    data: {
      item: []
    },
    onLoad: function(options) {
      try {
        const results = wx.getStorageSync('results');
        if (results) {
          const result = results.find(function(t) {
            return t.id === options.id;
          })
          this.setData({ item: result });
        }
      } catch (e) {
        console.error(e);
      }
    },
    onReady: function () {
      const size = setCanvasSize();
      const { item: { source } } = this.data;
      QR.qrApi.draw(source, "mycanvas", size.w, size.h);
    },
});
