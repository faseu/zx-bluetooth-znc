<template>
  <view class="content">
    <image class="mine-bg" src="../../static/mine/bg.png" alt="" />
    <view class="upgrade" @click="goToUpgrade">
      <image class="upgrade-icon" src="../../static/mine/upgrade-icon.png" alt="" />
      <text class="upgrade-title">OTA升级</text>
      <text class="upgrade-desc">{{ upgradable ? '有新的升级文件' : '' }}</text>
      <image class="upgrade-arrow" src="../../static/home/right-arrow.png" alt="" />
    </view>
  </view>
</template>

<script>
  import { arrayBufferToHex, arrayBufferToString, string2HexArray } from '../../utils/common';
  import { writeBLECharacteristicValue } from '../../utils/bluetooth';

  export default {
    name: 'minePage',
    data() {
      return {
        isSending: false,
        isSendNum: 1,
        timer: null,
        version: undefined,
        webVersion: undefined
      };
    },
    computed: {
      upgradable() {
        return Number(this.webVersion) > Number(this.version);
      }
    },
    async onLoad() {
      this.onBLECharacteristicValueChange();
      this.sendCommand('<CMD06:005:994>\r\n');
      await this.initcloud();
      const db = wx.cloud.database();
      db.collection('OTA')
        .orderBy('file_version', 'desc')
        .limit(1)
        .get({
          success: (res) => {
            console.log(res.data[0]);
            this.webVersion = res.data[0].file_version;
            // 下载文件
            uni.downloadFile({
              url: res.data[0].OTA_file, // 网络文件URL
              success: (res) => {
                if (res.statusCode === 200) {
                  console.log('文件下载成功', res.tempFilePath);
                  // 读取下载的文件
                  // this.readFileAsArrayBuffer(res.tempFilePath);
                }
              },
              fail: (err) => {
                console.error('文件下载失败', err);
              }
            });
          }
        });
    },
    methods: {
      async initcloud() {
        wx.cloud.init({
          env: 'cloud-9g58dj443a4cc4c6'
        });
      },
      goToUpgrade() {
        // if (!this.upgradable) return;
        uni.navigateTo({ url: '/pages/upgrade/index' });
      },
      // 发送
      sendCommand(value) {
        if (this.isSending) return;
        this.isSending = true;
        const hexArray = string2HexArray(value);
        const { write } = uni.getStorageSync('MS');
        writeBLECharacteristicValue({
          ...write,
          value: hexArray,
          callback: () => {}
        });
        this.timer = setInterval(() => {
          if (this.isSendNum >= 3) {
            clearInterval(this.timer);
            console.log('this.isSendNum >= 3');
            uni.$showMsg('请稍后重试！');
            this.isSendNum = 1;
            this.isSending = false;
            return;
          }
          writeBLECharacteristicValue({
            ...write,
            value: hexArray,
            callback: () => {}
          });
          this.isSendNum = this.isSendNum + 1;
        }, 1000);
      },
      // 监听单片机返回的数据
      onBLECharacteristicValueChange() {
        uni.onBLECharacteristicValueChange((res) => {
          let str = arrayBufferToString(res.value);
          let version = str.slice(-3);
          if (str.substring(0, 7) === 'VERSION') {
            //VERSION:V001-001
            clearInterval(this.timer);
            this.isSendNum = 1;
            this.isSending = false;
            this.version = version;
          }
        });
      }
    }
  };
</script>

<style scoped lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100vw;
    min-height: 100vh;
    box-sizing: border-box;
    background: linear-gradient(90deg, #0e1e34, #0d1522);
    color: #fff;
    font-size: 30rpx;

    .mine-bg {
      width: 100%;
      height: 262rpx;
    }

    .upgrade {
      width: 702rpx;
      height: 140rpx;
      background: #162844;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      padding: 0 40rpx;
      margin-top: 18rpx;
      box-sizing: border-box;

      .upgrade-icon {
        width: 54rpx;
        height: 54rpx;
        margin-right: 20rpx;
      }
      .upgrade-title {
        flex: 1;
      }
      .upgrade-desc {
        color: #b2b2b2;
      }
      .upgrade-arrow {
        width: 12rpx;
        height: 24rpx;
        margin-left: 16rpx;
      }
    }
  }
</style>
