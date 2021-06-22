// pages/recording/recording.js
import {
  questionsAudioUrls,
  listening,
  waiting,
  speaking
} from '../../utils/data.js'
const innerAudioContext = wx.createInnerAudioContext()
const recorderManager = wx.getRecorderManager()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    questionIndexDict: {
      0: "First",
      1: "Second",
      2: "Third",
    },
    questions: [
      [
        "Talk about a recent activity that made you happy.",
        "What would you like to do most when you relax? Why?",
        "Talk about a person who has a positive impact on your life? How has he/she influence on you?",
        "When was the last time you felt happy/excited? Why?",
        "What do you like most about your hometown?",
        "Describe one of your best friends and explain what attracts you to him/her?",
      ],
      [
        "What's your major in the college? Why did you choose this major?",
        "Do you like children? Why?",
        "What kind of job would you like to have in the future? Why?",
        "Talk about one of your family members.",
        "What is the most impressive experience you have had?",
        "What do you usually do when you're alone?",
      ],
      [
        "What is your biggest regret in life?",
        "When was the last time you argued with someone? Why?",
        "Do you often have insomnia? How do you feel when you can't fall asleep?",
        "When was the last time you felt unhappy/angry/upset? Why?",
        "How do you control your emotions when you are angry?",
        "Talk about a person or a thing you dislike the most.",
      ],
    ],
    curBoxIndex: 0,
    curQuesIndex: -1,
    timeCounter: 2,
    timeDisplay: '0:00',
    timerId: 0,
    // 结束: 0, 未开始:1, 已开始:2
    flag: 1,
    opButtClass: 'start',
    opIconFont: 'icon-start',
    timerClass: 'timer-not-start',
    curRecFilePath: '',
    timerIds: '',
    replaying: false,
    shizukuState: waiting,
    shizukuSpeaking: true,
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
    if (wx.canIUse('hideHomeButton'))
      wx.hideHomeButton()

    let id;
    id = Math.floor(Math.random() * 10) % 6;

    this.setData({
      curQuesIndex: id,
    });

    recorderManager.onStop(res => {
      const {
        tempFilePath
      } = res
      this.setData({
        curRecFilePath: tempFilePath
      })
    })

    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })

    innerAudioContext.onStop(() => {
      console.log('停止播放')
    })

    innerAudioContext.onEnded(() => {
      console.log('结束播放')
      if (this.data.replaying)
        this.setData({
          replaying: false
        })
      else {
        this.setData({
          shizukuState: waiting,
          shizukuSpeaking: false
        })
      }
    })

    this.playShizikuAudio()
  },

  onReplayClick() {
    innerAudioContext.src = this.data.curRecFilePath
    if (this.data.replaying) {
      this.setData({
        replaying: false
      })
      innerAudioContext.stop()
    } else {
      this.setData({
        replaying: true
      })
      innerAudioContext.play()
    }
  },

  updateTime() {
    const timeCounter = this.data.timeCounter + 1;
    const min = parseInt(this.data.timeCounter / 60);
    const sec = this.data.timeCounter % 60 > 9 ? this.data.timeCounter % 60 : '0' + this.data.timeCounter % 60;
    this.setData({
      timeCounter: timeCounter,
      timeDisplay: min + ':' + sec
    })
  },

  async onOpButtClick() {
    // 录音已经开始，点击按钮时录音结束
    if (this.data.flag == 2) {
      clearInterval(this.data.timerId)
      recorderManager.stop();
      this.setData({
        flag: 0,
        opButtClass: 'next',
        opIconFont: 'icon-next',
        timerClass: 'timer-stop',
        shizukuState: waiting,
      })
    } else if (this.data.flag == 1) {
      // 录音未开始，点击按钮时录音开始
      const timerId = setInterval(() => {
        const timeCounter = this.data.timeCounter + 1;
        const min = parseInt(this.data.timeCounter / 60);
        const sec = this.data.timeCounter % 60 > 9 ? this.data.timeCounter % 60 : '0' + this.data.timeCounter % 60;
        this.setData({
          timeCounter: timeCounter,
          timeDisplay: min + ':' + sec
        })
      }, 1000);
      this.setData({
        flag: 2,
        timerId,
        timeDisplay: '0:01',
        opButtClass: 'stop',
        opIconFont: 'icon-stop',
        timerClass: 'timer-started',
        shizukuState: listening,
      });
      if (this.data.shizukuSpeaking) {
        innerAudioContext.stop()
        if (this.data.shizukuTimer)
          clearInterval(this.data.shizukuTimer)
        this.setData({
          shizukuSpeaking: false
        })
      }
      recorderManager.start({
        duration: 1200000,
        format: "mp3",
        sampleRate: 16000, //采样率
      });
    } else if (this.data.flag == 0) {
      // 录音已结束，点击按钮跳到下一个问题
      const {
        curBoxIndex,
        curRecFilePath,
        positive,
        negative,
        neutral,
      } = this.data

      wx.showLoading({
        mask: true
      })
      const that = this
      let filename
      // 上传文件
      await wx.uploadFile({
        filePath: curRecFilePath,
        name: 'file',
        url: 'http://127.0.0.1:5000/api/upload',
        success(res) {
          filename = JSON.parse(res.data).filename
          console.log(curBoxIndex, filename)
          switch (curBoxIndex) {
            case 0:
              that.setData({
                positive: filename,
              });
            case 1:
              that.setData({
                neutral: filename,
              });
            case 2:
              that.setData({
                negative: filename,
              });
          }
          console.log(that.data)
          if (curBoxIndex == 2) {
            // console.log({positive})
            // console.log({neutral})
            // console.log({negative})
            wx.request({
              url: `http://127.0.0.1:5000/api/predict?positive=${that.data.positive}&neutral=${that.data.neutral}&negative=${that.data.negative}`,
              success (res) {
                const depression_score = res.data['depression_score']
                wx.navigateTo({
                  url: `/pages/questionnaire/questionnaire?depscore=${depression_score[0]}&positive=${that.data.positive}&neutral=${that.data.neutral}&negative=${that.data.negative}`,
                })
              },
              fail () {
                wx.showToast({
                  title: '网络错误，请重试',
                  icon: 'none',
                  duration: 2000
                })
              }
            })
          } else {
            let id;
            id = Math.floor(Math.random() * 10) % 6;
            wx.hideLoading()
            that.setData({
              curQuesIndex: id,
              curBoxIndex: curBoxIndex + 1,
              opButtClass: 'start',
              opIconFont: 'icon-start',
              flag: 1,
              timeCounter: 2,
              timeDisplay: '0:00',
              timerClass: 'timer-not-start',
              shizukuState: waiting,
              curRecFilePath: '',
              shizukuSpeaking: true,
            });
            // 跳转到第二个问题后强制说话
            that.playShizikuAudio()
          }
        },
        fail() {
          wx.showToast({
            title: '更新数据库错误，请重试',
            icon: 'none',
            duration: 2000
          })
        }
      })


    }
  },

  getRandList() {
    let i = 0,
      rand = []
    while (rand.length < 60) {
      let randNum = Math.floor(Math.random() * 1000);
      if (rand.indexOf(randNum) > -1)
        continue;
      rand.push(randNum)
    }
    return rand
  },

  onRestartClick() {
    const timerId = setInterval(() => {
      const timeCounter = this.data.timeCounter + 1;
      const min = parseInt(this.data.timeCounter / 60);
      const sec = this.data.timeCounter % 60 > 9 ? this.data.timeCounter % 60 : '0' + this.data.timeCounter % 60;
      this.setData({
        timeCounter: timeCounter,
        timeDisplay: min + ':' + sec
      })
    }, 1000)
    this.setData({
      flag: 2,
      timeCounter: 1,
      timeDisplay: '0:00',
      opButtClass: 'stop',
      opIconFont: 'icon-stop',
      timerClass: 'timer-started',
      timerId,
      curRecFilePath: '',
      shizukuState: listening,
    })
    recorderManager.start({
      duration: 1200000,
      format: "mp3",
      sampleRate: 16000, //采样率
    })
  },

  onHelpClick() {
    const {
      flag,
      curBoxIndex
    } = this.data;
    let content;
    if (flag == 1) {
      content = "Please read the question carefully, then click the record button below to answer. Click on the refresh button on the right side of the question index to change the question."
    } else if (flag == 2) {
      content = "Click the stop button below to stop recording."
    } else if (flag == 0) {
      if (curBoxIndex == 2)
        content = "Click the stop button below to the next step."
      else
        content = "After recording, you can choose to re-record or replay the recording."
    }
    wx.showModal({
      title: 'Hint',
      content,
      showCancel: false,
    })
  },

  onRefreshClick() {
    if (this.data.flag != 1)
      return;
    let newid;
    newid = Math.floor(Math.random() * 10) % 6;

    while (newid == this.data.curQuesIndex)
      newid = Math.floor(Math.random() * 10) % 6;

    this.setData({
      curQuesIndex: newid,
    });
    this.playShizikuAudio()
  },

  onShizukuLoad() {
    const {
      flag,
      curBoxIndex,
      curQuesIndex,
      curRecFilePath,
      shizukuSpeaking
    } = this.data

    if (flag == 1 && curRecFilePath.length == 0) {
      innerAudioContext.src = questionsAudioUrls[curBoxIndex][curQuesIndex]
      if (shizukuSpeaking) {
        this.setData({
          shizukuState: speaking
        })
        innerAudioContext.play()
      }
    }
  },

  playShizikuAudio(e) {
    if (this.data.flag == 2 || (this.data.shizukuSpeaking && e)) {
      return
    }
    let that = this
    const {
      curBoxIndex,
      curQuesIndex
    } = this.data
    this.setData({
      shizukuSpeaking: true,
      shizukuState: speaking,
    })
    innerAudioContext.src = questionsAudioUrls[curBoxIndex][curQuesIndex]
    innerAudioContext.play()
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