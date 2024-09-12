<template>
  <view class="main">
    <!-- 		<view class="bluetooth-state">
			<text class="left">蓝牙</text>
			<view class="right">
				<text>开</text>
				<image src="../../static/img/right.png" mode="" class="img"></image>
			</view>
		</view> -->
    <view class="box" v-if="JSON.stringify(connectedDevices) != '{}'">
      <p class="title">我的设备</p>
      <view class="item">
        <text class="left">{{ connectedDevices.name }}</text>
        <text class="right" @click="disconnect">断开设备</text>
      </view>
    </view>

    <view class="box" v-if="devList.length > 0">
      <p class="title">可用设备</p>
      <view class="list">
        <view class="list-item" v-for="item in devList" @click="createBLEConnection(item)" v-if="item.name != connectedDevices.name">
          <text class="left">{{ item.name }}</text>
          <text class="right">{{ connectedDevices.deviceId == item.deviceId ? '已连接' : '未连接' }}</text>
        </view>
      </view>
    </view>
    <view class="no-data" v-else>
      <p style="font-weight: 400; font-size: 30rpx; color: #999999; margin: 44rpx 0 90rpx 0; text-align: center">暂无可用设备</p>
    </view>
  </view>
</template>

<script>
  import { getReadBLECharacteristicValue } from '@/utils/bluetooth2';

  export default {
    data() {
      return {
        connectedDevices: uni.getStorageSync('connectedDevices') || {}, //当前已连接的设备
        deviceId: '',
        devList: []
      };
    },
    onPullDownRefresh() {
      setTimeout(() => {
        uni.stopPullDownRefresh();
      }, 1000);
      this.initBle();
    },
    beforeUnmount() {
      // uni.closeBluetoothAdapter({
      // 	success(res) {
      // 		console.log(res)
      // 	}
      // })
      // this.stopBluetoothDevicesSearch();
      // 清理连接等操作
    },
    onLoad() {
      this.initBle();
    },
    onShow() {
      this.connectedDevices = uni.getStorageSync('connectedDevices') || {};
    },
    methods: {
      //断开连接
      disconnect(isShowMsg = true) {
        let _this = this;
        uni.closeBluetoothAdapter({
          success(res) {
            uni.removeStorageSync('connectedDevices', {});
            _this.connectedDevices = {};
            if (isShowMsg) {
              uni.$showMsg('已断开连接!');
            }
            console.log(res);
          },
          fail(error) {
            console.log(error);
          }
        });
      },
      //初始化蓝牙
      initBle() {
        let _this = this;
        uni.openBluetoothAdapter({
          success: (res) => {
            //已打开
            uni.getBluetoothAdapterState({
              //蓝牙的匹配状态
              success: (res1) => {
                console.log(res1, '“本机设备的蓝牙已打开”');
                //苹果设备连接蓝牙时，由于加密问题，所以需要先查找周围的蓝牙信息来进行匹配
                // if (uni.getSystemInfoSync().platform == 'ios') {
                // 开始搜索蓝牙设备
                this.startBluetoothDeviceDiscovery();
                // }
                //安卓设备连接蓝牙时就没有加密问题，可以使用蓝牙标识直接进行蓝牙连接
                // if (uni.getSystemInfoSync().platform == 'android') {
                // 	console.log(deviceId)
                // 	this.createBLEConnection(deviceId);
                // }
              },
              fail(error) {
                uni.removeStorageSync('connectedDevices', {});
                _this.connectedDevices = {};
                _this.devList = [];
                uni.$showMsg('请打开蓝牙!');
              }
            });
          },
          fail: (err) => {
            //未打开
            uni.removeStorageSync('connectedDevices', {});
            _this.connectedDevices = {};
            _this.devList = [];
            uni.$showMsg('请打开蓝牙!');
          }
        });
      },
      // 开始搜索蓝牙设备
      startBluetoothDeviceDiscovery() {
        uni.startBluetoothDevicesDiscovery({
          // services: ['0000AE30-0000-1000-8000-00805F9B34FB'],
          success: (res) => {
            console.log('启动成功', res);
            // 发现外围设备
            this.onBluetoothDeviceFound();
          },
          fail: (err) => {
            console.log(err, '错误信息');
          }
        });
      },
      // 发现外围设备
      onBluetoothDeviceFound() {
        setTimeout(() => {
          uni.$showMsg('搜索完成');
          uni.stopBluetoothDevicesDiscovery({
            success(res) {}
          });
        }, 2000);
        console.log('执行到这--发现外围设备');
        this.devList = [];
        uni.showLoading({ title: '正在搜索设备...' });
        uni.onBluetoothDeviceFound((res) => {
          console.log(res, '发现外围设备');

          //遍历周围的设备
          res.devices.forEach((ele) => {
            this.devList.push(ele);

            //判断周围设备和当前设备的编号或者其他唯一标识是否相同，相同则匹配
            // if (ele.name === 'DT20' && this.devList.map((item) => item.deviceId).indexOf(ele.deviceId) == -1) {
            //   this.devList.push(ele);
            // }
          });
          // 把搜索到的设备存储起来，方便我们在页面上展示
          // console.log("蓝牙列表", this.devList);
        });
      },
      //选择设备连接吧deviceId传进来
      createBLEConnection(item) {
        // console.log("item.deviceId", item.deviceId)
        let thit = this;
        //data里面建立一个deviceId，存储起来

        uni.showLoading();
        //连接蓝牙
        uni.createBLEConnection({
          // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
          deviceId: item.deviceId,
          success(res) {
            uni.hideLoading();
            console.log(item, '设备信息');
            thit.deviceId = item.deviceId;
            thit.connectedDevices = item;
            uni.setStorageSync('connectedDevices', item);
            if (uni.getSystemInfoSync().platform == 'ios') {
              //防止在这里面取不到this，古在外面用thit存储了this
              thit.stopBluetoothDevicesDiscovery();
            }
            thit.getBLEDeviceServices();
            console.log('蓝牙连接成功deviceId', res);
          },
          fail(res) {
            uni.$showMsg('连接失败');
            console.log('蓝牙连接失败', res);
          }
        });
      },
      // 停止搜寻蓝牙设备
      stopBluetoothDevicesDiscovery() {
        uni.stopBluetoothDevicesDiscovery({
          success: (e) => {
            this.loading = false;
            console.log('停止搜索蓝牙设备:' + e.errMsg);
          },
          fail: (e) => {
            console.log('停止搜索蓝牙设备失败，错误码：' + e.errCode);
          }
        });
      },
      //获取蓝牙的所有服务
      getBLEDeviceServices() {
        setTimeout(() => {
          uni.getBLEDeviceServices({
            // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
            deviceId: this.deviceId,
            success: (res) => {
              this.serviceId = res.services[0].uuid;
              this.equipment_status = true;
              //进入特征
              this.getBLEDeviceCharacteristics();
            }
          });
        }, 1500);
      },
      //获取蓝牙特征
      getBLEDeviceCharacteristics() {
        console.log('进入特征');
        let thit = this;
        setTimeout(() => {
          uni.getBLEDeviceCharacteristics({
            // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
            deviceId: thit.deviceId,
            // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
            serviceId: '0000FFF0-0000-1000-8000-00805F9B34FB',
            success: (res) => {
              // thit.getPage(thit.deviceId);
              getReadBLECharacteristicValue();
              setTimeout(() => {
                //这里可以处理一些业务逻辑
              }, 1000);
            },
            fail: (res) => {
              console.log(res);
            }
          });
        }, 1000);
      }
    }
  };
</script>

<style scoped lang="scss">
  .main {
    background: #f2f2f2;
    padding: 20rpx;
    height: 100%;
  }

  .bluetooth-state {
    background: #ffffff;
    display: flex;
    justify-content: space-between;
    padding: 36rpx 27rpx;
    border-radius: 20rpx;
    font-weight: 500;
    font-size: 30rpx;
    color: #2b3641;

    .right {
      .img {
        margin-left: 20rpx;
        width: 22rpx;
        height: 22rpx;
      }
    }
  }

  .box {
    .title {
      margin: 40rpx 0 24rpx 0;
      font-size: 24rpx;
      color: #515151;
    }

    .item {
      border-radius: 20rpx;
      background: #ffffff;
      display: flex;
      justify-content: space-between;
      font-weight: 400;
      font-size: 30rpx;
      color: #333333;
      padding: 38rpx 25rpx;
    }

    .list {
      background: #ffffff;
      border-radius: 20rpx;
      padding: 0 25rpx;

      .list-item {
        display: flex;
        justify-content: space-between;
        font-weight: 400;
        font-size: 30rpx;
        color: #333333;
        padding: 38rpx 0rpx;
        border-bottom: 1rpx solid #f2f2f2;

        .right {
          font-weight: 400;
          font-size: 30rpx;
          color: #838383;
        }
      }
    }
  }

  .no-data {
    height: 100%;
    margin: auto;
    align-items: center;
    display: flex;
    flex-direction: column;
  }
</style>
