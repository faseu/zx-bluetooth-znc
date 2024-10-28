<template>
  <view class="content">
    <template v-if="steps === 1">
      <image class="upgrade-img" src="../../static/mine/upgrade-bg.png" alt="" />
      <view class="upgrade-title">新版本升级</view>
      <view class="upgrade-desc">全新改版升级更时尚</view>
      <view class="upgrade-btn" @click="handleUpgrade()">立即升级</view>
    </template>
    <template v-if="steps === 2">
      <image class="upgrade-circle-img" src="../../static/mine/upgrade-bg-circle.png" alt="" />
      <view class="upgrade-title">{{ `升级中...(${percentage}%)` }}</view>
      <view class="upgrade-desc">请勿断开蓝牙或退出</view>
    </template>
    <template v-if="steps === 3">
      <image class="upgrade-img" src="../../static/mine/upgrade-bg.png" alt="" />
      <view class="upgrade-title">升级成功！</view>
      <view class="upgrade-desc">全新改版升级更时尚</view>
      <view class="upgrade-btn" @click="handleBack()">退 出</view>
    </template>
    <!--    <view class="log">-->
    <!--      {{ this.log }}-->
    <!--    </view>-->
  </view>
</template>

<script>
  import { awaitWrapper, getBluetoothAdapterState, writeBLECharacteristicValue } from '../../utils/bluetooth';
  import { arrayBufferToHex, arrayBufferToString, string2HexArray } from '../../utils/common';
  // 获取全局的文件管理器
  const fileSystemManager = uni.getFileSystemManager();
  export default {
    name: 'minePage',
    data() {
      return {
        arrayBuffer: undefined,
        state: -1,
        log: '',
        sequence: 1, // YMODEM 数据包的序列号从1开始
        offset: 0,
        steps: 1,
        percentage: 0,
        fileUrl: ''
      };
    },
    async onLoad(options) {
      if (options.params) {
        await awaitWrapper(getBluetoothAdapterState());
        this.onBLECharacteristicValueChange();
        const parsedParams = JSON.parse(decodeURIComponent(options.params));
        console.log('---------------', parsedParams);
        this.fileUrl = parsedParams.fileUrl;
        await this.downloadFile();
        if (parsedParams.immediately) {
          this.handleUpgrade();
        }
      }
    },
    methods: {
      async downloadFile() {
        uni.downloadFile({
          url: this.fileUrl, // 网络文件URL
          success: (res) => {
            if (res.statusCode === 200) {
              console.log('文件下载成功', res.tempFilePath);
              // 读取下载的文件
              this.readFileAsArrayBuffer(res.tempFilePath);
            }
          },
          fail: (err) => {
            console.error('文件下载失败', err);
          }
        });
      },

      handleUpgrade() {
        this.state = 0;
        this.steps = 2;
        this.sendCommand('<CMD00:000:999>\r\n');
      },

      handleBack() {
        uni.navigateBack({
          delta: 1
        });
      },

      sendCommand(value, isHexArray) {
        console.log(value);
        const { write } = uni.getStorageSync('MS');
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
            // this.sendYmodemData(this.arrayBuffer);
            // this.startYmodemTransfer();
          },
          fail: (err) => {
            console.error('读取文件失败', err);
          }
        });
      },
      // 监听单片机返回的数据
      onBLECharacteristicValueChange() {
        uni.onBLECharacteristicValueChange((res) => {
          let str = arrayBufferToString(res.value);
          console.log(`收到：${str}`);
          // uni.$showMsg('收到:' + str);
          // this.log = this.log + `收到:${str}(${arrayBufferToHex(res.value)})`;
          // console.log('收到蓝牙设备数据:', str);
          if (str.substring(0, 15) === '<CMD01:000:999>') {
            console.log('准备进入boot引导模式');
            this.startYmodemTransfer();
          }
          if (str === 'C' && this.state === 0) {
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
        const buffer = this.createYmodemHeader(filename, fileSize);
        let offset = 0;
        const size = 128;
        while (offset < buffer.byteLength) {
          let tempPacket;
          if (buffer.byteLength - size > offset) {
            tempPacket = new Uint8Array(size);
          } else {
            tempPacket = new Uint8Array(buffer.byteLength - offset);
          }
          const tempChunk = buffer.slice(offset, offset + size);
          tempPacket.set(new Uint8Array(tempChunk));
          offset += size;
          // 发送数据包
          this.sendCommand(tempPacket.buffer, true);
        }

        // // 监听 MCU 回复 ACK 然后发送文件数据
        uni.onBLECharacteristicValueChange((res) => {
          const str = arrayBufferToString(res.value);
          console.log(`收到：${str}`);
          // uni.$showMsg('收到:' + str);
          // this.log = this.log + `收到:${str}(${arrayBufferToHex(res.value)})`;
          if ((arrayBufferToHex(res.value) === '06 43' || arrayBufferToHex(res.value) === '43 06' || arrayBufferToHex(res.value) === '06') && this.state === 0) {
            console.log('收到ACK, 开始发送文件数据...');
            this.state = 1;
          }
          if (str === 'C' && this.state === 1) {
            this.state = 2;
            // 发送 YMODEM 文件数据
            this.sendYmodemData(fileBuffer);
          }
        });
      },
      // 创建 YMODEM 文件头
      createYmodemHeader(filename, fileSize) {
        const header = new Uint8Array(1029); // YMODEM 文件头固定128字节
        header[0] = 0x02; // SOH 标识
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
        const crc = this.calcCRC16(header.slice(3, 1027));
        header[1027] = crc & 0xff;
        header[1028] = crc >> 8;

        return header.buffer;
      },
      // 发送 YMODEM 文件数据
      sendYmodemData(fileBuffer) {
        const packetSize = 1024; // STX 数据包为 1024 字节
        const packet = new Uint8Array(packetSize + 5); // STX + 序号 + 数据 + CRC
        packet[0] = 0x02; // STX 标识

        // 填充序号和反码
        packet[1] = this.sequence;
        packet[2] = 0xff - this.sequence;

        // 填充数据
        const chunk = fileBuffer.slice(this.offset, this.offset + packetSize);
        packet.set(new Uint8Array(chunk), 3);

        // 填充 CRC 校验码
        const crc = this.calcCRC16(packet.slice(3, packetSize + 3));
        console.log(crc);
        packet[packetSize + 3] = crc & 0xff;
        packet[packetSize + 4] = crc >> 8;
        console.log(packet.buffer);
        const buffer = packet.buffer;
        let offset = 0;
        const size = 128;
        while (offset < buffer.byteLength) {
          let tempPacket;
          if (buffer.byteLength - size > offset) {
            tempPacket = new Uint8Array(size);
          } else {
            tempPacket = new Uint8Array(buffer.byteLength - offset);
          }
          const tempChunk = buffer.slice(offset, offset + size);
          tempPacket.set(new Uint8Array(tempChunk));
          offset += size;
          // 发送数据包
          this.sendCommand(tempPacket.buffer, true);
        }

        // 监听 ACK
        uni.onBLECharacteristicValueChange((res) => {
          // const str = arrayBufferToString(res.value);
          // uni.$showMsg('收到:' + str);
          // this.log = this.log + `收到:${str}(${arrayBufferToHex(res.value)})`;
          if ((arrayBufferToHex(res.value) === '06 43' || arrayBufferToHex(res.value) === '43 06' || arrayBufferToHex(res.value) === '06') && this.state === 2) {
            console.log(`第 ${this.sequence} 帧确认`);
            this.sequence = this.sequence + 1;
            this.offset += packetSize;
            if (this.offset < fileBuffer.byteLength) {
              console.log(this.offset, fileBuffer.byteLength, (this.offset / fileBuffer.byteLength) * 100, ((this.offset / fileBuffer.byteLength) * 100).toFixed(0));
              const temp = ((this.offset / fileBuffer.byteLength) * 100).toFixed(0);
              this.percentage = temp > 100 ? 100 : temp;
              this.sendYmodemData(fileBuffer);
            } else {
              this.sendCommand(new Uint8Array([0x04]).buffer, true);
              this.state = 3;
              this.steps = 3;
            }
          }
        });

        // 发送 EOT 结束符
      },
      // 标准的 CRC16 计算 (CCITT)
      updateCRC16(crcIn, byte) {
        let crc = crcIn;
        let inVal = byte | 0x100;

        do {
          crc <<= 1;
          inVal <<= 1;

          if (inVal & 0x100) {
            crc++;
          }

          if (crc & 0x10000) {
            crc ^= 0x1021;
          }
        } while (!(inVal & 0x10000));

        return crc & 0xffff; // Ensure result is 16-bit
      },
      calcCRC16(data) {
        let crc = 0;

        // Iterate over each byte in the data
        for (let i = 0; i < data.length; i++) {
          crc = this.updateCRC16(crc, data[i]);
        }

        // Append two zero bytes as part of CRC calculation
        crc = this.updateCRC16(crc, 0);
        crc = this.updateCRC16(crc, 0);
        console.log(crc & 0xffff);
        return crc & 0xffff; // Ensure result is 16-bit
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

    .log {
      width: 100%;
    }
  }
</style>
