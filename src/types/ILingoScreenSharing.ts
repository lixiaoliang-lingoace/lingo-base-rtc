export interface ILingoScreenSharing {
  /**
   * 开启屏幕共享
   */
  startShareScreen(): Promise<void>;
  /**
   * 关闭屏幕共享
   */
  stopShareScreen(): Promise<void>;
  /**
   * 播放屏幕共享
   * @param container 承载播放的 dom 容器
   */
  playShareScreenView(container: HTMLDivElement): Promise<void>;
  /**
   * 停止播放屏幕共享
   */
  stopShareScreenView(): Promise<void>;
}
