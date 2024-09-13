<template>
  <view class="bg">
    <view class="bed">
      <view class="bed-header" :style="bedHeaderStyle" />
      <view class="bed-center" />
      <view class="bed-leg" :style="bedLegStyle" />
      <view class="bed-footer" :style="bedFooterStyle" />
      <image class="bed-img" src="../../static/home/bed.png" alt="" />
    </view>
    <view class="uni-title">床头升降</view>
    <view class="slider">
      <slider value="0" @change="sliderChangeHeader" activeColor="#0C9BCC" backgroundColor="#324A61" min="0" max="60" block-color="#0C9BCC" block-size="20" />
    </view>
    <view class="uni-title">床尾升降</view>
    <view class="slider">
      <slider value="0" @change="sliderChangeLeg" activeColor="#0C9BCC" backgroundColor="#324A61" min="0" max="30" block-color="#0C9BCC" block-size="20" />
    </view>
  </view>
</template>

<script>
  export default {
    name: 'testPage',
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
        },
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
        bedLeg: 0
      };
    },
    onReady() {
      // uni
      //   .createSelectorQuery()
      //   .select('#rod')
      //   .boundingClientRect((rect) => {
      //     this.knobX = rect.left + rect.width / 2;
      //     this.knobY = rect.top + rect.height / 2;
      //   })
      //   .exec();
    },
    onLoad(query) {
      // this.updateCurrentTime();
      // setInterval(this.updateCurrentTime, 1000);
    },
    onShow(options) {
      // let connected = createBLEConnection();
      // console.log(connected)
    },
    methods: {
      sliderChangeHeader(e) {
        const { value } = e.detail;
        this.bedHeaderStyle.transform = `rotate(${value}deg)`;
        this.bedHeader = value;
      },
      sliderChangeLeg(e) {
        const { value } = e.detail;
        this.bedLeg = value;
        this.bedLegStyle.transform = `rotate(-${value}deg)`;
        const { xOffset, yOffset } = this.calculateOffset(80, 1, value);

        this.bedFooterStyle.transform = `translateX(-${xOffset}rpx) translateY(-${yOffset}rpx)`;
      },
      goToBluetoothList() {
        uni.navigateTo({ url: '/pages/bluetooth/bluetooth4' });
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
        let unit = (150 / 12).toFixed(2);
        let difference = Math.round((rotationAngle - 15) / 12);
        this.temperatureValue = difference + 18;
        rotationAngle = difference * unit + 15;
        this.myStyle.transform = `rotate(${rotationAngle}deg)`;
        console.log(rotationAngle);
      },
      handleTouchEnd() {
        let hexString = this.temperatureValue.toString(16);
        this.$refs.bluetooth.writeBLECharacteristicValue(`55aa04${hexString}`);
      },
      reconnectBluetooth() {
        this.$refs.bluetooth.autoConnectBluetooth();
      },
      connectionStateChange(connected) {
        console.log('connected', connected);
        this.connect_status = connected;
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
  .bg {
    padding-top: 240rpx;
    box-sizing: border-box;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;

    .bed {
      position: relative;
      width: 450rpx;
      height: 226rpx;
      .bed-header {
        position: absolute;
        left: 0;
        bottom: 58rpx;
        width: 180rpx;
        height: 24rpx;
        background: #0c9bcc;
        transform-origin: 180rpx 12rpx;
        border-radius: 4rpx 0 0 4rpx;
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
        width: 122rpx;
        border-radius: 12rpx 4rpx 4rpx 12rpx;
        height: 24rpx;
        transform: translateX(-20rpx) translateY(-40rpx);
      }
      .bed-img {
        width: 100%;
        height: 58rpx;
        position: absolute;
        left: 0;
        bottom: 0;
      }
    }
    .uni-title {
      margin-top: 40rpx;
    }
    .slider {
      width: 100%;
    }
  }
</style>
