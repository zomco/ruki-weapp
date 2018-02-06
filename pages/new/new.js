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
    // 视频文件
    videoFile: null,
    videoThumb: null,
    videoPhase: '',
    videoProgress: 0,
    videoRaw: null,
    // 时间日期
    time: '',
    date: '',
    // 地理位置
    latitude: 0,
    longitude: 0,
    location: '',
    // 标题
    title: '',
    // 条款同意
    isAgree: false,
    isSubmiting: false,
    submitingError: null,
    // 标题编辑
    isPopup: false,
    isPopupFocus: false,
    // 用户信息
    me: null,
  },
  onShow: function () {
    try {
      // 获取用户信息
      const me = wx.getStorageSync('me');
      this.setData({ me });
    } catch (e) {
      console.error(e);
    }
    // 关闭标题编辑
    this.setData({
      isPopup: false,
      isPopupFocus: false,
    });
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
  onLocationClick: function (e) {
    const that = this;
    chooseLocation(function (res) {
      that.setData({
        latitude: res.latitude,
        longitude: res.longitude,
        location: res.address,
      });
    });
  },
  // 标题发生变化
  onTitleChange: function (e) {
    this.setData({
      title: e.detail.value
    });
  },
  // 点击标题弹出标题编辑
  onPopupShow: function (e) {
    this.setData({
      isPopup: true,
      isPopupFocus: true,
    });
  },
  // 点击完成隐藏标题编辑
  onPopupHide: function (e) {
    this.setData({
      isPopup: false,
      isPopupFocus: false,
    })
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
    const that = this;
    const {
      videoRaw,
      date,
      time,
      longitude,
      latitude,
      title,
    } = that.data;
    that.setData({
      isSubmiting: true,
      submitingError: null,
    });
    wafer.request({
      login: true,
      method: 'POST',
      data: {
        raw: videoRaw,
        date,
        time,
        lng: longitude,
        lat: latitude,
        title,
      },
      url: config.service.videoUrl,
      success: function (res) {
        if (res.statusCode == '200') {
          const { id } = res.data;
          that.setData({
            isSubmiting: false,
            submitingError: null,
          });
          wx.showModal({
            title: '提交成功',
            content: '视频正在转码，完成后可在「我的视频」查看',
            confirmText: '好的',
            showCancel: false,
            complete: function () {
              that.onFormReset();
              wx.switchTab({ url: '/pages/index/index' });
            }
          });
        } else {
          that.setData({
            isSubmiting: false,
            submitingError: '系统问题',
          });
          wx.showToast({
            title: `翻车了(系统问题)`,
            icon: 'none',
          });
        }
      },
      fail: function (err) {
        const { errMsg } = err;
        that.setData({ 
          isSubmiting: false,
          submitingError: errMsg,
        });
        wx.showToast({
          title: `网络问题(${errMsg})，请稍后再试`,
          icon: 'none',
        });
      }
    });
  },
  // 重置表单
  onFormReset: function (e) {
    this.setData({
      // 视频文件
      videoFile: null,
      videoThumb: null,
      videoPhase: '',
      videoProgress: 0,
      videoRaw: null,
      // 时间日期
      time: '',
      date: '',
      // 地理位置
      latitude: 0,
      longitude: 0,
      location: '',
      // 标题
      title: '',
      // 条款同意
      isAgree: false,
      isSubmiting: false,
      submitingError: null,
      // 标题编辑
      isPopup: false,
      isPopupFocus: false,
    })
  },
  // 登录成功
  onLoginSuccess: function (e) {
    const { userInfo: me } = e.detail;
    const that = this;
    if (me) {
      that.setData({ me });
      wx.setStorage({
        key: 'me',
        data: me,
      });
      wafer.login({
        success: function (userInfo) {
          that.chooseVideo();
        },
        fail: function (err) {
          wx.showToast({
            title: `登录失败(${err})`,
            icon: 'none',
          })
        },
      });
    }
  },
  // 选择视频上传
  chooseVideo: function (e) {
    const that = this;
    wx.chooseVideo({
      sourceType: ['album'],
      compressed: false,
      maxDuration: 30,
      success: function (res) {
        const {
          tempFilePath,
          thumbTempFilePath,
        } = res;
        that.setData({
          videoFile: tempFilePath,
          videoThumb: thumbTempFilePath,
        });
        // 自动执行上传
        that.uploadVideo();
      },
    })
  },
  // 执行上传
  uploadVideo: function (e) {
    const { videoFile } = this.data;
    const that = this;
    that.setData({ videoPhase: 'load' });
    // 模拟wafer从storage获取skey和id
    wx.getStorage({
      key: 'weapp_session_' + WX_SESSION_MAGIC_ID,
      success: function (res) {
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
            const { raw, meta } = JSON.parse(res.data);
            that.setData({
              videoPhase: 'success',
              videoRaw: raw,
              date: meta.date,
              time: meta.time,
            });
          },
          fail: function (res) {
            that.setData({ videoPhase: 'fail' });
          }
        });
        task.onProgressUpdate(function (res) {
          const { progress } = res;
          that.setData({ videoProgress: progress });
        });
        that.task = task;
      },
    })
  },
});
