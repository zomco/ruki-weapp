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
const { login } = require('../../util');

Page({
  data: {
    videoFile: null,
    videoThumb: null,
    videoPhase: '',
    videoProgress: '',
    time: '',
    date: '',
    coords: [],
    title: '',
    isAgree: false,
    isSubmiting: false,
    submitingError: null,
  },
  // 选择视频上传
  onChooseClick: function (e) {
    const that = this;
    wx.chooseVideo({
      sourceType: ['album'],
      compressed: false,
      maxDuration: 30,
      success: function (res) {
        const {
          tempFilePath,
          thumbTempFilePath,
          size,
          height,
          width,
          duration,
        } = res;
        that.setData({
          videoFile: tempFilePath,
          videoThumb: thumbTempFilePath,
          videoPhase: 'load',
        });
        // 自动执行上传
        that.onUploadClick();
      }
    })
  },
  // 取消上传
  onCancelClick: function (e) {
    if (this.task) {
      this.task.abort();
    }
    this.setData({
      videoFile: null,
      videoThumb: null,
      videoPhase: null,
      videoProgress: '',
    });
  },
  // 执行上传
  onUploadClick: function (e) {
    const { videoFile } = this.data;
    const that = this;
    login(function (res) {
      // 模拟wafer从storage获取skey和id
      wx.getStorage({
        key: 'weapp_session_' + WX_SESSION_MAGIC_ID,
        success: function(res) {
          const { id, skey } = res.data;
          const authHeader = {};
          authHeader[WX_HEADER_ID] = id;
          authHeader[WX_HEADER_SKEY] = skey;
          const task = wx.uploadFile({
            url: config.service.uploadUrl,
            filePath: videoFile,
            name: 'file',
            header: authHeader,
            success: function (res) {
              const data = res.data
              that.setData({ videoPhase: 'success' });
            },
            fail: function (res) {
              that.setDat({ videoPhase: 'fail' });
            }
          });
          task.onProgressUpdate(function (res) {
            const { progress } = res;
            that.setData({ videoProgress: progress });
          });
          that.task = task;
        },
      })
    });
  },
  // 日期发生变化
  onDateClick: function (e) {
    this.setData({
      date: e.detail.value
    });
  },
  // 时间发生变化
  onTimeClick: function (e) {
    this.setData({
      time: e.detail.value
    });
  },
  // 位置发生变化
  onCoordsClick: function (e) {

  },
  // 标题发生变化
  onTitleChange: function (e) {
    this.setData({
      title: e.detail.value
    });
  },
  // 条款同意时发生变化
  onIsAgreeClick: function (e) {
    const oldIsAgree = this.data.isAgree;
    this.setData({
      isAgree: !oldIsAgree
    })
  },
  // 提交表单
  onFormSubmit: function (e) {

  },
  // 重置表单
  onFormReset: function (e) {
    this.setData({
      videoFile: null,
      videoThumb: null,
      videoPhase: '',
      videoProgress: '',
      time: '',
      date: '',
      coords: [],
      title: '',
      isAgree: false,
    })
  }
});
