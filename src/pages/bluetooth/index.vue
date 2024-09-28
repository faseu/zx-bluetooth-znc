<template>
  <view class="content">
    <view class="state">
      <view class="bluetooth-left">蓝牙</view>
      <view class="bluetooth-right">
        <text class="bluetooth-text">开</text>
        <image class="bluetooth-arrow" src="../../static/home/right-arrow.png" alt="" />
      </view>
    </view>
    <template v-if="connectedDeviceId">
      <view class="title">我的设备</view>
      <view class="my">
        <view class="my-left">{{ connectedDeviceName }}</view>
        <view class="my-right">已连接</view>
      </view>
    </template>
    <view class="title">可用设备...</view>
    <view class="usable">
      <view class="usable-item" v-for="device in bluetoothDevices" :key="device.deviceId" @click="connectBluetooth(device)">
        <view class="usable-left">{{ device.name }}</view>
        <view class="usable-right">{{ device.deviceId === connectedDeviceId ? '已连接' : '未连接' }}</view>
      </view>
    </view>
  </view>
</template>

<script>
  import { initBluetooth, connectBluetooth, autoConnectBluetooth } from '@/components/Bluetooth/bluetooth.js';

  import { closeBluetoothAdapter, closeBLEConnection, awaitWrapper, startBluetoothDevicesDiscovery, writeBLECharacteristicValue } from '@/utils/bluetooth.js';
  import { arrayBufferToString } from '../../utils/common';

  export default {
    name: 'bluetoothList',
    props: {
      // autoConnectDeviceName: {
      //   type: String,
      //   default: 'MS'
      // }
    },
    data() {
      return {
        bluetoothDevices: [],
        isbluetoothConnected: false,
        connectedDeviceId: '',
        connectedDeviceName: '',
        isInit: false,
        iosDone: false,
        property: 'write',
        writeDevice: {},
        timer: 0
      };
    },
    mounted() {
      // if (this.autoConnectDeviceName === 'HLK-V50') {
      //   this.property = 'write';
      // }
      // if (this.autoConnectDeviceName) {
      //   this.autoConnectBluetooth();
      // }

      // this.initBluetooth();
      uni.showLoading({
        title: '加载中...',
        mask: true
      });
      if (uni.getSystemInfoSync().platform == 'ios' && !this.iosDone) {
        setTimeout(() => {
          this.initBluetooth();
          uni.hideLoading();
        }, 2000);
      } else {
        this.initBluetooth();
        uni.hideLoading();
      }
    },
    beforeUnmount() {
      // closeBluetoothAdapter();
    },
    methods: {
      async modalShow() {
        // if (this.connectedDeviceId) {
        //   this.currentDeviceId = this.connectedDeviceId;
        // }
        if (!this.isInit) {
          // 是否重新初始化蓝牙，注释掉就是每次都重新初始化
          this.isInit = true;
          if (this.isbluetoothConnected) {
            closeBLEConnection(this.connectedDeviceId)
              .then(() => {
                closeBluetoothAdapter();
                console.log('断开了1');
                this.initBluetooth();
              })
              .catch(() => {
                console.log('断开了2');
                closeBluetoothAdapter();
              });
          } else {
            this.initBluetooth();
          }
        } else {
          const [err1, res1] = await awaitWrapper(startBluetoothDevicesDiscovery());
          console.log('pageRes', res1);
        }
      },
      autoConnectBluetooth() {
        let timer = new Date().getTime();
        if (this.timer + 10000 > timer) {
          // return this.$errTips("请勿频繁重连");
        } else {
          this.timer = timer;
        }
        autoConnectBluetooth({
          // devicesNameArr: ['OSTRAN'],
          devicesNameArr: [this.autoConnectDeviceName],
          connectionStateChangeCb: ({ deviceId, connected }) => {
            if (connected) {
              this.connectedDeviceId = deviceId;
            } else {
              this.connectedDeviceId = '';
            }
            this.$emit('connectionStateChange', connected);

            this.isbluetoothConnected = connected;

            console.log('{ deviceId, connected }', deviceId, connected);
          },
          valueChangeCb: (res) => {
            console.log('res.value', res.value);
            this.$emit('blueChange', res.value);
          },
          property: this.property,
          getDevicesArr: (devices) => {
            const deviceId = devices[0].deviceId,
              serviceId = devices[0].serviceId,
              characteristicId = devices[0].characteristicId;
            this.writeDevice = {
              deviceId,
              serviceId,
              characteristicId
            };
          }
        });
      },
      connectBluetooth({ deviceId }) {
        const pages = getCurrentPages();
        const targetPage = pages.find((item) => item.$page.fullPath === '/pages/index/index');
        targetPage.$vm.connectBluetooth({ deviceId });
        this.connectedDeviceId = deviceId;
        this.connectedDeviceName = this.bluetoothDevices.find((item) => item.deviceId === this.connectedDeviceId).name;
      },
      initBluetooth() {
        initBluetooth({
          devicesNameArr: [this.autoConnectDeviceName],
          deviceFoundCb: (device, bluetoothDevices) => {
            this.bluetoothDevices = bluetoothDevices;
          },
          connectionStateChangeCb: ({ deviceId, connected }) => {
            if (connected) {
              this.connectedDeviceId = deviceId;
              console.log('');
            } else {
              this.connectedDeviceId = '';
            }
            this.$emit('connectionStateChange', connected);

            this.isbluetoothConnected = connected;

            console.log('{ deviceId, connected }', deviceId, connected);
          }
        });
      },
      writeBLECharacteristicValue(value) {
        const { deviceId, serviceId, characteristicId } = this.writeDevice;
        return writeBLECharacteristicValue({
          deviceId,
          serviceId,
          characteristicId,
          value
        })
          .then((res) => res)
          .catch((err) => Promise.reject(err));
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
    padding: 18rpx;
    box-sizing: border-box;
    background: linear-gradient(90deg, #0e1e34, #0d1522);
    color: #fff;
    font-size: 30rpx;

    .state {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100rpx;
      background: #162844;
      border-radius: 20rpx;
      box-sizing: border-box;
      padding: 28rpx;
      .bluetooth-left {
      }
      .bluetooth-right {
        display: flex;
        align-items: center;
        .bluetooth-arrow {
          width: 12rpx;
          height: 24rpx;
          margin-left: 24rpx;
        }
      }
    }

    .title {
      width: 100%;
      margin-top: 45rpx;
      font-size: 24rpx;
    }
    .my {
      margin-top: 24rpx;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100rpx;
      background: #162844;
      border-radius: 20rpx;
      box-sizing: border-box;
      padding: 28rpx;
    }
    .usable {
      margin-top: 24rpx;
      width: 100%;
      display: flex;
      flex-direction: column;
      background: #162844;
      border-radius: 20rpx;
      .usable-item {
        width: 100%;
        height: 106rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 28rpx;
        box-sizing: border-box;
      }
    }
  }
  .flex-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .flexCenterWrap {
    display: flex;
    align-items: center;
    width: 46rpx;
    height: 32rpx;
    > image {
      width: 100%;
      height: 100%;
    }
  }

  .ml16 {
    margin-left: 16rpx;
  }

  .mb20 {
    margin-bottom: 20rpx;
  }

  .listWrap {
    padding: 24rpx 0;
    border-bottom: 2rpx solid #e0e0e0;

    &:last-child {
      padding-bottom: 0;
      border-bottom: none;
    }
  }

  .header_icon {
    width: 70rpx;
    height: 62rpx;
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
    background: #5e5e5e;
    flex: none;
    order: 2;
    flex-grow: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10rpx;

    image {
      display: block;
      width: 32rpx;
      height: 44rpx;
    }
  }
</style>
