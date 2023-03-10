import { VideoProfile } from "./ILingoRTC";

export interface ILingoScreenSharing {
  /**
   * 开启屏幕共享
   */
  startScreenShare(config: VideoProfile): Promise<void>;
  /**
   * 关闭屏幕共享
   */
  stopScreenShare(): Promise<void>;
  /**
   * 播放远端屏幕共享
   * @param container 承载播放的 dom 容器
   */
  playScreenShareView(container: HTMLDivElement): Promise<void>;
  /**
   * 停止播放远端屏幕共享
   */
  stopScreenShareView(): Promise<void>;
}
