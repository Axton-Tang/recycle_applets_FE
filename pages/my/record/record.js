// pages/my/record/record.js
Page({

   /**
    * 页面的初始数据
    */
   data: {
      deliveryList: [],
      pageIndex: 0,
      showLoadMore: 1
   },

   showRecord() {
      const that = this
      try {
         var sessionValue = wx.getStorageSync('_3rd_session')
         wx.showLoading({
            title: '加载中',
          })
          wx.request({
            url: `https://axton.top/delivery/query/${this.data.pageIndex}`,
            data: {
               _3rd_session: sessionValue
            },
            method: 'GET',
            success(res) {
               wx.hideLoading()
               let list = that.data.deliveryList
               list.push(...res.data.data.deliveryList)
               
               list.forEach(item => {
                  const time = new Date(item.createdAt);
                  const matchTime=time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate() + ' ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
                  item.createdAt = matchTime
               })

               that.setData({
                  deliveryList: list
               })
               const itemCount = res.data.data.count
               if ((itemCount - (that.data.pageIndex+1)*5) <=0) {
                  that.setData({
                     showLoadMore: 0
                  })
               }
               that.data.pageIndex ++
            }
          })
      } catch(e) {
         console.error(e)
      }
   },

   handleLoadMore() {
      this.showRecord()
   },

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {
      this.showRecord()

   }

})