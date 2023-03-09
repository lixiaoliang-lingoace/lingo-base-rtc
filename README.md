# lingo-base-rtc
---

lingo 对外曝露的rtc服务接口定义，第三方可以使用 npm 引入此包作为依赖并实现此包中定义的 interface 后，即可集成到 lingo 的电子教室中提供音视频服务。

`npm install @lingoace/lingo-base-rtc --save`

---

## 第三方插件开发说明
---

1. 创建一个新的工程
2. 使用 npm 引入 @lingoace/lingo-base-rtc
3. 实现下方[表格](#表格)中列出的接口，并且对外曝露实现的 LingoRTC 类，例如：
```javascript
export class LingoRTC extends LingoBaseRTC implements ILingoRTC {
  //...
}
```
4. 插件方自行测试（后续 lingo 提供测试 demo）
5. 提供打包后的 npm 包给 lingo 集成到业务端进行测试
6. lingo 电子教室发布带有插件方音视频服务sdk的版本上线

**最终完成的sdk插件建议上传到 npm 的 @lingoace 组织下，npm包命名规范：**

`@lingoace/lingo-{插件方标识}-rtc`

---

## 目录说明

src/commom 目录下是公共代码，一些简单的方法已直接实现，插件方继承此目录下的对应的类后可以少写部分代码，当然也可以在自己的实现类中重写方法实现，但是必须要使用 extends 继承对应的类，方便我方后续有简单需求可以直接增加方法而无需请插件方修改插件sdk

src/types 目录下是用到的所有的 typescript 类型定义

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
