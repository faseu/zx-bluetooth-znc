<template>
  <view class="content">
    <view class="bluetooth" @click="goBluetoothList()">
      <image class="bluetooth-icon" src="../../static/home/bluetooth-orange.png" alt="" />
      <text> 蓝牙未连接 </text>
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
        <slider value="0" @change="sliderChangeHeader" activeColor="#0C9BCC" backgroundColor="#324A61" min="0" max="60" block-color="#0C9BCC" block-size="15" />
      </view>
      <view class="title mt42">床尾升降</view>
      <view class="scope">
        <view>0°</view>
        <view>30°</view>
      </view>
      <view class="slider">
        <slider value="0" @change="sliderChangeLeg" activeColor="#0C9BCC" backgroundColor="#324A61" min="0" max="30" block-color="#0C9BCC" block-size="15" />
      </view>
    </view>
    <view class="set-memory base-bg">记忆角度设定</view>
    <view class="memory-row2">
      <view class="reset base-bg" @click="sendCommand('<CMD00:001:998>')">一键放平</view>
      <view class="get-memory base-bg" @click="sendCommand('<CMD00:001:998>')">恢复记忆角度</view>
    </view>
    <view class="mode base-bg">
      <view>选择模式</view>
      <view class="mode-btn">
        <view class="mode-btn-item">睡眠模式</view>
        <view class="mode-btn-item">零重力模式</view>
      </view>
    </view>
    <view class="header-shake base-bg">
      <view class="title">
        <image class="shake-icon" src="../../static/home/header-shake.png" alt="" />
        <text class="shake-title">头震动</text>
        <mySwitch :isOpen="headerShakeOpen" @toggle="handleHeaderShakeOpen()" />
      </view>
      <view class="shake-level">
        <view class="shake-level-item">一级</view>
        <view class="shake-level-item">二级</view>
        <view class="shake-level-item">三级</view>
      </view>
    </view>
    <view class="footer-shake base-bg">
      <view class="title">
        <image class="shake-icon" src="../../static/home/footer-shake.png" alt="" />
        <text class="shake-title">脚震动</text>
        <mySwitch :isOpen="footerShakeOpen" @toggle="handleFooterShakeOpen()" />
      </view>
    </view>
    <view class="light-timing">
      <view class="light base-bg">
        <text class="light-title">灯光</text>
        <mySwitch :isOpen="lightShakeOpen" @toggle="handleLightShakeOpen()" />
      </view>
      <view class="timing base-bg">
        <text class="timing-title">震动15分钟</text>
        <image class="bluetooth-arrow" src="../../static/home/right-arrow.png" alt="" />
      </view>
    </view>
  </view>
</template>

<script>
  import mySwitch from '../../components/Switch/index';
  export default {
    name: 'indexPage',
    data() {
      return {
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
        headerShakeOpen: false,
        footerShakeOpen: false,
        lightShakeOpen: false
      };
    },
    components: {
      mySwitch
    },
    onLoad() {},
    methods: {
      handleHeaderShakeOpen() {
        this.headerShakeOpen = !this.headerShakeOpen;
      },
      handleFooterShakeOpen() {
        this.footerShakeOpen = !this.footerShakeOpen;
      },
      handleLightShakeOpen() {
        this.lightShakeOpen = !this.lightShakeOpen;
      },
      sendCommand(value) {
        console.log(value);
      },
      goBluetoothList() {
        uni.navigateTo({ url: '/pages/bluetooth/index' });
      },
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
    display: flex;
    flex-direction: column;
    align-items: center;
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
      margin-top: 142rpx;
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
      height: 300rpx;
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
    }
    .header-shake {
      margin-top: 28rpx;
      width: 100%;
      height: 218rpx;
      padding: 32rpx 38rpx 0 38rpx;
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
    .footer-shake {
      margin-top: 28rpx;
      width: 100%;
      height: 120rpx;
      padding: 32rpx 38rpx 0 38rpx;
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
  }
</style>
