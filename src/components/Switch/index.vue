<template>
  <view class="checkbox" :class="isOpen ? 'active' : ''" @click="handleToggle">
    <text v-show="isOpen">开</text>
    <view class="circle"></view>
    <text v-show="!isOpen">关</text>
  </view>
</template>

<script>
  export default {
    props: {
      isOpen: {
        required: true,
        type: Boolean,
        default: false
      }
    },
    data() {
      return {};
    },
    methods: {
      handleToggle() {
        this.$emit('toggle');
      }
    }
  };
</script>

<style scoped lang="scss">
  .active {
    background-color: #23a5e9 !important;
  }
  .checkbox {
    width: 112rpx;
    height: 50rpx;
    padding: 7rpx;
    box-sizing: border-box;
    border-radius: 24rpx;
    background-color: #0e1d32;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    > .circle {
      width: 36rpx;
      height: 36rpx;
      background-color: white;
      border-radius: 50%;
    }
    > text {
      flex: 1;
      font-size: 24rpx;
      color: white;
      &:first-of-type {
        text-align: left;
        margin-left: 16rpx;
      }
      &:last-of-type {
        text-align: right;
        margin-right: 16rpx;
      }
    }
  }
</style>
