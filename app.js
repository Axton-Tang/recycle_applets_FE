//app.js
var mqtt = require('./utils/mqtt.min.js')
const crypto = require('./utils/hex_hmac_sha1.js');

App({
  globalData: {
    client: null,
    connectState: 0,
    temp: '0',
    humi: '0',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    avatarUrl: '/images/my/deafult_avatar.png',
    nickName: '暂无数据',
    loginState: 0
  },

  watch: function (dataName, callback, that) {
    var obj = this.globalData;
    Object.defineProperty(obj, dataName, {

      configurable: true,
      enumerable: true,
      set: function (value) {

      this['temp' +dataName] = value;
      callback.call(that, value);
      },
      get: function () {
      return this['temp' + dataName];
      }
    })
  },

  onLaunch() {
    const that = this
    wx.checkSession({
      success() {
        try {
          var value = wx.getStorageSync('_3rd_session')
          if (!value) {
            wx.redirectTo({
              url: '/pages/info/info',
            })
            that.globalData.loginState = 0
          } else {
            wx.showLoading({
              title: '请稍后！',
            })
            wx.request({
              url: 'https://axton.top/users/isLogin',
              method: 'POST',
              data: {
                _3rd_session:value
              },
              success(res) {
                wx.hideLoading()
                if (res.data.errno === 10001) {
                  wx.redirectTo({
                    url: '/pages/info/info',
                  })
                } else {
                  that.globalData.loginState = 1
                  wx.reLaunch({
                    url: '/pages/index/index',
                  })
                }
              }
            })
            
          }
        } catch (e) {
          console.error(e)
        }
      },
      fail() {
        // session_key 已经失效，需要重新执行登录流程
        wx.redirectTo({
          url: '/pages/info/info',
        })
        that.globalData.loginState = 0
      }
    })

    this.doConnect()
  },

  doConnect() {
    const that = this
    const deviceConfig = {
      productKey: "a1JSfLzzsjQ",
      deviceName: "mini_console",
      deviceSecret: "8e22db3cab4c2320b78f8d5ac36de2e4",
      regionId: "cn-shanghai"
    };
    const options = this.initMqttOptions(deviceConfig);
    //替换productKey为你自己的产品的（注意这里是wxs，不是wss，否则你可能会碰到ws不是构造函数的错误）
    const client = mqtt.connect('wxs://a1JSfLzzsjQ.iot-as-mqtt.cn-shanghai.aliyuncs.com', options)
    client.on('connect', function () {
      console.log('连接服务器成功')

      that.globalData.client = client
      that.globalData.connectState = 1

      //订阅主题，替换productKey和deviceName(这里的主题可能会不一样，具体请查看后台设备Topic列表或使用自定义主题)
      client.subscribe('/a1JSfLzzsjQ/mini_console/user/get', function (err) {
        if (!err) {
          console.log('订阅成功！');
        }
      })
    })
    //接收消息监听
    client.on('message', function (topic, message) {

      const result = JSON.parse(message.toString())

      console.log(result)
      try {

        that.globalData.humi = result.items.humi.value
        that.globalData.temp = result.items.temp.value

      } catch (e) {
        return
      }
    })
  },

  //IoT平台mqtt连接参数初始化
  initMqttOptions(deviceConfig) {

    const params = {
      productKey: deviceConfig.productKey,
      deviceName: deviceConfig.deviceName,
      timestamp: Date.now(),
      clientId: Math.random().toString(36).substr(2),
    }
    //CONNECT参数
    const options = {
      keepalive: 60, //60s
      clean: true, //cleanSession不保持持久会话
      protocolVersion: 4 //MQTT v3.1.1
    }
    //1.生成clientId，username，password
    options.password = this.signHmacSha1(params, deviceConfig.deviceSecret);
    options.clientId = `${params.clientId}|securemode=2,signmethod=hmacsha1,timestamp=${params.timestamp}|`;
    options.username = `${params.deviceName}&${params.productKey}`;

    return options;
  },

  /*
    生成基于HmacSha1的password
    参考文档：https://help.aliyun.com/document_detail/73742.html?#h2-url-1
  */
  signHmacSha1(params, deviceSecret) {

    let keys = Object.keys(params).sort();
    // 按字典序排序
    keys = keys.sort();
    const list = [];
    keys.map((key) => {
      list.push(`${key}${params[key]}`);
    });
    const contentStr = list.join('');
    return crypto.hex_hmac_sha1(deviceSecret, contentStr);
  }
})