<template>
  <view class="village_mode">
    <view class="mb16 flex-between listWrap" v-for="device in bluetoothDevices" :key="device.deviceId" @click="deviceSelected(device)">
      <view class="text-left" :style="connectedDeviceId === device.deviceId ? 'color: #FDA010' : ''">
        <view class="cFThick s32"> {{ device.name }}{{ connectedDeviceId === device.deviceId ? '（已连接）' : '' }} </view>
        <view class="s28 cFNormal mb16">信号强度：{{ device.RSSI }}</view>
      </view>
      <view v-if="currentDeviceId === device.deviceId" class="flexCenterWrap">
        <image src="../../static/room/tick2.png" alt="" />
      </view>
    </view>
  </view>
</template>

<script>
  import { initBluetooth, connectBluetooth, autoConnectBluetooth } from '@/components/Bluetooth/bluetooth.js';

  import { closeBluetoothAdapter, closeBLEConnection, awaitWrapper, startBluetoothDevicesDiscovery, writeBLECharacteristicValue } from '@/utils/bluetooth.js';

  export default {
    name: 'bluetoothList',
    props: {
      autoConnectDeviceName: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        bluetoothDevices: [1, 2, 3],
        isbluetoothConnected: false,
        currentDeviceId: '',
        connectedDeviceId: '',
        isInit: false,
        iosDone: false,
        property: 'notify',
        writeDevice: {},
        timer: 0
      };
    },
    mounted() {
      if (this.autoConnectDeviceName === 'HLK-V50') {
        this.property = 'write';
      }
      if (this.autoConnectDeviceName) {
        this.autoConnectBluetooth();
      }
      this.initBluetooth();
    },
    beforeUnmount() {
      closeBluetoothAdapter();
    },
    methods: {
      async modalShow() {
        if (this.connectedDeviceId) {
          this.currentDeviceId = this.connectedDeviceId;
        }
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
      deviceSelected(device) {
        this.currentDeviceId = device.deviceId;
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
      connectBluetooth() {
        connectBluetooth({
          devicesName: this.autoConnectDeviceName,
          deviceId: this.currentDeviceId,
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
      initBluetooth() {
        initBluetooth({
          devicesNameArr: [this.autoConnectDeviceName],
          deviceFoundCb: (device, bluetoothDevices) => {
            console.log('bluetoothDevices', bluetoothDevices);
            this.bluetoothDevices = bluetoothDevices;
            console.log('connectBluetooth', connectBluetooth);
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
