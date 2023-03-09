/**
 * RTC 频道连接状态
 */
export enum RTCConnectionState {
  /**
   * 连接断开。该状态表示用户处于以下任一阶段: 1. 尚未通过 join 加入频道。2.已经通过 leave 离开频道。3.被踢出频道或者连接失败等异常情况。
   */
  DISCONNECTED = "DISCONNECTED",
  /**
   * 正在连接中。当调用 join 时为此状态
   */
  CONNECTING = "CONNECTING",
  /**
   * 已连接。该状态表示用户已经加入频道，可以在频道内发布或订阅媒体流。
   */
  CONNECTED = "CONNECTED",
  /**
   * 正在重连中。因网络断开或切换而导致 SDK 与服务器的连接中断，SDK 会自动重连，此时连接状态变为 "RECONNECTING"。
   */
  RECONNECTING = "RECONNECTING",
  /**
   * 正在断开连接。在调用 leave 的时候为此状态。
   */
  DISCONNECTING = "DISCONNECTING",
}
