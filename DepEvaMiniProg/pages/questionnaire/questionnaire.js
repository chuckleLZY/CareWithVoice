// pages/questionnaire/questionnaire.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag: 1,
    optionItems: {
      positive: [{
          name: "A little of the time",
          value: 1,
        },
        {
          name: "Some of the time",
          value: 2,
        },
        {
          name: "Good part of the time",
          value: 3,
        },
        {
          name: "Most of the time",
          value: 4,
        },
      ],
      reverse: [{
          name: "A little of the time",
          value: 4,
        },
        {
          name: "Some of the time",
          value: 3,
        },
        {
          name: "Good part of the time",
          value: 2,
        },
        {
          name: "Most of the time",
          value: 1,
        },
      ],
    },
    descItems: [{
        desc: "1. I feel down-hearted and blue.",
        value: "positive",
      },
      {
        desc: "2. I have trouble sleeping at night.",
        value: "positive",
      },
      {
        desc: "3.  Morning is when I feel the best.",
        value: "reverse",
      },
      {
        desc: "4. I have crying spells or feel like it.",
        value: "positive",
      },
      {
        desc: "5. I eat as much as I used to.",
        value: "reverse",
      },
      {
        desc: "6. I still enjoy sex",
        value: "reverse",
      },
      {
        desc: "7. I have trouble with constipation.",
        value: "positive",
      },
      {
        desc: "8. I notice that I am losing weight.",
        value: "positive",
      },
      {
        desc: "9. My heart beats faster than usual.",
        value: "positive",
      },
      {
        desc: "10. I get tired for no reason.",
        value: "positive",
      },
      {
        desc: "11. My mind is as clear as it used to be.",
        value: "reverse",
      },
      {
        desc: "12. I am restless and can’t keep still.",
        value: "positive",
      },
      {
        desc: "13. I feel hopeful about the future.",
        value: "reverse",
      },
      {
        desc: "14. I am more irritable than usual.",
        value: "positive",
      },
      {
        desc: "15. My life is pretty full.",
        value: "reverse",
      },
      {
        desc: "16. I find it easy to make decisions.",
        value: "reverse",
      },
      {
        desc: "17. I feel that I am useful and needed.",
        value: "reverse",
      },
      {
        desc: "18. I feel that others would be better off if I were dead.",
        value: "positive",
      },
      {
        desc: "19. I still enjoy the things I used to do.",
        value: "reverse",
      },
      {
        desc: "20. I find it easy to do the things I used to.",
        value: "reverse",
      },
    ],
    curDescIndex: -1,
    curOption: -1,
    descOption: new Array(20).fill(-1),
  },
  bindRadioChange: function (e) {
    this.setData({
      curOption: e.detail.value
    })
  },
  bindDescChange: function (e) {
    const index = e.currentTarget.id
    let descOption = this.data.descOption
    const {curOption} = this.data

    descOption[index] = curOption
    this.setData({
      curDescIndex: e.currentTarget.id,
      descOption,
    })
  },
  onOpButtClick: async function () {
    const {
      descOption,
      depscore,
      positive,
      negative,
      neutral
    } = this.data
    if (Object.keys(descOption).length < 20) {
      wx.showToast({
        title: '请填写完毕后提交',
        icon: 'none',
        duration: 2000
      })
      return
    }
    let score = 0;
    descOption.map((item) => {
      score += Number(item);
    });
    console.log(descOption, score)
    wx.showLoading()
    await wx.request({
      url: `http://127.0.0.1:5000/api/record?score=${score}&positive=${positive}&neutral=${neutral}&negative=${negative}&depscore=${depscore}`,
      success() {
        // 跳转页面
        wx.navigateTo({
          url: `/pages/evaluate/evaluate?depscore=${depscore}`,
        })
      },
      fail() {
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      }
    })
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
    const {
      depscore,
      positive,
      negative,
      neutral
    } = options
    this.setData({
      depscore,
      positive,
      negative,
      neutral
    })
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