<template>
  <view class="bg">
    <view class="bar"/>
    <view class="header">
      <view class="header_title">LIVING ROOM</view>
    </view>
    <view class="tab">
      <view class="tab_item" @click="handleModeSelectPop()">
        <image v-show="!modeSwitch" src="../../static/room/tab_left_1.png" alt=""/>
        <image v-show="modeSwitch" src="../../static/room/tab_left_2.png" alt=""/>
        <text class="modeValue" v-show="modeValue">{{ modeValue }}</text>
      </view>
      <view class="tab_item tab_item-r" v-if="!isActivate" @click="handleActivate()">
        <image src="../../static/room/tab_right_1.png" alt=""/>
      </view>
      <view class="tab_item tab_item-top" v-else @click="handleActivate()">
        <image src="../../static/room/tab_right_1.png" alt=""/>
      </view>
    </view>
    <view class="content">
      <view class="content_item">
        <image src="../../static/room/content_1.png" alt=""/>
        <text class="content_value-top">{{ currentTime }}</text>
      </view>
      <view class="content_item">
        <image src="../../static/room/content_2.png" alt=""/>
        <text class="content_value-top">23℃</text>
      </view>
      <view class="content_item">
        <image src="../../static/room/content_3.png" alt=""/>
        <text class="content_value-top">8kg</text>
      </view>
    </view>
    <view class="controller_box">
      <image class="controller_img" src="../../static/room/controller.png" alt=""/>
      <view id="rod" class="controller" @touchstart="handleTouchStart" @touchmove="handleTouch"
            @touchend="handleTouchEnd">
        <view class="rod" :style="myStyle">
          <image class="logo" src="../../static/room/controller_btn.png"></image>
        </view>
      </view>
      <view class="controller_value">
        <text>{{ temperatureValue }}</text>
        <text class="controller_value_unit">℃</text>
      </view>
    </view>
    <view class="btn_list">
      <image class="btn_item" src="../../static/room/btn_1.png" alt=""/>
      <image class="btn_item" src="../../static/room/btn_2.png" alt=""/>
      <image class="btn_item" src="../../static/room/btn_3.png" alt=""/>
    </view>
    <view class="select_box" v-if="modeSelectPopShow">
      <view class="select_item select_item_start" @click="handleModeSwitch()">
        <text>Mode</text>
        <view :class="modeSwitch ? 'mode_switch-open' : 'mode_switch-close'">
          <view/>
        </view>
      </view>
      <view class="select_item" @click="handleModeSelect('manual')">
        <text>manual</text>
        <image v-show="modeValue === 'manual'" class="select_item-tick" src="../../static/room/tick.png" alt=""/>
      </view>
      <view class="select_item" @click="handleModeSelect('temp')">
        <text>temp</text>
        <image v-show="modeValue === 'temp'" class="select_item-tick" src="../../static/room/tick.png" alt=""/>
      </view>
      <view class="select_item" @click="handleModeSelect('weekly')">
        <text>weekly</text>
        <image v-show="modeValue === 'weekly'" class="select_item-tick" src="../../static/room/tick.png" alt=""/>
      </view>
      <view class="select_item" @click="handleModeSelect('other')">
        <text>other</text>
        <img v-show="modeValue === 'other'" class="select_item-tick" src="../../static/room/tick.png" alt=""/>
      </view>
      <view class="select_item select_item_last" @click="handleModeSelectPop()">confirm</view>
      <view class="safe_area"/>
    </view>
    <view class="mask" v-if="modeSelectPopShow || isActivate"/>
    <Bluetooth
        class="bluetooth"
        ref="bluetooth"
        @connectionStateChange="connectionStateChange"
        autoConnectDeviceName="HLK-V50"
    />
    <view
        class="reconnectBtn"
        @click="reconnectBluetooth"
        style="color: #323848"
    >
<!--      重新连接-->
    </view>
  </view>
</template>

<script>
import Bluetooth from "@/components/Bluetooth/bluetooth.vue";

export default {
  components: {Bluetooth},
  data() {
    return {
      currentTime: '',
      modeSelectPopShow: false,
      modeSwitch: false,
      modeValue: '',
      isActivate: false,
      temperatureValue: 18,
      connectStatus: false,
      knobX: 0,
      knobY: 0,
      myStyle: {
        transform: 'rotate(14deg)'
      }
    };
  },
  onReady() {
    uni
        .createSelectorQuery()
        .select('#rod')
        .boundingClientRect((rect) => {
          this.knobX = rect.left + rect.width / 2;
          this.knobY = rect.top + rect.height / 2;
        })
        .exec();

  },
  onLoad(query) {
    this.updateCurrentTime();
    setInterval(this.updateCurrentTime, 1000);
  },
  onShow(options) {
    // let connected = createBLEConnection();
    // console.log(connected)
  },
  methods: {
    goToBluetoothList() {
      uni.navigateTo({url: '/pages/bluetooth/bluetooth4'});
    },
    updateCurrentTime() {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      // const seconds = now.getSeconds().toString().padStart(2, '0');
      this.currentTime = `${hours}:${minutes}`;
    },
    handleModeSwitch() {
      this.modeSwitch = !this.modeSwitch;
    },
    handleModeSelectPop() {
      let modeMap = {
        manual: 1,
        temp: 2,
        weekly: 4,
        other: 8,
      }
      if (this.modeSelectPopShow && this.modeSwitch) {
        let hexString = modeMap[this.modeValue].toString(16);
        this.$refs.bluetooth.writeBLECharacteristicValue(`55aa02${hexString}`)
      }
      if (this.modeSelectPopShow && !this.modeSwitch) {
        this.$refs.bluetooth.writeBLECharacteristicValue(`55aa0200`)
      }
      this.modeSelectPopShow = !this.modeSelectPopShow;
    },
    handleModeSelect(value) {
      this.modeValue = value;
    },
    // 开关机
    handleActivate() {
      /**
       * 0x00:关闭电源
       * 0x01:打开电源
       */
      if (this.isActivate) {
        this.$refs.bluetooth.writeBLECharacteristicValue('55aa0100');
      } else {
        this.$refs.bluetooth.writeBLECharacteristicValue('55aa0101');

      }
      this.isActivate = !this.isActivate;

    },
    handleTouchStart(event) {
      this.startX = event.touches[0].clientX;
      this.temp = event.touches[0].clientX;
    },
    handleTouch(event) {
      // 18-30
      this.deltaX = event.touches[0].clientX - this.knobX;
      this.deltaY = event.touches[0].clientY - this.knobY;
      let angleRad = Math.atan2(this.deltaY, this.deltaX);
      let angleDeg = (angleRad * 180) / Math.PI;
      let rotationAngle = (angleDeg + 180) % 360;
      if (rotationAngle < 15 || rotationAngle > 165) {
        return;
      }
      let unit = (150 / 12).toFixed(2)
      let difference = Math.round((rotationAngle - 15) / 12)
      this.temperatureValue = difference + 18
      rotationAngle = difference * unit + 15
      this.myStyle.transform = `rotate(${rotationAngle}deg)`;
      console.log(rotationAngle);
    },
    handleTouchEnd() {
      let hexString = this.temperatureValue.toString(16);
      this.$refs.bluetooth.writeBLECharacteristicValue(`55aa04${hexString}`)
    },
    reconnectBluetooth() {
      this.$refs.bluetooth.autoConnectBluetooth();
    },
    connectionStateChange(connected) {
      console.log("connected", connected);
      this.connect_status = connected;
    },
  }
};
</script>

<style scoped lang="scss">
.bg {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(179.98deg, #bdc4c3 0.02%, #a9b3ab 85.89%);
}

.bar {
  height: var(--status-bar-height);
  width: 100%;
  /* background: #000; */
}
.bluetooth {
  position: absolute;
  z-index: 999;
}
.header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 48rpx 0;
  box-sizing: border-box;

  .header_title {
    font-style: normal;
    font-weight: 400;
    font-size: 48rpx;
    line-height: 56rpx;
    color: #000000;
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
}

.tab {
  position: relative;
  margin-top: 24rpx;
  width: 100%;
  display: flex;

  .tab_item {
    position: relative;
    box-sizing: border-box;
    width: 50%;
    height: 84rpx;
    border-width: 2px 0;
    border-style: solid;
    border-color: #666666;
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
    border-radius: 0 0 10px 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    image {
      width: 56rpx;
      height: 56rpx;
    }

    .modeValue {
      margin-left: 16rpx;
    }
  }

  .tab_item-r {
    border-width: 2px 0px 2px 2px;
  }

  .tab_item-top {
    position: relative;
    border-width: 2px 0px 2px 2px;
    z-index: 99;
    background: #d9d9d9;
  }
}

.content {
  width: 100vw;
  height: 416rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 38rpx;
  margin-top: 120rpx;
  box-sizing: border-box;

  .content_item {
    position: relative;
    width: 212rpx;
    height: 416rpx;
    display: flex;
    flex-direction: column;
    align-items: center;

    image {
      position: absolute;
      width: 100%;
      height: 100%;
    }

    .content_value-top {
      margin-top: 36rpx;
      height: 52rpx;
      font-size: 44rpx;
      line-height: 52rpx;
      color: #323232;
    }
  }
}

.controller_box {
  position: relative;
  width: 100vw;
  height: auto;
  margin-top: 140rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .controller_img {
    position: absolute;
    top: 0;
    display: block;
    width: 646rpx;
    height: 600rpx;
  }

  .controller {
    position: absolute;
    top: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 600rpx;
    height: 600rpx;
    border-radius: 50%;

    .rod {
      position: absolute;

      left: 0;
      top: calc(50% - 20rpx);
      width: 300rpx;
      height: 40rpx;
      display: flex;
      align-items: center;
      transform-origin: 300rpx 20rpx;
      transform: rotate(45deg);

      .logo {
        position: relative;
        right: 10rpx;
        height: 120rpx;
        width: 120rpx;
      }
    }
  }

  .controller_value {
    margin-top: 220rpx;
    font-size: 90rpx;
    line-height: 108rpx;
    color: #0f0e0e;
    display: flex;
    align-items: start;

    .controller_value_unit {
      font-size: 50rpx;
      line-height: 80rpx;
    }
  }
}

.btn_list {
  position: absolute;
  bottom: 80rpx;
  width: 100vw;
  height: 156rpx;
  padding: 0 40rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .btn_item {
    width: 156rpx;
    height: 156rpx;
  }
}

.select_box {
  opacity: 1;
  width: 100%;
  position: absolute;
  z-index: 99;
  bottom: 0;
  background: #f8f8f8;
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;

  .select_item {
    background: #fff;
    position: relative;
    height: 112rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #333333;

    .select_item-tick {
      position: absolute;
      right: 48rpx;
      width: 30rpx;
      height: 22rpx;
    }

    .mode_switch-open {
      position: absolute;
      right: 40rpx;
      width: 96rpx;
      height: 56rpx;
      background: #113149;
      border-radius: 28rpx;
      padding: 4rpx;
      box-sizing: border-box;
      display: flex;
      justify-content: end;

      view {
        width: 48rpx;
        height: 48rpx;
        background: #fff;
        border-radius: 50%;
      }
    }

    .mode_switch-close {
      position: absolute;
      right: 40rpx;
      width: 96rpx;
      height: 56rpx;
      background: #d9d9d9;
      border-radius: 28rpx;
      padding: 4rpx;
      box-sizing: border-box;
      display: flex;
      justify-content: start;

      view {
        width: 48rpx;
        height: 48rpx;
        background: #fff;
        border-radius: 50%;
      }
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      width: 686rpx;
      height: 2rpx;
      background: rgba(0, 0, 0, 0.1);
    }
  }

  .select_item_start {
    font-size: 36rpx;
    color: rgba(0, 0, 0, 0.5);
  }

  .select_item_last {
    margin-top: 18rpx;
    font-size: 36rpx;
    color: #113149;

    &::after {
      content: none;
    }
  }

  .safe_area {
    background: #fff;
    height: 34rpx;
  }
}

.mask {
  position: absolute;
  z-index: 88;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.2);
}
.bluetooth {
  position: absolute;
  top: var(--status-bar-height);
  right: 48rpx;
  padding-top: 20rpx;
}

</style>
