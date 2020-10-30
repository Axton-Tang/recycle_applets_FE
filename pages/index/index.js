const app = getApp()

Page({
  data: {
    client: null,
    connectState: 0,
    state: 0,
    temp: '0',
    humi: '0'
  },

  openDoor() {
    const that = this
    wx.scanCode({
      success(res) {
        if (res.result === '4554se2es323d33fsfsds32ds3fdsfsdasdasddsa') {
          wx.showLoading({
            title: '请稍后！',
          })
          app.globalData.client.publish('/sys/a1JSfLzzsjQ/mini_console/thing/event/property/post',
            '{"method": "thing.service.property.set","params": {"PowerSwitch": 1},"version": "1.0.0"}',
            function (err) {
              if (!err) {
                wx.hideLoading({
                  success(e) {
                    wx.showToast({
                      title: '开箱成功！',
                      duration: 1500,
                    })
                    that.recordDelivery()
                    that.setData({
                      state: 1
                    })
                    setTimeout(() => {
                      app.globalData.client.publish('/sys/a1JSfLzzsjQ/mini_console/thing/event/property/post',
                        '{"method": "thing.service.property.set","params": {"PowerSwitch": 0},"version": "1.0.0"}',
                        function (err) {
                          if (!err) {
                            wx.showToast({
                              title: '已关闭',
                              icon: 'none',
                              duration: 1500,
                            })
                            that.setData({
                              state: 0
                            })
                          }
                        })
                    }, 10000)
                  }
                })
              }
            })

        } else {
          wx.showToast({
            title: '扫描错误！',
            icon: 'none',
            duration: 1500,
          })
        }
      }
    })
  },

  recordDelivery() {
    const that =this
    try {
      var sessionValue = wx.getStorageSync('_3rd_session')
      wx.showLoading({
        title: '请稍后！',
      })
      wx.request({
        url: 'https://axton.top/delivery/record',
        method: 'POST',
        data: {
          _3rd_session: sessionValue,
          unusual: 0,
          comment: '无异常情况！'
        },
        success(res) {
          wx.hideLoading()
          if (res.data.errno !== 0) {
            console.log(res.data.message)
          } 
        },
        fail(e) {
          console.error(e)
        }
      })
    } catch(e) {
      console.error(e)
    }
  },

  onLoad: function () {
    const that = this
    wx.showLoading({
      title: '加载中',
    })
    setTimeout(function (e) {
      that.setData({
        connectState: app.globalData.connectState
      })
      wx.hideLoading()
    }, 1000)


    getApp().watch("connectState", (res1) => {
      this.setData({
        connectState: res1
      });
    }, this);

    getApp().watch("temp", (res2) => {this.setData({temp: res2})}, this);
    getApp().watch("humi", (res3) => {this.setData({humi: res3})}, this);

    this.getUserInfo()    // 此处是在已经登录时获取用户信息

  },

  getUserInfo() {
    const that = this
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              app.globalData.nickName = res.userInfo.nickName
              app.globalData.avatarUrl = res.userInfo.avatarUrl
              app.globalData.loginState = 1
            }
          })
        }
      }
    })
  },

  enterLook: function () {
    wx.navigateTo({
      url: './look/look',
    })
  },
})