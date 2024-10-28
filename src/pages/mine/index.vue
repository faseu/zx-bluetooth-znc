<template>
  <view class="content">
    <image class="mine-bg" src="../../static/mine/bg.png" alt="" />
    <view class="upgrade" @click="goToUpgrade">
      <image class="upgrade-icon" src="../../static/mine/upgrade-icon.png" alt="" />
      <text class="upgrade-title">OTA升级</text>
      <text class="upgrade-desc">{{ upgradable ? '有新的升级文件' : '' }}</text>
      <image class="upgrade-arrow" src="../../static/home/right-arrow.png" alt="" />
    </view>
    <!--    <view class="upgrade" @click="localUpgrade">-->
    <!--      <image class="upgrade-icon" src="../../static/mine/upgrade-icon.png" alt="" />-->
    <!--      <text class="upgrade-title">本地升级</text>-->
    <!--      <image class="upgrade-arrow" src="../../static/home/right-arrow.png" alt="" />-->
    <!--    </view>-->
  </view>
</template>

<script>
  import { arrayBufferToString, string2HexArray } from '../../utils/common';
  import { awaitWrapper, onBLECharacteristicValueChange, writeBLECharacteristicValue } from '../../utils/bluetooth';

  export default {
    name: 'minePage',
    data() {
      return {
        isSending: false,
        isSendNum: 1,
        timer: null,
        version: undefined,
        webVersion: undefined,
        fileUrl: ''
      };
    },
    computed: {
      upgradable() {
        return Number(this.webVersion) > Number(this.version);
      }
    },
    async onShow() {
      this.version = undefined;
      this.webVersion = undefined;
      const { deviceId } = uni.getStorageSync('MS');
      if (deviceId) {
        this.onBLECharacteristicValueChange();
        this.sendCommand('<CMD06:005:994>\r\n');
      }
    },
    methods: {
      async initcloud() {
        wx.cloud.init({
          env: 'cloud-9g58dj443a4cc4c6'
        });
      },
      goToUpgrade() {
        const { deviceId } = uni.getStorageSync('MS');
        if (!deviceId) {
          uni.$showMsg('请先连接蓝牙！');
          return;
        }
        if (!this.upgradable) {
          uni.$showMsg('最新版本无需升级！');
          return;
        }
        const params = JSON.stringify({ fileUrl: this.fileUrl, immediately: false });
        uni.navigateTo({ url: `/pages/upgrade/index?params=${encodeURIComponent(params)}` });
      },
      localUpgrade() {
        // 在本地用户文件目录下创建一个文件 hello.txt，写入内容 "hello, world"
        const fs = wx.getFileSystemManager();
        fs.writeFileSync(`${wx.env.USER_DATA_PATH}/hello.txt`, 'hello, world', 'utf8');
      },
      // 发送
      sendCommand(value) {
        if (this.isSending) return;
        this.isSending = true;
        const hexArray = string2HexArray(value);
        const { write } = uni.getStorageSync('MS');
        awaitWrapper(
          writeBLECharacteristicValue({
            ...write,
            value: hexArray,
            callback: () => {}
          })
        );
        this.timer = setInterval(() => {
          if (this.isSendNum >= 3) {
            clearInterval(this.timer);
            console.log('this.isSendNum >= 3');
            uni.$showMsg('请稍后重试！');
            this.isSendNum = 1;
            this.isSending = false;
            return;
          }
          awaitWrapper(
            writeBLECharacteristicValue({
              ...write,
              value: hexArray,
              callback: () => {}
            })
          );
          this.isSendNum = this.isSendNum + 1;
        }, 1000);
      },
      // 监听单片机返回的数据
      onBLECharacteristicValueChange() {
        awaitWrapper(
          onBLECharacteristicValueChange((res) => {
            let str = arrayBufferToString(res.value);
            console.log(`收到：${str}`);
            // VERSION:V001-001
            const flag = str.split(':')[0];
            if (flag === 'VERSION') {
              const firmware = str.split(':')[1].split('-')[0];
              const version = str.split(':')[1].split('-')[1];
              this.getCloudVersion(firmware);
              clearInterval(this.timer);
              this.isSendNum = 1;
              this.isSending = false;
              this.version = version;
            }
          })
        );
      },

      async getCloudVersion(firmware) {
        await this.initcloud();
        const db = wx.cloud.database();
        await db
          .collection('OTA')
          .where({
            firmware
          })
          .orderBy('file_version', 'desc')
          .limit(1)
          .get({
            success: (res) => {
              console.log(res.data[0]);
              this.webVersion = res.data[0].file_version;
              this.fileUrl = res.data[0].OTA_file;
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
