<template>
  <view class="content">
    <template v-if="false">
      <image class="upgrade-img" src="../../static/mine/upgrade-bg.png" alt="" />
      <view class="upgrade-title">新版本升级</view>
      <view class="upgrade-desc">全新改版升级更时尚</view>
      <view class="upgrade-btn">立即升级</view>
    </template>
    <template v-if="true">
      <image class="upgrade-circle-img" src="../../static/mine/upgrade-bg-circle.png" alt="" />
      <view class="upgrade-title">升级中...</view>
    </template>
    <template v-if="false">
      <image class="upgrade-img" src="../../static/mine/upgrade-bg.png" alt="" />
      <view class="upgrade-title">版本已经最新啦</view>
      <view class="upgrade-desc">全新改版升级更时尚</view>
      <view class="upgrade-btn">退 出</view>
    </template>
  </view>
</template>

<script>
  export default {
    name: 'minePage',
    data() {
      return {};
    },

    onLoad() {},
    methods: {}
  };
</script>

<style scoped lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100vw;
    min-height: 100vh;
    box-sizing: border-box;
    background: linear-gradient(90deg, #0e1e34, #0d1522);
    color: #fff;
    font-size: 30rpx;

    .upgrade-img {
      width: 100%;
      height: 578rpx;
    }
    .upgrade-circle-img {
      width: 326rpx;
      height: 326rpx;
    }
    .upgrade-title {
      margin-top: 58rpx;
      font-size: 37rpx;
    }
    .upgrade-desc {
      margin-top: 24rpx;
      font-size: 34rpx;
    }

    .upgrade-btn {
      margin-top: 68rpx;
      width: 348rpx;
      height: 64rpx;
      background: #ffffff;
      border-radius: 32rpx;
      font-size: 37rpx;
      color: #0049b0;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
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
