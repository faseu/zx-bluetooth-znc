// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
let deviceId = '65FB5DAB-7404-9A0D-481D-449103B7B160';
// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
let serviceId = '0000FFF0-0000-1000-8000-00805F9B34FB';
// 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
let characteristicIdNotify = '0000AE02-0000-1000-8000-00805F9B34FB';
// 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
let characteristicIdRead = '0000FFF1-0000-1000-8000-00805F9B34FB';
// 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
let characteristicIdWrite = '0000AE01-0000-1000-8000-00805F9B34FB';

// 蓝牙连接
export const createBLEConnection = () => {
    let flag = false
    uni.openBluetoothAdapter({
        success: (res) => {
            //已打开
            uni.getBluetoothAdapterState({
                success: (res1) => {
                    console.log(res1, '“本机设备的蓝牙已打开”');
                    uni.createBLEConnection({
                        deviceId,
                        success: (res) => {
                            console.log(res);
                            uni.$showMsg('连接成功!');
                            flag = true
                        },
                        fail: (err) => {
                            uni.$showMsg('连接失败!');
                            console.log('createBLEConnection失败', err);
                            flag = false
                        }
                    });
                },
                fail(error) {
                    uni.$showMsg('请打开蓝牙!');
                    flag = false
                }
            });
        },
        fail: (err) => {
            //未打开
            // uni.removeStorageSync('connectedDevices', {});
            uni.$showMsg('请打开蓝牙!');
            flag = false
        }
    });
    return flag
};

// 启用notify监听变化
export const getReadBLECharacteristicValue = () => {
    console.log('启用notify监听变化');
    uni.notifyBLECharacteristicValueChange({
        state: true, // 启用 notify 功能
        deviceId,
        serviceId,
        characteristicId: characteristicIdNotify,
        success: (res) => {
            console.log(276, 'notifyBLECharacteristicValueChange success', res.errMsg);
            // 这里获取回调，读取成功就的值就会在这个地方接收到！！！
            uni.onBLECharacteristicValueChange((res) => {
                uni.$showMsg(`读：${res.value}`);
                uni.hideLoading();
            });
        },
        fail: (err) => {
            console.log(280, '启用notify失败', err);
        }
    });
};

/**
 * 读取数据
 * 返回实例
 * {  "characteristic": {
 *       "deviceId": "E5:66:9F:82:46:61",
 *           "serviceId": "xxx",
 *           "value": "xxx"
 *     },
 *     "errMsg": "readBLECharacteristicValue:ok",
 *   }
 */
export const readBLECharacteristicValue = (value) => {
    let buffer = writeValueString2ArrayBuffer(value);
    uni.readBLECharacteristicValue({
        deviceId,
        serviceId,
        characteristicId: characteristicIdRead,
        success(res) {
            console.log(JSON.stringify(res));
        },
        fail(res) {
            console.log(`readBLECharacteristicValue fail: ${JSON.stringify(res)}`);
        }
    });
};

// 写入数据
export const writeBLECharacteristicValue = (value) => {
    let buffer = writeValueString2ArrayBuffer(value);
    // todo
    console.log('-------写入数据', JSON.stringify(value));
    uni.writeBLECharacteristicValue({
        deviceId,
        serviceId,
        characteristicId: characteristicIdWrite,
        value: buffer, // 0xFF为示例值，请替换为真实场景的16进制数据
        success(res) {
            console.log(JSON.stringify(res));
        },
        fail(res) {
            console.log(`writeBLECharacteristicValue fail: ${JSON.stringify(res)}`);
        }
    });
};

/**
 * 写入数据的数据转换 String2ArrayBuffer
 * 'ff5504B10000B5' -> [0: 255  1: 85  2: 4  3: 177  4: 0  5: 0  6: 181]
 * @param value
 * export const writeValueString2ArrayBuffer = (value) => {
 *     if (!value) return;
 *     let buffer = new Uint8Array(
 *         value.match(/[\da-f]{2}/gi).map(function (h) {
 *             return parseInt(h, 16);
 *         })
 *     ).buffer;
 *     console.log(buffer)
 *     return buffer;
 * };
 */


/**
 * 写入数据的数据转换 String2ArrayBuffer
 * 'ff5504B10000B5' -> [0: 255  1: 85  2: 4  3: 177  4: 0  5: 0  6: 181]
 * @param value
 */
export const writeValueString2ArrayBuffer = (value) => {
    if (!value) return;
    let buffer = new Uint8Array(
        value.match(/[\da-f]{2}/gi).map(function (h) {
            return parseInt(h, 16);
        })
    ).buffer;
    let crc = crc8(buffer)
    console.log(crc)
    return buffer;
};

export const crc8 = (data) => {
    let crc = 0;
    for (let i = 0; i < data.length; i++) {
        crc ^= data[i];
        for (let j = 0; j < 8; j++) {
            if(crc & 0x80)
            {
                crc = (crc << 1) ^ 0x07;
            }
            else crc <<= 1;
        }
    }
    return crc
}
