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
   * 远端用户或主播加入频道回调
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
   */
  UserUpdated: UserCallback;
  /**
   * 视频采集设备状态变化回调
   */
  CameraChanged: KindDeviceChangedCallback;
  /**
   * 音频采集设备状态变化回调
   */
  MicrophoneChanged: KindDeviceChangedCallback;
  /**
   * 音频播放设备状态变化回调
   */
  SpeakerDeviceChanged: KindDeviceChangedCallback;
  /**
   * 设备切换使用事件
   */
  DeciceSwitched: DeciceSwitchedCallback;
  /**
   * 音频或视频轨道自动播放失败回调
   */
  AutoplayFailed: AutoplayFailedCallback;
  /**
   * 远端用户 开启/结束 屏幕共享
   */
  RemoteScreenSharing: RemoteScreenSharingCallback;
  /**
   * 本端屏幕共享结束
   */
  ScreenSharingEnded: () => void;
  /**
   * localTrack 创建成功后事件通知（不止主动调用 API 的返回值，还存在中途 localTrack 异常后重新创建的通知）
   */
  LocalTrackCreated: LocalTrackCreatedCallback;
  /**
   * 虚拟背景过载事件
   */
  VirtualBackgroundOverload: () => void;
  /**
   * 网络质量回调
   */
  NetworkQuality: NetworkQualityCallback;
}
export declare type ConnectionStateChangeCallback = (
  curState: RTCConnectionState,
  revState: RTCConnectionState,
  reason: string
) => void;
export declare type ExceptionCallback = (
  code: number,
  msg: string,
  uid: string
) => void;
export declare type UserCallback = (uid: string) => void;
export declare type UserPublishedCallback = (
  uid: string,
  mediaType: MediaType
) => void;
export declare type KindDeviceChangedCallback = (
  isAdd: boolean,
  device: LingoDeviceInfo
) => void;
export declare type DeciceSwitchedCallback = (
  deviceInfo: LingoDeviceInfo
) => void;
export declare type AutoplayFailedCallback = () => void;
export declare type RemoteScreenSharingCallback = (
  uid: string,
  active: boolean,
  mediaType: MediaType
) => void;
export declare type LocalTrackCreatedCallback = (
  localTrack: ILingoLocalTrack
) => void;
export declare type NetworkQualityCallback = (stat: NetworkQuality) => void;
