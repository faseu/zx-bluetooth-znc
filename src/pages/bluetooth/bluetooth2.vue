<template>
  <view class="main">
    <view
        class="mb16 flex-between listWrap"
        v-for="device in bluetoothDevices"
        :key="device.deviceId"
        @click="deviceSelected(device)"
    >
      <view class="text-left">
        <view class="s32 cFThick mb20"
        >{{ device.name
          }}{{
            connectedDeviceId === device.deviceId ? "（已连接）" : ""
          }}</view
        >
        <view class="s28 cFNormal mb16">信号强度：{{ device.RSSI }}</view>
        <view class="s28 cFNormal">设备ID：{{ device.deviceId }}</view>
      </view>
      <view v-if="currentDeviceId === device.deviceId" class="flexCenterWrap">
        <Icon name="iconwancheng" size="60rpx" color="#4CC72A" />
      </view>
    </view>
  </view>
</template>

<script>
import {autoConnectBluetooth, connectBluetooth, initBluetooth} from "@/components/Bluetooth/bluetooth";
import {awaitWrapper, closeBLEConnection, openBluetoothAdapter} from "@/utils/bluetooth";

export default {
  data() {
    return {
      bluetoothDevices: [],
      isbluetoothConnected: false,
      currentDeviceId: "",
      connectedDeviceId: "",
      isInit: false,
      iosDone: false,
      property: "notify",
      writeDevice: {},
      timer: 0,
      autoConnectDeviceName: 'HLK-V50'
    };
  },
  onPullDownRefresh() {
    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 1000);
    this.initBle();
  },
  beforeDestroy() {
    // uni.closeBluetoothAdapter({
    // 	success(res) {
    // 		console.log(res)
    // 	}
    // })
    // this.stopBluetoothDevicesSearch();
    // 清理连接等操作
  },
  mounted() {
    this.initBluetooth();
    if (this.autoConnectDeviceName) {
      this.autoConnectBluetooth();
      // ios 第一次进入 监听蓝牙事件调用极慢，重新初始化后即可
      // if (uni.getSystemInfoSync().platform == 'ios' && !this.iosDone) {
      //   console.log('[err, res]', [err, res])
      // 	setTimeout(() => {
      // 		this.autoConnectBluetooth()
      // 	}, 2000)
      // }
    }
  },
  onShow() {
    this.connectedDevices = uni.getStorageSync('connectedDevices') || {};
  },
  methods: {
    initBluetooth() {
      initBluetooth({
        devicesNameArr: [this.autoConnectDeviceName],
        deviceFoundCb: (device, bluetoothDevices) => {
          console.log("device", device);
          console.log("bluetoothDevices", bluetoothDevices);
          this.bluetoothDevices = bluetoothDevices;
          console.log("connectBluetooth", connectBluetooth);
        },
        connectionStateChangeCb: ({deviceId, connected}) => {
          if (connected) {
            this.connectedDeviceId = deviceId;
            console.log("");
          } else {
            this.connectedDeviceId = "";
          }
          this.$emit("connectionStateChange", connected);

          this.isbluetoothConnected = connected;

          console.log("{ deviceId, connected }", deviceId, connected);
        },
      });
    },
    deviceSelected(device) {
      this.currentDeviceId = device.deviceId;
      console.log("this.currentDeviceId", this.currentDeviceId);

      if (!this.currentDeviceId) {
        // return this.$errTips("请选择要连接的设备");
      }
      if (!this.connectedDeviceId) {
        this.connectBluetooth();
      } else if (this.connectedDeviceId !== this.currentDeviceId) {
        closeBLEConnection(this.connectedDeviceId).then(() => {
          this.connectBluetooth();
        });
      }
    },
    connectBluetooth() {
      connectBluetooth({
        devicesName: this.autoConnectDeviceName,
        deviceId: this.currentDeviceId,
        valueChangeCb: (res) => {
          console.log("res.value", res.value);
          this.$emit("blueChange", res.value);
        },
        property: this.property,
        getDevicesArr: (devices) => {
          const deviceId = devices[0].deviceId,
              serviceId = devices[0].serviceId,
              characteristicId = devices[0].characteristicId;
          this.writeDevice = {
            deviceId,
            serviceId,
            characteristicId,
          };
        },
      });
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
            this.connectedDeviceId = "";
          }
          this.$emit("connectionStateChange", connected);

          this.isbluetoothConnected = connected;

          console.log("{ deviceId, connected }", deviceId, connected);
        },
        valueChangeCb: (res) => {
          console.log("res.value", res.value);
          this.$emit("blueChange", res.value);
        },
        property: this.property,
        getDevicesArr: (devices) => {
          const deviceId = devices[0].deviceId,
              serviceId = devices[0].serviceId,
              characteristicId = devices[0].characteristicId;
          this.writeDevice = {
            deviceId,
            serviceId,
            characteristicId,
          };
        },
      });
    },
  }
};
</script>

