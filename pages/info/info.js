// pages/info/info.js

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: app.globalData.canIUse,
    avatarUrl: app.globalData.avatarUrl,
    nickName: app.globalData.nickName,
    loginState: app.globalData.loginState,
    city: '',
    gender: 0
  },

  bindGetUserInfo(e) {
    const that = this
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              app.globalData.nickName = res.userInfo.nickName
              app.globalData.avatarUrl = res.userInfo.avatarUrl
              that.setData({
                city: res.userInfo.city,
                gender: res.userInfo.gender
              })
              that.handleLogin()
            }
          })
        }
      }
    })
  },

  handleLogin() {
    const that = this
    wx.showLoading({
      title: '登录中！',
    }),
    wx.login({
      success(res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: 'https://axton.top/users/login',
            method: 'POST',
            data: {
              code: res.code,
              nickName: app.globalData.nickName,
              city: that.data.city,
              gender: that.data.gender
            },
            success(res) {
              try {
                wx.setStorageSync('_3rd_session', res.data.data)
                app.globalData.loginState = 1
                wx.switchTab({
                  url: '../index/index',
                })
              } catch (e) {
                console.error(e)
              }
              wx.hideLoading()
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideHomeButton({
      success: (res) => {},
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