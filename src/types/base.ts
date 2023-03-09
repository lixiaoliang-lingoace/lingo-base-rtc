/**
 * 媒体轨道类型
 */
export declare type MediaType = "audio" | "video";
/**
 * 设备信息
 */
export interface LingoDeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}
/**
 * RTC权限信息
 */
export interface RTCPermissions {
  /**
   * 是否有音频权限
   */
  audio?: boolean;
  /**
   * 是否有系统音频权限，当 audio = false 时，此字段区分是否是系统级别的无权限
   */
  audioBySystem?: boolean;
  /**
   * 是否有视频权限
   */
  video?: boolean;
  /**
   * 是否有系统视频权限，当 video = false 时，此字段区分是否是系统级别的无权限
   */
  videoBySystem?: boolean;
}
/**
 * 网络质量
 */
export interface NetworkQuality {
  /**
   * The uplink network quality.
   *
   * It is calculated based on the uplink transmission bitrate, uplink packet loss rate, RTT (round-trip time) and jitter.
   *
   * - 0: The quality is unknown.
   * - 1: The quality is excellent.
   * - 2: The quality is good, but the bitrate is less than optimal.
   * - 3: Users experience slightly impaired communication.
   * - 4: Users can communicate with each other, but not very smoothly.
   * - 5: The quality is so poor that users can barely communicate.
   * - 6: The network is disconnected and users cannot communicate.
   */
  uplinkNetworkQuality: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * The downlink network quality.
   *
   * It is calculated based on the uplink transmission bitrate, uplink packet loss rate, RTT (round-trip time) and jitter.
   *
   * - 0: The quality is unknown.
   * - 1: The quality is excellent.
   * - 2: The quality is good, but the bitrate is less than optimal.
   * - 3: Users experience slightly impaired communication.
   * - 4: Users can communicate with each other, but not very smoothly.
   * - 5: The quality is so poor that users can barely communicate.
   * - 6: The network is disconnected and users cannot communicate.
   */
  downlinkNetworkQuality: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}
