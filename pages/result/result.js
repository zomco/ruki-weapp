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
      resultArray: [{
        id: '2aeed9c0-8e25-11e7-b21b-ebf98c91c2d9',
        isCrash: false,
        isRule: true,
        screenshot: 'https://www.ruki.pw/poster/cG9zdGVyOmdvcHJvLzkubXA0.png',
        video: 'https://www.ruki.pw/video/a9020c30-8d60-11e7-b61d-5f739919cc47',
      }, {
        id: '2aeed9c0-8e25-11e7-b21b-ebf98c91c2d8',
        isCrash: true,
        isRule: false,
        screenshot: 'https://www.ruki.pw/poster/cG9zdGVyOmdvcHJvLzkubXA0.png',
        video: 'https://www.ruki.pw/video/a9020c30-8d60-11e7-b61d-5f739919cc47',
      }]
    },
    onLoad: function(options) {
      const { q } = options;
      console.log(options);
    },
});
