# lingo-base-rtc

lingo 对外曝露的rtc服务接口定义，第三方可以使用 npm 引入此包作为依赖并实现此包中定义的 interface 后，即可集成到 lingo 的电子教室中提供音视频服务。

`npm install @lingoace/lingo-base-rtc`

## 第三方插件开发说明

1. 创建一个新的 npm 工程
2. 使用 npm 引入 @lingoace/lingo-base-rtc
3. 实现下方[表格](#表格)中列出的接口，并且对外曝露实现的 LingoRTC 类，例如：
```javascript
import { LingoBaseRTC, ILingoRTC } from "@lingoace/lingo-base-rtc";
export class LingoRTC extends LingoBaseRTC implements ILingoRTC {
  //...
}
```
4. 插件方自行测试
5. 提供打包后的 npm 包给 lingo 集成到业务端进行测试
6. lingo 电子教室发布带有插件方音视频服务sdk的版本上线

**最终完成的sdk插件建议上传到 npm 的 @lingoace 组织下，npm包命名规范：**

`@lingoace/lingo-{插件方标识}-rtc`

## 异常处理
插件方的API实现中，异常需要统一抛出 `LingoRTCError` （lingo-base-rtc包里已包含此类的定义，用法如下：）
```javascript
// 无音视频权限
throw new LingoRTCError(LingoRTCErrorCode.PermissionDenied, '异常信息');
// 设备不存在
throw new LingoRTCError(LingoRTCErrorCode.DeviceNotFound, '异常信息');
// 设备不可用
throw new LingoRTCError(LingoRTCErrorCode.NotReadable, '异常信息');
// 其他异常（LingoRTCErrorCode 枚举没有定义的暂时都抛此异常，目前业务侧会针对已定义的code做处理，未定义的暂未处理）
throw new LingoRTCError(LingoRTCErrorCode.Other, '异常信息');
```

## 目录说明

src/commom 目录下是公共代码，一些简单的方法已直接实现，插件方继承此目录下对应的类后可以少写部分代码，当然也可以在自己的实现类中重写方法实现，但是必须要使用 extends 继承对应的类，方便我方后续有简单需求可以直接增加方法而无需请插件方修改插件sdk

src/types 目录下是用到的所有的 TypeScript 类型定义

<a name="表格"></a>

#### 插件实现方需要实现以下接口

| 接口                        | 需要继承的基类          | 说明 |
| -------                     | -------              | ------- |
|  ILingoRTC                  | LingoBaseRTC         | 创建LingoRTCClient、LingoLocalTrack ，设备管理 |
|  ILingoRTCClient            | LingoBaseRTCClient   | 通信及事件管理       |
|  ILingoMicrophoneAudioTrack | LingoBaseTrack       | 本端麦克风       |
|  ILingoCameraVideoTrack     | LingoBaseTrack       | 本端摄像头       |
|  ILingoCustomVideoTrack     | LingoBaseTrack       | 本端视频自采集       |
|  ILingoRemoteAudioTrack     | LingoBaseTrack       | 远端音频       |
|  ILingoRemoteVideoTrack     | LingoBaseTrack       | 远端视频       |

#### Lingo类(接口)关系图
![](https://github.com/lixiaoliang-lingoace/lingo-base-rtc/blob/master/docs/relation.png)

## 自采集
自采集的核心是依赖摄像头采集的画面进行二次加工
#### 执行步骤说明
1. 创建摄像头采集（LingoRTC.createCameraVideoTrack）
2. 创建自采集（LingoRTC.createCustomVideoTrack）并 init
3. 调用customVideoTrack.play （play 其实就是创建了一个时钟绘制，定时将摄像头采集的画面绘制到一个 canvas 上，然后调用 play 方法传递的参数中的 onDraw 回调函数，交给业务侧进行canvas画面二次加工）
4. 推送customVideoTrack视频流（LingoRTCClient.publish）

## 事件
lingo-base-rtc包中的interface `LingoRTCEvent ` 定义了插件方需要抛出的事件，事件参数请看TypeScript的类型定义说明
```javascript
// 抛出事件实例
LingoRTCClient.emit('UserJoined', 'uid');
```


| 事件名                       | 说明                  |业务侧动作|
| -------                     | -------              | -------|
|  ConnectionStateChange      | 插件方SDK与服务器的连接状态发生改变回调 |更新本端用户的音视频在线状态|
|  Exception                  | 异常事件回调                        |日志收集上报|
|  UserJoined                 | 远端用户加入频道回调     				|更新音视频在线用户列表|
|  UserLeft                   | 远端用户离线回调        			|更新音视频在线用户列表|
|  UserPublished              | 远端用户发布了新的音频轨道或者视频轨道 |更新用户的发流状态并订阅|
|  UserUnpublished            | 远端用户取消发布了音频或视频轨道      |更新用户的发流状态|
|  CameraChanged              | 视频设备列表变化回调 新增 or 移除    |更新摄像头设备列表|
|  MicrophoneChanged          | 音频输入设备列表变化回调 新增 or 移除 |更新麦克风设备列表|
|  SpeakerDeviceChanged       | 音频播放设备列表变化回调 新增 or 移除 |更新扬声器设备列表|
|  DeviceSwitched             | 本端当前使用的设备变化              |更新正在使用的设备信息显示|
|  AutoplayFailed             | 音频或视频轨道自动播放失败回调        |弹窗引导用户进行交互点击|
|  RemoteScreenSharing        | 远端用户 开启/结束 屏幕共享，当前各端约定屏幕共享的用户身份 uid = 1，且同一时间只存在一个屏幕共享                                                          |开启时订阅屏幕共享媒体流并播放|
|  ScreenSharingEnded         | 本端屏幕共享结束                   |更新页面屏幕共享显示相关的UI|
|  LocalTrackCreated          | ILingoMicrophoneAudioTrack 或 ILingoCameraVideoTrack 创建成功后的事件通知，因为不止存在主动调用 create，还可能存在中途 localTrack 异常后重新创建 localTrack 的情况，所以只要 ILingoMicrophoneAudioTrack 或 ILingoCameraVideoTrack 新建后就抛出此事件                        |更新对摄像头或麦克风对象实例的引用|
|  VirtualBackgroundOverload  | 虚拟背景过载事件                   |业务侧收到此事件后会根据情况调整虚拟背景策略（可能会主动关闭虚拟背景）|
|  NetworkQuality             | 网络质量回调                       |日志收集上报|
