import { MediaType } from "./base";

/**
 * 视频渲染相关参数
 */
export interface LingoPlayOptions {
  /**
   * 视频渲染的元素
   */
  container: HTMLDivElement;
  /**
   * 自采集渲染相关参数
   */
  custom?: {
    onDraw: (canvasElement: HTMLCanvasElement, mirrored: boolean) => void;
  };
}
/**
 * 基础track
 */
export interface ILingoTrack {
  /**
   * The type of a media track:
   * - `"audio"`: Audio track.
   * - `"video"`: Video track.
   */
  trackMediaType: MediaType;
  /**
   * 当前播放状态
   */
  isPlaying: boolean;
  /**
   * Plays a media track on the webpage.
   */
  play(options?: LingoPlayOptions): Promise<void>;
  /**
   * Stops playing the media track.
   */
  stop(): Promise<void>;
}
/**
 * 基础本端track
 */
export interface ILingoLocalTrack extends ILingoTrack {
  /**
   * mute 状态
   */
  muted: boolean;
  /**
   * 是否已关闭本地轨道
   * 一旦本地轨道被关闭，就无法再次使用。如需再次使用本地轨道，需要重新创建
   */
  closed: boolean;
  /**
   * 事件监听
   */
  on(event: "track-ended", listener: (mediaType: MediaType) => void): void;
  /**
   * 发送或暂停发送该轨道的媒体数据。
   */
  setMuted(muted: boolean): Promise<void>;
  /**
   * 关闭本地轨道，并释放相关采集设备。
   * 一旦本地轨道被关闭，就无法再次使用。如需再次使用本地轨道，需要重新创建。
   */
  close(): void;
  /**
   * Gets an [MediaStreamTrack](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaStreamTrack) object.
   *
   * @return An [MediaStreamTrack](https://developer.mozilla.org/zh-CN/docs/Web/API/MediaStreamTrack) object.
   */
  getMediaStreamTrack(): MediaStreamTrack | null;
  /**
   * 获取本地轨道的来源描述（设备名称）
   */
  getTrackLabel(): string;
  /**
   * 获取当前轨道使用的设备id
   */
  getDeviceId(): string;
}
/**
 * 音频track(ILingoLocalAudioTrack 和 ILingoRemotaAudioTrack 公共定义)
 */
export interface ILingoAudioTrack {
  /**
   * 设置音量 (本地设置采集、远端设置播放)
   * @param volume 音量大小，0-100
   */
  setVolume(volume: number): void;
  /**
   * 获取音量
   *
   * @returns 音量大小，范围 [0, 100]
   */
  getVolume(): number;
  /**
   * 设置音频播放设备，比如扬声器
   *
   * 该方法只支持桌面端的 Chrome 浏览器，其他浏览器不生效
   */
  setSpeakerDevice(deviceId: string): Promise<void>;
}
/**
 * 视频track(ILingoLocalVideoTrack 和 ILingoRemotaVideoTrack 公共定义)
 */
export interface ILingoVideoTrack {
  /**
   * 镜像模式
   */
  mirrored: boolean;
  /**
   * 记录最近一次 play 的 element
   */
  lastPlayContainer: HTMLDivElement | null;
  /**
   * 镜像视频
   */
  mirrorVideo(mirror: boolean): void;
}
/**
 * 本端音频track
 */
export interface ILingoLocalAudioTrack
  extends ILingoLocalTrack,
    ILingoAudioTrack {}
/**
 * 本端麦克风track
 */
export interface ILingoMicrophoneAudioTrack extends ILingoLocalAudioTrack {
  /**
   * 切换设备
   * @param deviceId 设备id
   */
  setDevice(deviceId: string): Promise<void>;
}
/**
 * 本端视频track
 */
export interface ILingoLocalVideoTrack
  extends ILingoLocalTrack,
    ILingoVideoTrack {
  play(options: LingoPlayOptions): Promise<void>;
  /**
   * 应用虚拟背景
   * @param imageUrl 虚拟背景图片地址
   */
  applyVirtualBackground(imageUrl: string): Promise<boolean>;
  /**
   * 停止虚拟背景
   */
  stopVirtualBackground(): Promise<boolean>;
}
/**
 * 本端摄像头track
 */
export interface ILingoCameraVideoTrack extends ILingoLocalVideoTrack {
  /**
   * 切换设备
   * @param deviceId 设备id
   */
  setDevice(deviceId: string): Promise<void>;
}
/**
 * 本端视频自采集track
 */
export interface ILingoCustomVideoTrack extends ILingoLocalVideoTrack {
  /**
   * canvas 绘制帧率
   */
  frameRate: number;
  canvas: HTMLCanvasElement;
  /**
   * 自采集定时绘制停止任务函数
   */
  timerStop: () => void;
  /**
   * 初始化自采集，可以进行一些异步的准备工作
   */
  init(): Promise<void>;
}
export interface ILingoRemoteTrack extends ILingoTrack {
  /**
   * 该轨道所属的用户 uid
   */
  uid: string;
}
export interface ILingoRemoteAudioTrack
  extends ILingoRemoteTrack,
    ILingoAudioTrack {}
export interface ILingoRemoteVideoTrack
  extends ILingoRemoteTrack,
    ILingoVideoTrack {
  play(options: LingoPlayOptions): Promise<void>;
}
