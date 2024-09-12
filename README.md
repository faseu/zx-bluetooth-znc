# my-project

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```
### 蓝牙流程
```
初始化蓝牙接口（openBluetoothAdapter）。

初始化事件监听。
    监听蓝牙适配器状态（onBluetoothAdapterStateChange）。
    监听蓝牙发现事件（onBluetoothDeviceFound）。
    监听蓝牙连接状态事件（onBLEConnectionStateChange）。

搜索设备（startBluetoothDevicesDiscovery）。

查找设备并连接（connectBLEDevice）。

停止搜索设备（stopBluetoothDevicesDiscovery）。

遍历蓝牙外设服务和特征。
    获取服务（getBLEDeviceServices）。
    获取特征（getBLEDeviceCharacteristics）。

监听特征值变化事件通知（onBLECharacteristicValueChange）。

设置读特征通知模式（notifyBLECharacteristicValueChange）。

读写数据。
    向设备的特征值写数据（writeBLECharacteristicValue）。
    向设备的特征值读数据（readBLECharacteristicValue）。

断开连接（disconnectBLEDevice）。

关闭蓝牙适配器（closeBluetoothAdapter）。
```
### 错误码

| 错误码 | 错误信息                                       | 说明                                          |
| :----- | ---------------------------------------------- | --------------------------------------------- |
| 0      | ok                                             | 正常                                          |
| 10000  | not init                                       | 未初始化蓝牙适配器                            |
| 10001  | device not available                           | 当前蓝牙适配器不可用                          |
| 10002  | device not found                               | 没有找到指定设备                              |
| 10003  | connection failed                              | 连接失败                                      |
| 10004  | service not found                              | 没有找到指定服务                              |
| 10005  | characteristicId not found                     | 没有找到指定特征值                            |
| 10006  | no connection                                  | 当前连接已断开                                |
| 10007  | operation not available on this characteristic | 当前特征值不支持此操作                        |
| 10008  | system error                                   | 其余所有系统上报的异常                        |
| 10009  | BLE not available on this device               | Android 系统特有，系统版本低于 4.3 不支持 BLE |
| 10010  | descriptor not found                           | 没有找到指定描述符                            |
| 10011  | invalid deviceId                               | 设备 ID 不可用，或为空                        |
| 10012  | invalid serviceId                              | 服务 ID 不可用，或为空                        |
| 10013  | invalid characteristicId                       | 特征 ID 不可用，或为空                        |
| 10014  | invalid data                                   | 发送的数据为空或格式错误                      |
| 10015  | operation time out                             | 操作超时                                      |
| 10016  | parameters needed                              | 缺少参数                                      |
| 10017  | failed to write characteristic                 | 写入特征值失败                                |
| 10018  | failed to read characteristic                  | 读取特征值失败                                |


### 设备信息
```json
{
    "RSSI": -60,
    "advertisData": "",
    "advertisServiceUUIDs": [
        "0000AE30-0000-1000-8000-00805F9B34FB"
    ],
    "deviceId": "65FB5DAB-7404-9A0D-481D-449103B7B160",
    "name": "HLK-V50"
}
```

### 设备信息
```json
{
    "characteristics": [
        {
            "properties": {
                "indicate": false,
                "notify": false,
                "read": false,
                "write": true
            },
            "uuid": "0000AE01-0000-1000-8000-00805F9B34FB"
        },
        {
            "properties": {
                "indicate": false,
                "notify": true,
                "read": false,
                "write": false
            },
            "uuid": "0000AE02-0000-1000-8000-00805F9B34FB"
        },
        {
            "properties": {
                "indicate": true,
                "notify": false,
                "read": false,
                "write": false
            },
            "uuid": "0000FFF1-0000-1000-8000-00805F9B34FB"
        },
        {
            "properties": {
                "indicate": false,
                "notify": false,
                "read": false,
                "write": true
            },
            "uuid": "0000FFF2-0000-1000-8000-00805F9B34FB"
        }
    ],
    "errMsg": "getBLEDeviceCharacteristics:ok"
}
```