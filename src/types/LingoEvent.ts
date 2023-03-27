import { LingoDeviceInfo, MediaType, NetworkQuality } from "./base";
import { ILingoLocalTrack } from "./ILingoTrack";
import { RTCConnectionState } from "./LingoRTCEnums";

export interface LingoRTCEvent {
  /**
   * SDK 与服务器的连接状态发生改变回调
   */
  ConnectionStateChange: ConnectionStateChangeCallback;
  /**
   * SDK 监测到异常事件回调
   */
  Exception: ExceptionCallback;
  /**
   * 远端用户加入频道回调
   */
  UserJoined: UserCallback;
  /**
   * 远端用户离线回调
   */
  UserLeft: UserCallback;
  /**
   * 该回调通知远端用户发布了新的音频轨道或者视频轨道
   */
  UserPublished: UserPublishedCallback;
  /**
   * 该回调通知远端用户取消发布了音频或视频轨道
   */
  UserUnpublished: UserPublishedCallback;
  /**
   * 用户状态更新，用于 用户加入频道/离开频道/推流/取消推流 之外的其他事件导致用户状态变化的补充通知
   * 此事件为非必须的，一般情况可不用
   */
  UserUpdated: UserCallback;
  /**
   * 视频设备列表变化回调 新增 or 移除
   */
  CameraChanged: KindDeviceChangedCallback;
  /**
   * 音频输入设备列表变化回调 新增 or 移除
   */
  MicrophoneChanged: KindDeviceChangedCallback;
  /**
   * 音频播放设备列表变化回调 新增 or 移除
   */
  SpeakerDeviceChanged: KindDeviceChangedCallback;
  /**
   * 本端当前使用的设备变化
   */
  DeviceSwitched: DeviceSwitchedCallback;
  /**
   * 音频或视频轨道自动播放失败回调
   */
  AutoplayFailed: AutoplayFailedCallback;
  /**
   * 远端用户 开启/结束 屏幕共享
   * 当前各端约定屏幕共享的用户身份 uid = 1，且同一时间只存在一个屏幕共享
   */
  RemoteScreenSharing: RemoteScreenSharingCallback;
  /**
   * 本端屏幕共享结束
   */
  ScreenSharingEnded: () => void;
  /**
   * ILingoMicrophoneAudioTrack 或 ILingoCameraVideoTrack 创建成功后事件通知
   * 因为不止存在主动调用 create，还可能存在中途 localTrack 异常后重新创建 localTrack 的情况
   * 所以只要 ILingoMicrophoneAudioTrack 或 ILingoCameraVideoTrack 新建后就抛出此事件，业务侧会更新引用
   */
  LocalTrackCreated: LocalTrackCreatedCallback;
  /**
   * 虚拟背景过载事件
   * 业务侧收到此事件后会根据情况调整虚拟背景策略（可能会主动关闭虚拟背景）
   */
  VirtualBackgroundOverload: () => void;
  /**
   * 网络质量回调
   */
  NetworkQuality: NetworkQualityCallback;
}

export declare type ConnectionStateChangeCallback = (
  curState: RTCConnectionState, // 当前连接状态
  revState: RTCConnectionState, // 上一个连接状态
  reason: string // 变化原因，有则填，没有则空字符串即可
) => void;
export declare type ExceptionCallback = (
  code: number, // 异常代码（lingo暂时未做统一定义，后续有需求再处理，目前仅用于日志收集排障使用）
  msg: string, // 异常消息
  uid: string // 所属用户，非必须
) => void;
export declare type UserCallback = (uid: string) => void;
export declare type UserPublishedCallback = (
  uid: string,
  mediaType: MediaType
) => void;
export declare type KindDeviceChangedCallback = (
  isAdd: boolean, // 是插入还是拔出设备
  device: LingoDeviceInfo // 设备信息
) => void;
export declare type DeviceSwitchedCallback = (
  deviceInfo: LingoDeviceInfo // 设备信息
) => void;
export declare type AutoplayFailedCallback = () => void;
export declare type RemoteScreenSharingCallback = (
  uid: string,
  active: boolean, // 是开启还是关闭
  mediaType: MediaType
) => void;
export declare type LocalTrackCreatedCallback = (
  localTrack: ILingoLocalTrack // 新创建的 LingoMicrophoneAudioTrack 或 LingoCameraVideoTrack 实例
) => void;
export declare type NetworkQualityCallback = (stat: NetworkQuality) => void;
