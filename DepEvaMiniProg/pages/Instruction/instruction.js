// pages/Instruction/instruction.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    steps: [
      {
        icon: "/images/step1.svg",
        title: "Step 1",
        content: "Read the questions displayed on the screen.",
      },
      {
        icon: "/images/step2.svg",
        title: "Step 2",
        content: "Click the recording button below to answer the questions.",
      },
      {
        icon: "/images/step3.svg",
        title: "Step 3",
        content: "You can replay re-record your response.",
      },
      {
        icon: "/images/step4.svg",
        title: "Step 4",
        content: 'Click the "Evaluate" to obtain your depression score.',
      },
    ],
  },

  goback() {
    wx.navigateBack({
      delta: 1
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