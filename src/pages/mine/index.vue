<template>
  <view class="content">
    <image class="mine-bg" src="../../static/mine/bg.png" alt="" />
    <view class="upgrade" @click="goToUpgrade">
      <image class="upgrade-icon" src="../../static/mine/upgrade-icon.png" alt="" />
      <text class="upgrade-title">OTA升级</text>
      <text class="upgrade-desc">有新的升级文件</text>
      <image class="upgrade-arrow" src="../../static/home/right-arrow.png" alt="" />
    </view>
  </view>
</template>

<script>
  export default {
    name: 'minePage',
    data() {
      return {};
    },
    onLoad() {},
    methods: {
      goToUpgrade() {
        uni.navigateTo({ url: '/pages/upgrade/index' });
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
