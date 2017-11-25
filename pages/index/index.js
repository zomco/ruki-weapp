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

const charsAlphabetCount = function(chars) {
  let count = 0;
  const sequences = chars.substr(2);
  const pattern = new RegExp('[A-Z]');
  for (let i = 0; i < sequences.length; i++) {
    if (pattern.test(sequences[i])) {
      count++;
    }
  }
  return count;
};

const charsMap = [
  ['京', '津', '冀', '晋', '蒙', '辽', '吉', '黑', '沪', '苏', '浙', '皖', '闽', '赣', '鲁', '豫', '鄂', '湘', '粤', '桂', '琼', '川', '贵', '云', '渝', '藏', '陕', '甘', '青', '宁', '新'],
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
];

const charsSet = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

Page({
    data: {
      // 是否显示键盘
      keyboard: false,
      // 键盘的按键
      keyboardArray: null,
      // 当前选中的车牌位
      charsIndex: null,
      // 选中的车牌
      charsArray: ['京', 'A', '0', '0', '0', '0', '0'],
      // 热门标签
      hotTags: [],
      // 最新标签
      newTags: [],
      // 查询状态
      loading: false,
      // 车牌总数
      plateCount: 0,
      // 当前地址
      address: '',
    },
    // 页面加载获取用户位置
    onLoad: function(options) {
      // wx.getLocation({
      //   success: function(res) {
      //     const { latitude, longitude } = res;
      //     wx.setStorageSync('location', res);
      //   },
      // });
    },
    // 页面显示加载标签
    onShow: function() {
      const location = wx.getStorageSync('location');
      const me = this;
      wafer.request({
        url: config.service.showUrl,
        data: { 
          latitude: location && location.latitude,
          longitude: location && location.longitude, 
        },
        success: function (res) {
          me.setData({ 
            'hotTags': res.data.hotTags,
            'newTags': res.data.newTags,
            'address': res.data.address,
            'plateCount': res.data.plateCount
          });
        },
        fail: function (err) {
          const { message } = err;
          wx.showModal({
            title: '加载失败',
            content: '网络或系统问题导致加载失败',
            showCancel: false,
            cancelText: '知道了',
          });
        },
      });
    },
    // 点击查询按钮，执行查询
    bindButtonSearch: function(e) {
      const { detail: { userInfo } } = e;
      if (userInfo) {
        this.bindSearch();
      } else {
        wx.showModal({
          title: '授权失败',
          content: '非授权用户无法查询',
          showCancel: false,
          cancelText: '知道了',
        });
      }
    },
    // 执行查询
    bindSearch: function(e) {
      const me = this;
      wx.showLoading({
        title: '查询中..',
      });
      me.setData({ loading: true });
      const chars = this.data.charsArray.join('');
      const location = wx.getStorageSync('location');
      wafer.request({
        login: true,
        url: config.service.searchUrl,
        data: { 
          chars, 
          latitude: location && location.latitude,
          longitude: location && location.longitude,
        },
        success: function(res) {
          wx.hideLoading();
          me.setData({ loading: false });
          try {
            wx.setStorageSync('chars', chars)
            wx.setStorageSync('results', res.data.results);
            wx.navigateTo({
              url: `/pages/result/result`,
            });
          } catch (e) {
            console.error(e);
          }
        },
        fail: function(err) {
          wx.hideLoading();
          me.setData({ loading: false });
          const { message } = err;
          wx.showModal({
            title: '查询失败',
            content: '网络或系统问题导致查询失败',
          });
        }
      });
    },
    // 点击标签，执行查询
    bindTagSearch: function(e) {
      const { dataset: { value } } = e.target;
      this.setData({ charsArray: value.split('') });
      this.bindSearch();
    },
    // 点击虚拟键盘，触发车牌字符改变
    bindKeyboardButton: function(e) {
      const { dataset: { value } } = e.target;
      const { charsArray, charsIndex } = this.data;
      charsArray[charsIndex] = value;
      this.setData({ charsArray });
    },
    // 点击车牌字符，触发显示虚拟键盘
    bindKeyboardShow: function(e) {
      const { target: { dataset: { index } } } = e;
      const { charsArray } = this.data;
      let keyboardArray = charsMap[index];
      // 第二位至第七位最多有两位是字母
      if (charsAlphabetCount(charsArray.join('')) === 2
        && index !== 0 && index !== 1 
        && charsSet.indexOf(charsArray[index]) !== -1
      ) {
        keyboardArray = charsSet;
      }
      this.setData({ keyboard: true, keyboardArray, charsIndex: index});
    },
    // 点击车牌字符以外的区域，触发隐藏虚拟键盘
    bindKeyboardHide: function(e) {
      const { target: { dataset: { index } } } = e;
      if (index === undefined) {
        this.setData({ keyboard: false, keyboardArray: null, charsIndex: null });
      }
    },
});
