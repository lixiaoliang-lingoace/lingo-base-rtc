import { ILingoRemoteAudioTrack, ILingoRemoteVideoTrack } from "./ILingoTrack";

/**
 * 远端用户信息
 */
export interface ILingoRTCRemoteUser {
  /**
   * 用户身份标识
   */
  uid: string;
  /**
   * 已订阅的该用户的音频轨道
   */
  audioTrack?: ILingoRemoteAudioTrack;
  /**
   * 已订阅的该用户的视频轨道
   */
  videoTrack?: ILingoRemoteVideoTrack;
  /**
   * 远端用户是否正在发音频流
   */
  hasAudio: boolean;
  /**
   * 远端用户是否正在发视频流
   */
  hasVideo: boolean;
}
/**
 * 用户信息更新载体
 */
export interface LingoUserPropertiesPayload {
  uid: string;
  hasAudio?: boolean;
  hasVideo?: boolean;
}
