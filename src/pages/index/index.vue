<template>
  <view :class="{ content: true, popShow: popShow }">
    <view class="bluetooth" @click="goBluetoothList()">
      <image v-if="deviceId" class="bluetooth-icon" src="../../static/home/bluetooth-blue.png" alt="" />
      <image v-else class="bluetooth-icon" src="../../static/home/bluetooth-orange.png" alt="" />
      <text> {{ deviceId ? '蓝牙已连接' : '蓝牙未连接' }} </text>
      <image class="bluetooth-arrow" src="../../static/home/right-arrow.png" alt="" />
    </view>
    <view class="bed">
      <view class="bed-header" :style="bedHeaderStyle" />
      <view class="bed-center" />
      <view class="bed-leg" :style="bedLegStyle" />
      <view class="bed-footer" :style="bedFooterStyle" />
      <image class="bed-img" src="../../static/home/bed.png" alt="" />
      <view class="bed-header-value">
        <text>{{ bedHeader }}</text>
        <text>°</text>
      </view>
      <view class="bed-leg-value">
        <text>{{ bedLeg }}</text>
        <text>°</text>
      </view>
    </view>
    <view class="angle base-bg">
      <view class="title">床头升降</view>
      <view class="scope">
        <view>0°</view>
        <view>60°</view>
      </view>
      <view class="slider">
        <slider :value="bedHeader" @change="(e) => sliderChangeHeader(e.detail.value)" activeColor="#0C9BCC" backgroundColor="#324A61" min="0" max="60" block-color="#0C9BCC" block-size="18" />
      </view>
      <view class="title mt42">床尾升降</view>
      <view class="scope">
        <view>0°</view>
        <view>30°</view>
      </view>
      <view class="slider">
        <slider :value="bedLeg" @change="(e) => sliderChangeLeg(e.detail.value)" activeColor="#0C9BCC" backgroundColor="#324A61" min="0" max="30" block-color="#0C9BCC" block-size="18" />
      </view>
    </view>
    <view class="set-memory base-bg" @click="sendCommand('<CMD00:002:997>\r\n')">记忆角度设定</view>
    <view class="memory-row2">
      <view class="reset base-bg" @click="sendCommand('<CMD00:001:998>\r\n')">一键放平</view>
      <view class="get-memory base-bg" @click="sendCommand('<CMD00:003:996>\r\n')">恢复记忆角度</view>
    </view>
    <view class="mode base-bg">
      <view>选择模式</view>
      <view class="mode-btn">
        <view class="mode-btn-item" :style="modeSleep ? 'background: #0B4F73' : ''" @click="changeModeSleep()">睡眠模式</view>
        <view class="mode-btn-item" :style="modeYoga ? 'background: #0B4F73' : ''" @click="changeModeYoga()">瑜伽模式</view>
      </view>
      <view class="mode-other-btn">
        <view class="mode-btn-item" :style="mode === 1 ? 'background: #0B4F73' : ''" @click="changeModeOther(1)">零重力</view>
        <view class="mode-btn-item" :style="mode === 2 ? 'background: #0B4F73' : ''" @click="changeModeOther(2)">观影</view>
        <view class="mode-btn-item" :style="mode === 3 ? 'background: #0B4F73' : ''" @click="changeModeOther(3)">阅读</view>
        <view class="mode-btn-item" :style="mode === 4 ? 'background: #0B4F73' : ''" @click="changeModeOther(4)">游戏</view>
      </view>
    </view>
    <view class="shake base-bg" v-if="showHeaderShake">
      <view class="title">
        <image class="shake-icon" src="../../static/home/header-shake.png" alt="" />
        <text class="shake-title">头震动</text>
        <mySwitch :isOpen="headerShakeOpen" @toggle="handleHeaderShakeOpen()" />
      </view>
      <view class="shake-level" v-if="headerShakeOpen">
        <view class="shake-level-item" :style="headerShakeLevel === 1 ? 'background: #0B4F73' : ''" @click="changeHeaderShakeLevel(1)">一级</view>
        <view class="shake-level-item" :style="headerShakeLevel === 2 ? 'background: #0B4F73' : ''" @click="changeHeaderShakeLevel(2)">二级</view>
        <view class="shake-level-item" :style="headerShakeLevel === 3 ? 'background: #0B4F73' : ''" @click="changeHeaderShakeLevel(3)">三级</view>
      </view>
    </view>
    <view class="shake base-bg" v-if="showFooterShake">
      <view class="title">
        <image class="shake-icon" src="../../static/home/footer-shake.png" alt="" />
        <text class="shake-title">脚震动</text>
        <mySwitch :isOpen="footerShakeOpen" @toggle="handleFooterShakeOpen()" />
      </view>
      <view class="shake-level" v-if="footerShakeOpen">
        <view class="shake-level-item" :style="footerShakeLevel === 1 ? 'background: #0B4F73' : ''" @click="changeFooterShakeLevel(1)">一级</view>
        <view class="shake-level-item" :style="footerShakeLevel === 2 ? 'background: #0B4F73' : ''" @click="changeFooterShakeLevel(2)">二级</view>
        <view class="shake-level-item" :style="footerShakeLevel === 3 ? 'background: #0B4F73' : ''" @click="changeFooterShakeLevel(3)">三级</view>
      </view>
    </view>
    <view class="light-timing" v-if="showLight">
      <view class="light base-bg">
        <text class="light-title">灯光</text>
        <mySwitch :isOpen="lightShakeOpen" @toggle="handleLightShakeOpen()" />
      </view>
      <view class="timing base-bg" @click="showTimingPop()">
        <text class="timing-title">{{ `震动${timing}分钟` }}</text>
        <image class="bluetooth-arrow" src="../../static/home/right-arrow.png" alt="" />
      </view>
    </view>
    <view class="select_box" v-if="popShow">
      <view class="select_item" @click="changeTiming(10)">
        <text>10分钟</text>
      </view>
      <view class="select_item" @click="changeTiming(20)">
        <text>20分钟</text>
      </view>
      <view class="select_item select_item_last" @click="changeTiming(30)">
        <text>30分钟</text>
      </view>
    </view>
    <view class="mask" v-if="popShow" @touchmove.stop.prevent="() => {}" />
  </view>
</template>

<script>
  import mySwitch from '../../components/Switch/index';
  import { arrayBufferToString, incrementSixthCharacter, string2HexArray } from '../../utils/common';
  import { onBLECharacteristicValueChange, onBLEConnectionStateChange, stopBluetoothDevicesDiscovery, writeBLECharacteristicValue } from '../../utils/bluetooth';
  import { connectBluetooth, initBluetooth } from '../../components/Bluetooth/bluetooth';
  export default {
    name: 'indexPage',
    data() {
      return {
        popShow: false,
        deviceId: undefined,
        bedHeaderStyle: {
          transform: 'rotate(0deg)'
        },
        bedLegStyle: {
          transform: 'rotate(0deg)'
        },
        bedFooterStyle: {
          transform: 'translateX(0rpx) translateY(0rpx)'
        },
        bedHeader: 0,
        bedLeg: 0,
        mode: 0,
        modeSleep: false,
        modeYoga: false,
        headerShakeOpen: false,
        headerShakeLevel: 1,
        footerShakeOpen: false,
        footerShakeLevel: 1,
        lightShakeOpen: false,
        timing: 10,
        isSending: false,
        isSendNum: 1,
        sendValueString: '',
        getValueString: '',
        timer: null,
        showHeaderShake: true,
        showFooterShake: true,
        showLight: true,
        isInit: true
      };
    },
    components: {
      mySwitch
    },
    onShow() {
      const { deviceId } = uni.getStorageSync('MS');
      if (deviceId) {
        this.deviceId = deviceId;
        this.onBLECharacteristicValueChange();
      }
      onBLEConnectionStateChange(({ deviceId, connected }) => {
        if (connected) {
          this.deviceId = deviceId;
          this.onBLECharacteristicValueChange();
          setTimeout(() => {
            this.sendCommand('<CMD00:900:099>\r\n');
          }, 800);
        } else {
          uni.$showMsg('连接断开，请重新连接！');
          this.deviceId = undefined;
          uni.removeStorageSync('MS');
        }
      });
    },
    onLoad() {
      const { deviceId } = uni.getStorageSync('MS');
      if (deviceId) {
        wx.showLoading({
          title: '加载中...',
          mask: true
        });
        setTimeout(() => {
          this.initBluetooth();
          wx.hideLoading();
        }, 1000);
      }
    },
    methods: {
      // 显示定时弹窗
      showTimingPop() {
        this.popShow = true;
      },
      // 蓝牙
      initBluetooth() {
        initBluetooth({
          deviceFoundCb: () => {},
          noFound: () => {
            this.connectBluetooth();
          }
        });
      },
      // 连接蓝牙
      connectBluetooth() {
        const { deviceId, deviceName } = uni.getStorageSync('MS');
        connectBluetooth({
          deviceId,
          deviceName
        }).then(() => {
          // this.sendCommand('<CMD06:001:998>\r\n');
          // this.sendCommand('<CMD06:002:997>\r\n');
          // this.sendCommand('<CMD06:003:996>\r\n');
        });
      },
      // 监听单片机返回的数据
      onBLECharacteristicValueChange() {
        onBLECharacteristicValueChange((res) => {
          let str = arrayBufferToString(res.value);
          console.log('收到蓝牙设备数据:', str);
          if (this.isInit) {
            switch (str.substring(0, 6)) {
              case '<CMD01':
                switch (str.substring(0, 15)) {
                  case '<CMD01:050:949>': //头震动关
                    this.headerShakeOpen = false;
                    this.headerShakeLevel = 1;
                    break;
                  case '<CMD01:051:948>': //头震一级
                    this.headerShakeOpen = true;
                    this.headerShakeLevel = 1;
                    break;
                  case '<CMD01:052:947>': //头震二级
                    this.headerShakeOpen = true;
                    this.headerShakeLevel = 2;
                    break;
                  case '<CMD01:053:946>': //头震三级
                    this.headerShakeOpen = true;
                    this.headerShakeLevel = 3;
                    break;
                  case '<CMD01:060:939>': //脚震动关
                    this.footerShakeOpen = false;
                    this.footerShakeLevel = 1;
                    break;
                  case '<CMD01:061:938>': //脚震一级
                    this.footerShakeOpen = true;
                    this.footerShakeLevel = 1;
                    break;
                  case '<CMD01:062:937>': //脚震二级
                    this.footerShakeOpen = true;
                    this.footerShakeLevel = 2;
                    break;
                  case '<CMD01:063:936>': //脚震三级
                    this.footerShakeOpen = true;
                    this.footerShakeLevel = 3;
                    break;
                  case '<CMD01:070:929>': //倒计时10分钟
                    this.timing = 10;
                    break;
                  case '<CMD01:071:928>': //倒计时20分钟
                    this.timing = 20;
                    break;
                  case '<CMD01:072:927>': //倒计时30分钟
                    this.timing = 30;
                    break;
                }
                break;
              case '<CMD03': {
                let value = str.substring(7, 10);
                this.sliderChangeHeader(((value / 100) * 60).toFixed(0));
                break;
              }
              case '<CMD05': {
                let value = str.substring(7, 10);
                this.sliderChangeLeg(((value / 100) * 30).toFixed(0));
                break;
              }
              case '<CMD07':
                switch (str.substring(0, 15)) {
                  case '<CMD07:001:998>': //没有床头震动按摩功能
                    this.showHeaderShake = false;
                    break;
                  case '<CMD07:101:898>': //有床头震动按摩功能
                    this.showHeaderShake = true;
                    break;
                  case '<CMD07:002:997>': //没有床尾震动按摩功能
                    this.showFooterShake = false;
                    break;
                  case '<CMD07:102:897>': //有床尾震动按摩功能
                    this.showFooterShake = true;
                    break;
                  case '<CMD07:003:996>': //没有灯光功能
                    this.showLight = false;
                    break;
                  case '<CMD07:103:896>': //有灯光功能
                    this.showLight = true;
                    break;
                }
                break;
            }
            this.isInit = false;
          }
          this.getValueString = incrementSixthCharacter(str).substring(0, 15);
          if (this.sendValueString === this.getValueString) {
            clearInterval(this.timer);
            this.isSendNum = 1;
            this.isSending = false;
            uni.$showMsg('操作成功！');
            console.log('this.sendValueString === this.getValueString');
          }
        });
      },
      // 定时
      changeTiming(value) {
        if (!this.deviceId) {
          uni.$showMsg('请先连接蓝牙!');
          return;
        } else if (this.isSending) {
          return;
        }
        this.timing = value;
        this.popShow = false;
        switch (value) {
          case 10:
            this.sendCommand('<CMD00:070:929>\r\n');
            break;
          case 20:
            this.sendCommand('<CMD00:071:928>\r\n');
            break;
          case 30:
            this.sendCommand('<CMD00:072:927>\r\n');
            break;
        }
      },
      // 模式
      changeModeSleep() {
        if (!this.deviceId) {
          uni.$showMsg('请先连接蓝牙!');
          return;
        } else if (this.isSending) {
          return;
        }
        this.modeYoga = false;
        this.mode = 0;
        if (this.modeSleep) {
          this.modeSleep = !this.modeSleep;
          this.sendCommand('<CMD00:010:989>\r\n');
        } else {
          this.modeSleep = !this.modeSleep;
          this.sendCommand('<CMD00:004:995>\r\n');
        }
      },

      changeModeYoga() {
        if (!this.deviceId) {
          uni.$showMsg('请先连接蓝牙!');
          return;
        } else if (this.isSending) {
          return;
        }
        this.modeSleep = false;
        this.mode = 0;
        if (this.modeYoga) {
          this.modeYoga = !this.modeYoga;
          this.sendCommand('<CMD00:011:988>\r\n');
        } else {
          this.modeYoga = !this.modeYoga;
          this.sendCommand('<CMD00:008:991>\r\n');
        }
      },

      changeModeOther(value) {
        if (!this.deviceId) {
          uni.$showMsg('请先连接蓝牙!');
          return;
        } else if (this.isSending) {
          return;
        } else if (this.mode === value) {
          return;
        }

        this.modeSleep = false;
        this.modeYoga = false;
        this.mode = value;
        if (value === 1) {
          this.sendCommand('<CMD00:005:994>\r\n');
        } else if (value === 2) {
          this.sendCommand('<CMD00:006:993>\r\n');
        } else if (value === 3) {
          this.sendCommand('<CMD00:007:992>\r\n');
        } else if (value === 4) {
          this.sendCommand('<CMD00:009:990>\r\n');
        }
      },
      // 头震动
      handleHeaderShakeOpen() {
        if (!this.deviceId) {
          uni.$showMsg('请先连接蓝牙!');
          return;
        } else if (this.isSending) {
          return;
        }
        if (this.headerShakeOpen) {
          this.headerShakeOpen = false;
          this.sendCommand('<CMD00:050:949>\r\n');
        } else {
          this.headerShakeOpen = true;
          this.headerShakeLevel = 1;
          this.changeHeaderShakeLevel(1);
        }
      },
      changeHeaderShakeLevel(value) {
        if (!this.deviceId) {
          uni.$showMsg('请先连接蓝牙!');
          return;
        } else if (this.isSending) {
          return;
        }
        this.headerShakeLevel = value;
        const tmpValue = (value + 50).toString().padStart(3, '0');
        this.sendCommand(`<CMD00:${tmpValue}:${999 - tmpValue}>\r\n`);
      },
      // 脚震动
      handleFooterShakeOpen() {
        if (!this.deviceId) {
          uni.$showMsg('请先连接蓝牙!');
          return;
        } else if (this.isSending) {
          return;
        }
        if (this.footerShakeOpen) {
          this.footerShakeOpen = false;
          this.sendCommand('<CMD00:060:939>\r\n');
        } else {
          this.footerShakeOpen = true;
          this.footerShakeLevel = 1;
          this.changeFooterShakeLevel(1);
        }
      },
      changeFooterShakeLevel(value) {
        if (!this.deviceId) {
          uni.$showMsg('请先连接蓝牙!');
          return;
        } else if (this.isSending) {
          return;
        }
        console.log(this.footerShakeLevel);
        this.footerShakeLevel = value;
        const tmpValue = (value + 60).toString().padStart(3, '0');
        this.sendCommand(`<CMD00:${tmpValue}:${999 - tmpValue}>\r\n`);
      },
      // 灯
      handleLightShakeOpen() {
        if (!this.deviceId) {
          uni.$showMsg('请先连接蓝牙!');
          return;
        } else if (this.isSending) {
          return;
        }
        if (this.lightShakeOpen) {
          this.lightShakeOpen = false;
          this.sendCommand('<CMD00:080:919>\r\n');
        } else {
          this.lightShakeOpen = true;
          this.sendCommand('<CMD00:081:918>\r\n');
        }
      },
      // 发送
      sendCommand(value) {
        if (this.isSending) return;
        this.isSending = true;
        if (!this.deviceId) {
          uni.$showMsg('请先连接蓝牙!');
          return;
        }
        this.sendValueString = value.substring(0, 15);
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
      // 去蓝牙列表
      goBluetoothList() {
        uni.navigateTo({ url: '/pages/bluetooth/index' });
      },
      sliderChangeHeader(value) {
        if (!this.deviceId) {
          uni.$showMsg('请先连接蓝牙!');
          return;
        } else if (this.isSending) {
          return;
        }
        this.modeSleep = false;
        this.modeYoga = false;
        this.mode = 0;
        this.bedHeaderStyle.transform = `rotate(${value}deg)`;
        this.bedHeader = value;
        const perValue = ((value / 60) * 100).toFixed(0).toString().padStart(3, '0');
        this.sendCommand(`<CMD02:${perValue}:${999 - perValue}>\r\n`);
      },
      sliderChangeLeg(value) {
        if (!this.deviceId) {
          uni.$showMsg('请先连接蓝牙!');
          return;
        } else if (this.isSending) {
          return;
        }
        this.modeSleep = false;
        this.modeYoga = false;
        this.mode = 0;
        this.bedLeg = value;
        this.bedLegStyle.transform = `rotate(-${value}deg)`;
        const { xOffset, yOffset } = this.calculateOffset(80, 1, value);
        this.bedFooterStyle.transform = `translateX(-${xOffset}rpx) translateY(-${yOffset}rpx)`;
        const perValue = ((value / 30) * 100).toFixed(0).toString().padStart(3, '0');
        this.sendCommand(`<CMD04:${perValue}:${999 - perValue}>\r\n`);
      },
      calculateOffset(width, height, angleInDegrees) {
        // 将角度转换为弧度
        const angleInRadians = angleInDegrees * (Math.PI / 180);

        // 计算x和y的偏移量
        const xOffset = width * Math.cos(angleInRadians);
        const yOffset = width * Math.sin(angleInRadians);
        console.log(xOffset, yOffset);
        return {
          xOffset: width - xOffset,
          yOffset: yOffset
        };
      }
    }
  };
</script>

<style scoped lang="scss">
  .base-bg {
    background: #162844;
    box-shadow:
      inset 0 4rpx 1rpx 0 rgba(255, 255, 255, 0.17),
      0 4rpx 1rpx 4rpx rgba(13, 29, 51, 0.17);
    border-radius: 20rpx;
  }

  .mt42 {
    margin-top: 42rpx;
  }

  .content {
    position: relative;
    //display: flex;
    //flex-direction: column;
    //align-items: center;
    width: 100vw;
    min-height: 100vh;
    padding: 12rpx 45rpx 32rpx 45rpx;
    box-sizing: border-box;
    background: linear-gradient(90deg, #0e1e34, #0d1522);
    color: #fff;
    font-size: 30rpx;

    .bluetooth {
      margin-top: 12rpx;
      width: 100%;
      height: 78rpx;
      background: #162844;
      border-radius: 39px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;

      .bluetooth-icon {
        width: 32rpx;
        height: 32rpx;
        margin-right: 30rpx;
      }

      .bluetooth-arrow {
        width: 12rpx;
        height: 24rpx;
        margin-left: 40rpx;
      }
    }

    .bed {
      position: relative;
      margin: 142rpx auto 0 auto;
      position: relative;
      width: 450rpx;
      height: 226rpx;

      .bed-header {
        position: absolute;
        left: 6rpx;
        bottom: 58rpx;
        width: 174rpx;
        height: 24rpx;
        background: #0c9bcc;
        transform-origin: 174rpx 12rpx;
        border-radius: 4rpx 0 0 4rpx;

        &:after {
          position: absolute;
          left: 14rpx;
          top: 7rpx;
          content: '';
          width: 48rpx;
          height: 10rpx;
          background: #ffffff;
          border-radius: 5rpx;
        }
      }

      .bed-center {
        position: absolute;
        background: #0c9bcc;
        left: 168rpx;
        bottom: 58rpx;
        width: 104rpx;
        border-radius: 12rpx;
        height: 24rpx;
      }

      .bed-leg {
        position: absolute;
        background: #0c9bcc;
        left: 260rpx;
        bottom: 58rpx;
        width: 80rpx;
        height: 24rpx;
        transform-origin: 0 12rpx;
      }

      .bed-footer {
        position: absolute;
        background: #0c9bcc;
        left: 328rpx;
        bottom: 58rpx;
        width: 116rpx;
        border-radius: 12rpx 4rpx 4rpx 12rpx;
        height: 24rpx;
        transform: translateX(-20rpx) translateY(-40rpx);

        &:after {
          position: absolute;
          right: 14rpx;
          top: 7rpx;
          content: '';
          width: 48rpx;
          height: 10rpx;
          background: #ffffff;
          border-radius: 5rpx;
        }
      }

      .bed-img {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        bottom: 0;
      }

      .bed-header-value {
        position: absolute;
        left: 20rpx;
        top: -37rpx;
        line-height: 42rpx;
        font-size: 46rpx;
      }

      .bed-leg-value {
        position: absolute;
        right: -52rpx;
        top: 42rpx;
        line-height: 42rpx;
        font-size: 46rpx;
      }
    }

    .angle {
      margin-top: 50rpx;
      padding: 42rpx 36rpx 0 36rpx;
      box-sizing: border-box;
      width: 100%;
      height: 380rpx;

      .title {
        font-size: 30rpx;
        line-height: 42rpx;
      }
      .scope {
        margin-top: 16rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        font-size: 24rpx;
        color: #909090;
        line-height: 42rpx;
      }
      .slider {
        margin-top: -8rpx;
        width: 100%;
        slider {
          margin: 0 15rpx;
        }
      }
    }
    .set-memory {
      margin-top: 28rpx;
      width: 100%;
      height: 120rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      &:active {
        background: #1b2f4e;
      }
    }
    .memory-row2 {
      margin-top: 28rpx;
      width: 100%;
      height: 120rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .reset {
        width: 418rpx;
        height: 120rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        &:active {
          background: #1b2f4e;
        }
      }
      .get-memory {
        width: 208rpx;
        height: 120rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        &:active {
          background: #1b2f4e;
        }
      }
    }
    .mode {
      margin-top: 28rpx;
      width: 100%;
      height: 372rpx;
      padding: 48rpx 38rpx 0 38rpx;
      box-sizing: border-box;
      .mode-btn {
        margin-top: 46rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .mode-btn-item {
          width: 268rpx;
          height: 112rpx;
          background: #0e1d32;
          border-radius: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
      .mode-other-btn {
        margin-top: 32rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .mode-btn-item {
          //width: 268rpx;
          padding: 0 36rpx;
          height: 60rpx;
          background: #0e1d32;
          border-radius: 24rpx;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
    .shake {
      margin-top: 28rpx;
      width: 100%;
      min-height: 120rpx;
      padding: 32rpx 38rpx 32rpx 38rpx;
      box-sizing: border-box;
      .title {
        display: flex;
        align-items: center;
        .shake-icon {
          width: 56rpx;
          height: 56rpx;
          margin-right: 28rpx;
        }
        .shake-title {
          flex: 1;
          width: 100%;
        }
      }
      .shake-level {
        margin-top: 36rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .shake-level-item {
          width: 164rpx;
          height: 64rpx;
          background: #0e1d32;
          border-radius: 32rpx;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
    .light-timing {
      margin-top: 28rpx;
      width: 100%;
      height: 120rpx;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .light {
        width: 318rpx;
        height: 120rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        .light-title {
          margin-right: 56rpx;
        }
      }
      .timing {
        width: 318rpx;
        height: 120rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        image {
          width: 12rpx;
          height: 24rpx;
          margin-left: 36rpx;
        }
      }
    }
    .select_box {
      opacity: 1;
      width: 100%;
      position: absolute;
      z-index: 99;
      bottom: 0;
      left: 0;
      background: #162844;
      border-radius: 32rpx 32rpx 0 0;
      overflow: hidden;

      .select_item {
        background: #162844;
        position: relative;
        height: 112rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        color: #fff;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          width: 686rpx;
          height: 2rpx;
          background: #2c568e;
        }
      }

      .select_item_last {
        &::after {
          content: none;
        }
      }
    }

    .mask {
      position: fixed;
      z-index: 88;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.2);
    }
  }
  //.popShow {
  //  overflow: hidden;
  //  position: fixed;
  //  top: 0px;
  //  left: 0px;
  //  width: 100vw;
  //  height: 100vh;
  //  z-index: 0;
  //}
</style>
