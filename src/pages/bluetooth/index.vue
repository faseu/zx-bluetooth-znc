<template>
  <view class="content">
    <view class="state">
      <view class="bluetooth-left">蓝牙</view>
      <view class="bluetooth-right">
        <text class="bluetooth-text">开</text>
        <image class="bluetooth-arrow" src="../../static/home/right-arrow.png" alt="" />
      </view>
    </view>
    <template v-if="deviceId">
      <view class="title">我的设备</view>
      <view class="my">
        <view class="my-left">{{ deviceName }}</view>
        <view class="my-right">已连接</view>
      </view>
    </template>
    <view class="title">可用设备...</view>
    <view class="usable">
      <view class="usable-item" v-for="device in bluetoothDevices" :key="device.deviceId" @click="connectBluetooth(device)">
        <view class="usable-left">{{ device.name }}</view>
        <view class="usable-right">{{ device.deviceId === deviceId ? '已连接' : '未连接' }}</view>
      </view>
    </view>
  </view>
</template>

<script>
  import { initBluetooth, connectBluetooth, autoConnectBluetooth } from '@/components/Bluetooth/bluetooth.js';

  import { closeBluetoothAdapter, closeBLEConnection, awaitWrapper, startBluetoothDevicesDiscovery, writeBLECharacteristicValue } from '@/utils/bluetooth.js';
  import { arrayBufferToString } from '../../utils/common';
  import { onBLEConnectionStateChange, stopBluetoothDevicesDiscovery } from '../../utils/bluetooth';

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
        deviceId: undefined, //
        deviceName: undefined, //
        bluetoothDevices: [], // 列表
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
    onShow() {
      onBLEConnectionStateChange(({ deviceId, connected }) => {
        console.log(deviceId, connected);
        if (connected) {
          this.deviceId = deviceId;
          const { deviceName } = uni.getStorageSync('MS') || {};
          this.deviceName = deviceName;
        } else {
          this.deviceId = undefined;
          uni.removeStorageSync('MS');
        }
      });
    },
    mounted() {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
      setTimeout(() => {
        this.initBluetooth();
        wx.hideLoading();
      }, 1000);
    },
    beforeUnmount() {
      // closeBluetoothAdapter();
    },
    methods: {
      connectBluetooth({ deviceId, name }) {
        console.log(deviceId, name);
        connectBluetooth({
          deviceId,
          deviceName: name
        });
      },
      initBluetooth() {
        initBluetooth({
          deviceFoundCb: (bluetoothDevices) => {
            this.bluetoothDevices = bluetoothDevices;
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
