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

const wafer = require('./vendor/wafer-client-sdk/index');
const config = require('./config');

// 用户登录授权交互
const login = function (cb) {
  const that = this;
  wafer.login({
    success: function (res1) {
      cb(res1);
    },
    fail: function (res1) {
      wx.getSetting({
        success: function (res2) {
          if (!res2.authSetting['scope.userInfo']) {
            wx.openSetting({
              success: function (res3) {
                if (res3.authSetting['scope.userInfo']) {
                  wafer.login({
                    success: function (res4) {
                      cb(res4);
                    },
                    fail: function () {
                      wx.showToast({
                        title: '系统登录问题了，登录失败',
                        icon: 'none'
                      });
                    }
                  });
                } else {
                  wx.showToast({
                    title: '授予权限出问题了，登录失败',
                    icon: 'none'
                  });
                }
              },
              fail: function () {
                wx.showToast({
                  title: '打开权限问题了，登录失败',
                  icon: 'none'
                });
              }
            });
          } else {
            wx.showToast({
              title: '系统登录出问题了，登录失败',
              icon: 'none'
            });
          }
        },
        fail: function () {
          wx.showToast({
            title: '获取权限出问题了，登录失败',
            icon: 'none'
          });
        }
      });
    }
  });
};

// 用户选择位置权限交互
const chooseLocation = function (cb) {
  wx.chooseLocation({
    success: function (res1) {
      cb(res1);
    },
    fail: function (res1) {
      if (res1.errMsg === "chooseLocation:fail auth deny") {
        wx.openSetting({
          success: function (res2) {
            if (res2.authSetting['scope.userLocation']) {
              wx.chooseLocation({
                success: function (res3) {
                  cb(res3);
                }
              });
            } else {
              wx.showToast({
                title: '授予权限出问题了，选择地点失败',
                icon: 'none'
              });
            }
          },
          fail: function () {
            wx.showToast({
              title: '打开权限问题了，选择地点失败',
              icon: 'none'
            });
          }
        });
      }
    }
  })
};

module.exports = { login, chooseLocation };