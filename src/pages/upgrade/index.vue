<template>
  <view class="content">
    <template v-if="true">
      <image class="upgrade-img" src="../../static/mine/upgrade-bg.png" alt="" />
      <view class="upgrade-title">新版本升级</view>
      <view class="upgrade-desc">全新改版升级更时尚</view>
      <view class="upgrade-btn" @click="sendCommand('<CMD00:000:999>\r\n')">立即升级</view>
    </template>
    <template v-if="false">
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
  import filePath from '../../static/app.bin';
  import { awaitWrapper, getBluetoothAdapterState, onBLECharacteristicValueChange, writeBLECharacteristicValue } from '../../utils/bluetooth';
  import { arrayBufferToString, string2HexArray } from '../../utils/common';
  // 获取全局的文件管理器
  const fileSystemManager = uni.getFileSystemManager();
  export default {
    name: 'minePage',
    data() {
      return {
        arrayBuffer: undefined
      };
    },
    async onLoad() {
      this.onBLECharacteristicValueChange();
      this.readFileAsArrayBuffer(filePath);
      // 读取文件内容
      // fileSystemManager.readFile({
      //   filePath: filePath,
      //   encoding: 'binary', // 读取为二进制文件
      //   success: (res) => {
      //     console.log('读取文件成功:', res.data);
      //
      //     // this.startYmodemTransfer(res.data); // 将数据传递给 Ymodem 升级函数
      //   },
      //   fail: (err) => {
      //     console.error('读取文件失败:', err);
      //   }
      // });
      const [err0, res0] = await awaitWrapper(getBluetoothAdapterState());
      console.log(err0, res0);
    },
    methods: {
      sendCommand(value, isHexArray) {
        const { write } = JSON.parse(uni.getStorageSync('MS'));
        writeBLECharacteristicValue({
          ...write,
          value: isHexArray ? value : string2HexArray(value),
          callback: () => {}
        });
      },
      // 将文件内容转换为 ArrayBuffer
      readFileAsArrayBuffer(filePath) {
        fileSystemManager.readFile({
          filePath: filePath,
          success: (res) => {
            this.arrayBuffer = res.data; // ArrayBuffer 格式的文件内容

            console.log('文件内容:', this.arrayBuffer);
          },
          fail: (err) => {
            console.error('读取文件失败', err);
          }
        });
      },
      // 监听单片机返回的数据
      onBLECharacteristicValueChange() {
        onBLECharacteristicValueChange((res) => {
          let str = arrayBufferToString(res.value);
          console.log('收到蓝牙设备数据:', str);
          if (str.substring(0, 15) === '<CMD01:000:999>') {
            console.log('准备进入boot引导模式');
          }
          if (str === 'C') {
            // 开始 YMODEM 文件传输
            this.startYmodemTransfer();
          }
        });
      },
      // 开始 YMODEM 文件传输
      startYmodemTransfer() {
        const filename = 'app.bin'; // 固件文件名
        const fileSize = this.arrayBuffer.byteLength; // 固件大小（示例）
        const fileBuffer = this.arrayBuffer; // 读取文件内容，生成 ArrayBuffer

        // 第一步：发送文件名帧
        const fileHeader = this.createYmodemHeader(filename, fileSize);
        console.log('fileHeader---------', fileHeader);
        this.sendCommand(fileHeader, true);

        // // 监听 MCU 回复 ACK 然后发送文件数据
        uni.onBLECharacteristicValueChange((res) => {
          const str = arrayBufferToString(res.value);
          if (str === 'ACK') {
            console.log('收到ACK, 开始发送文件数据...');
          }
          if (str === 'C') {
            // 发送 YMODEM 文件数据
            this.sendYmodemData(fileBuffer);
          }
        });
      },
      // 创建 YMODEM 文件头
      createYmodemHeader(filename, fileSize) {
        const header = new Uint8Array(128); // YMODEM 文件头固定128字节
        header[0] = 0x01; // SOH 标识
        header[1] = 0x00; // 序号
        header[2] = 0xff; // 序号的反码

        // 填充文件名
        for (let i = 0; i < filename.length; i++) {
          header[3 + i] = filename.charCodeAt(i);
        }

        // 填充文件大小
        const fileSizeStr = fileSize.toString();
        for (let i = 0; i < fileSizeStr.length; i++) {
          header[3 + filename.length + 1 + i] = fileSizeStr.charCodeAt(i);
        }

        // 计算 CRC 校验码
        const crc = this.calculateCRC(header);
        header[126] = crc >> 8;
        header[127] = crc & 0xff;

        return header.buffer;
      },
      // 发送 YMODEM 文件数据
      sendYmodemData(fileBuffer) {
        const packetSize = 1024; // STX 数据包为 1024 字节
        let sequence = 1; // YMODEM 数据包的序列号从1开始
        let offset = 0;

        while (offset < fileBuffer.byteLength) {
          const packet = new Uint8Array(packetSize + 5); // STX + 序号 + 数据 + CRC
          packet[0] = 0x02; // STX 标识

          // 填充序号和反码
          packet[1] = sequence;
          packet[2] = 0xff - sequence;

          // 填充数据
          const chunk = fileBuffer.slice(offset, offset + packetSize);
          packet.set(new Uint8Array(chunk), 3);

          // 填充 CRC 校验码
          const crc = this.calculateCRC(packet.slice(3, packetSize + 3));
          packet[packetSize + 3] = crc >> 8;
          packet[packetSize + 4] = crc & 0xff;

          // 发送数据包
          this.sendCommand(packet.buffer, true);

          // 监听 ACK
          uni.onBLECharacteristicValueChange((res) => {
            const str = arrayBufferToString(res.value);
            if (str === 'C') {
              console.log(`第 ${sequence} 帧确认`);
              sequence++;
              offset += packetSize;
            }
          });
        }

        // 发送 EOT 结束符
        this.sendCommand(new Uint8Array([0x04]).buffer, true);
      },
      // 计算简单 CRC 校验（可替换为标准的 CRC16 计算）
      calculateCRC(data) {
        let crc = 0;
        for (let i = 0; i < data.length; i++) {
          crc ^= data[i];
        }
        return crc;
      }
    }
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
