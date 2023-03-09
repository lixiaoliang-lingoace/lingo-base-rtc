import { LingoDeviceInfo, MediaType, RTCPermissions } from "./base";
import { ILingoRTCClient } from "./ILingoRTCClient";
import {
  ILingoCameraVideoTrack,
  ILingoCustomVideoTrack,
  ILingoMicrophoneAudioTrack,
} from "./ILingoTrack";

export interface ILingoRTC {
  /**
   * LingoRTC SDK 版本信息
   */
  lingoVersion: string;
  /**
   * 第三方音视频服务商 sdk 版本信息
   */
  version: string;
  /**
   * 设备检测专用本地视频轨道
   * 为什么和摄像头渲染不共用而是两个实例？是因为同一个VideoTrack只能同一时间渲染到一个元素上，当前课中设备检测和上课视频画面会同时存在，所以使用两个VideoTrack
   */
  previewVideoTrack: ILingoCameraVideoTrack | undefined;
  /**
   * 初始化，init 应该在其他方法之前调用
   */
  init(param: LingoAceRTCInitParam): Promise<void>;
  /**
   * 本地资源释放，一旦释放之后，后续 rtc 功能无法再使用
   */
  release(): void;
  /**
   * 检查 SDK 对正在使用的浏览器的适配情况（至少需要支持音视频互通、屏幕共享功能；实现方可自行定义当前环境是否可用）
   * 该方法必须在创建客户端对象 {@link createClient} 之前调用
   * @returns
   * - `true`: 支持
   * - `false`: 不支持
   */
  checkSystemRequirements(): Promise<boolean>;
  /**
   * 检查浏览器音视频权限
   * @param checkType 不传参数则音视频权限两个都检查
   */
  checkPermissions(checkType?: MediaType): Promise<RTCPermissions>;
  /**
   * 创建一个客户端对象用于通话/直播管理
   */
  createClient(): Promise<ILingoRTCClient>;
  /**
   * 创建本地音频轨道
   * @param microphoneId 麦克风id
   */
  createMicrophoneAudioTrack(
    microphoneId?: string
  ): Promise<ILingoMicrophoneAudioTrack>;
  /**
   * 创建本地视频轨道
   */
  createCameraVideoTrack(
    config: LingoCameraVideoTrackInitConfig
  ): Promise<ILingoCameraVideoTrack>;
  /**
   * 创建自定义视频轨道
   * 自定义视频轨道就是在摄像头采集的画面上做二次加工，所以参数传递 摄像头轨道
   */
  createCustomVideoTrack(
    cameraVideoTrack: ILingoCameraVideoTrack
  ): Promise<ILingoCustomVideoTrack>;
  /**
   * 获取设备列表
   * @param skipPermissionCheck 是否跳过权限检查
   */
  getDevices(skipPermissionCheck?: boolean): Promise<MediaDeviceInfo[]>;
  /**
   * 获取摄像头列表
   */
  getCameras(skipPermissionCheck?: boolean): Promise<MediaDeviceInfo[]>;
  /**
   * 获取麦克风列表
   */
  getMicrophones(skipPermissionCheck?: boolean): Promise<MediaDeviceInfo[]>;
  /**
   * 获取音频播放设备列表
   */
  getSpeakerDevices(skipPermissionCheck?: boolean): Promise<MediaDeviceInfo[]>;
  /**
   * 设置当前所有麦克风实例的设备id
   */
  setMicrophoneDevice(microphoneId: string): Promise<void>;
  /**
   * 设置当前所有摄像头实例的设备id
   */
  setCameraDevice(cameraId: string): Promise<void>;
  /**
   * 设置当前所有扬声器实例的设备id
   */
  setSpeakerDevice(speakerId: string): Promise<void>;
  /**
   * 检测麦克风
   */
  detectMicrophone(microphoneId?: string): Promise<DetectMicrophoneResult>;
  /**
   * 检测摄像头
   */
  detectCamera(param: DetectCameraParam): Promise<DetectCameraResult>;
  /**
   * 镜像所有本地视频
   */
  mirrorVideo(mirror: boolean): void;
  /**
   * 获取正在使用的麦克风
   */
  getActiveMicrophone(): Promise<LingoDeviceInfo>;
  /**
   * 获取正在使用的扬声器
   */
  getActiveSpeaker(): Promise<LingoDeviceInfo>;
  /**
   * 获取正在使用的摄像头
   */
  getActiveCamera(): Promise<LingoDeviceInfo>;
  /**
   * 检测当前本地音视频轨道的设备id是否可用，如果不可用则切换到其他的设备id
   */
  checkAndSetDevice(): Promise<void>;
  /**
   * 修复本地音视频（重新创建、重新推流）
   */
  resumeLocalTracks(): Promise<void>;
  /**
   * 对本地播放的音频启用回声消除
   * @param element 需要进行回声消除的媒体元素
   */
  processExternalMediaAEC(element: HTMLMediaElement): void;
}
/**
 * RTC 初始化参数
 */
export interface LingoAceRTCInitParam {
  appId: string;
  /**
   * zego 初始化所需参数
   */
  zego?: {
    server: string;
  };
}
/**
 * 创建摄像头视频轨道的配置对象
 */
export interface LingoCameraVideoTrackInitConfig {
  /**
   * 指定摄像头的设备 ID
   */
  cameraId?: string;
}
/**
 * 设备检测结果
 */
export interface DetectDeviceResult {
  /**
   * sdk 检测是否活跃
   */
  checkIsActive: () => Promise<boolean>;
  /**
   * 清除函数
   */
  cleanup: () => void;
}
/**
 * 麦克风检测结果
 */
export interface DetectMicrophoneResult extends DetectDeviceResult {
  /**
   * 调用此方法获取实时音量 [0,100]
   */
  getVolumeLevel: () => number;
}
/**
 * 摄像头检测结果
 */
export interface DetectCameraResult extends DetectDeviceResult {}

export interface DetectCameraParam {
  /**
   * 视频渲染元素
   */
  container: HTMLDivElement;
  /**
   * 指定设备id
   */
  cameraId?: string;
  /**
   * 设置是否开启镜像模式
   */
  mirror?: boolean;
}
