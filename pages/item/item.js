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
const { 
  WX_SESSION_MAGIC_ID, 
  WX_HEADER_ID,
  WX_HEADER_SKEY, 
} = require('../../vendor/wafer-client-sdk/lib/constants.js');
const config = require('../../config');
const { login, chooseLocation } = require('../../util');

Page({
  data: {
    // 实例
    video: {},
    videoPhase: null,
    // 查询状态
    isLoading: false,
    loadingError: null,
    // 更新状态
    isSubmiting: false,
    submitingError: null,
  },
  // 加载页面时获取实例
  onLoad: function (options) {
    const { id } = options;
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      // 小程序内根据id获取详情
      this.loadVideo(id);
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
      data: { filter: '-1' },
      success: function (res) {
        wx.hideLoading();
        me.setData({
          isLoading: false,
          loadingError: null,
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
  // 标题发生变化
  onTitleChange: function (e) {
    this.setData({
      title: e.detail.value
    });
  },
  // 提交表单
  onFormSubmit: function (e) {
    const that = this;
    const {
      video,
      title,
    } = that.data;
    that.setData({ 
      isSubmiting: true,
      submitingError: null,
    });
    wafer.request({
      login: true,
      method: 'PUT',
      data: { title },
      url: `${config.service.videoUrl}/${video.id}`,
      success: function (res) {
        if (res.statusCode === '200') {
          const { id } = res.data;
          that.setData({
            isSubmiting: false,
            submitingError: null,
          });
        } else {
          that.setData({
            isSubmiting: false,
            submitingError: '系统问题',
          });
          wx.showToast({
            title: '系统问题，发布视频失败',
            icon: 'none',
          });
        }
      },
      fail: function (res) {
        that.setData({ 
          isSubmiting: false,
          submitingError: '网络问题',
        });
        wx.showToast({
          title: '网络问题，更新视频失败',
          icon: 'none',
        });
      }
    });
  },
});
