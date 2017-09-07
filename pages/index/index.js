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

const indexToPlate = function(multiArray, multiIndex) {
  const values = [];
  for (let i = 0; i < multiArray.length; i++) {
    values.push(multiArray[i][multiIndex[i]]);
  }
  return values.join('');
};

const isValidPlate = function(plate) {
  let count = 0;
  const sequences = plate.substr(2);
  const pattern = new RegExp('[A-Z]');
  for (let i = 0; i < sequences.length; i++) {
    if (pattern.test(sequences[i])) {
      count++;
    }
  }
  return count <= 2;
};

Page({
    data: {
      multiArray: [
        ['京', '津', '冀', '晋', '蒙', '辽', '吉', '黑', '沪', '苏', '浙', '皖', '闽', '赣', '鲁', '豫', '鄂', '湘', '粤', '桂', '琼', '川', '贵', '云', '渝', '藏', '陕', '甘', '青', '宁', '新'],
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q','R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      ],
      multiIndex: [0, 0, 0, 0, 0, 0, 0],
      tags: ['粤X12345', '粤E12345', '粤E12345', '粤E12345', '粤E12345', '粤E12345'],
      loading: false,
      valid: true,
    },
    bindMultiPickerChange: function(e) {
      const { value } = e.detail;
      const { multiArray, multiIndex } = this.data;
      const plate = indexToPlate(multiArray, multiIndex);
      this.setData({ valid: isValidPlate(plate) });
    },
    bindMultiPickerColumnChange: function(e) {
      const { column, value } = e.detail;
      const { multiIndex } = this.data;
      multiIndex[column] = value;
      this.setData({ multiIndex });
    },
    bindSearchButton: function(e) {
      this.setData({ loading: true });
      const { multiArray, multiIndex } = this.data;
      const plate = indexToPlate(multiArray, multiIndex);
      const me = this;
      wafer.request({
        login: true,
        url: config.service.searchUrl,
        data: { plate },
        success: function(res) {
          me.setData({ loading: false });
          console.log(res);
        },
        fail: function(err) {
          me.setData({ loading: false });
          const { message } = err;
          wx.showModal({
            title: '查询失败',
            content: message,
          });
        }
      });
    },
});
