// pages/evaluate/evaluate.js
import {
  getCurrentPageParam
} from '../../utils/util'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    suggestion: '',
    title: '',
    threshold: 60,
    scoreClass: '',
    hintClass: '',
  },

  onSuggestionClick(e) {
    const suggestion = e.target.dataset.suggestion
    this.setData({
      suggestion,
      show: true,
      title: e.target.dataset.title
    })
  },

  onOkClick() {
    this.setData({
      show: false
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const options = getCurrentPageParam()
    const {
      threshold
    } = this.data
    const score = Math.round(options.depscore)
    this.setData({
      score,
      scoreClass: score > threshold ? 'score-depressed' : 'score-nondepressed',
      hintClass: score > threshold ? 'hint-depressed' : 'hint-nondepressed',
      circleColor: score > threshold ? '#D53F8C' : '#319795',
      depSuggestion: score > threshold ? 'Your depression score is above the threshold. If your depression lasts for more than two weeks, you may as well seek medical attention.' : 'Your depression score is below the threshold. We believe that you are mentally healthy or you are experiencing transient depression.'
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})