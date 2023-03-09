import { MediaType } from "./base";
import { ILingoRTCRemoteUser } from "./ILingoRTCUser";
import { ILingoScreenSharing } from "./ILingoScreenSharing";
import {
  ILingoLocalTrack,
  ILingoRemoteAudioTrack,
  ILingoRemoteVideoTrack,
} from "./ILingoTrack";
import { LingoRTCEvent } from "./LingoEvent";
import { RTCConnectionState } from "./LingoRTCEnums";

export interface ILingoRTCClient extends ILingoScreenSharing {
  /**
   * 加入频道参数
   */
  joinParam: ILingoRTCJoinParam | undefined;
  /**
   * 当前的连接状态
   */
  connectionState: RTCConnectionState;
  /**
   * 当前推送的轨道
   */
  localTracks: ILingoLocalTrack[];
  /**
   * 记录每个用户的音频 track ，key = uid
   */
  remoteAudioTrackMap: Map<string, ILingoRemoteAudioTrack>;
  /**
   * 记录每个用户的视频 track ，key = uid
   */
  remoteVideoTrackMap: Map<string, ILingoRemoteVideoTrack>;
  /**
   * 频道中的其他用户信息
   */
  getRemoteUsers(): ILingoRTCRemoteUser[];
  /**
   * 加入频道
   * @param param 加入频道参数
   * @return 返回用户在第三方sdk里的唯一身份标识
   */
  join(param: ILingoRTCJoinParam): Promise<string>;
  /**
   * 离开频道
   */
  leave(): Promise<void>;
  /**
   * 开始通信，此方法在加入频道后、开始推流前调用。一般情况下可以直接返回 Promise.resolve()
   */
  start(): Promise<void>;
  /**
   * 发布本地音视频轨迹到频道中
   */
  publish(localTrack: ILingoLocalTrack): Promise<boolean>;
  /**
   * 取消发布本地音视频
   */
  unpublish(localTrack: ILingoLocalTrack): Promise<boolean>;
  /**
   * 订阅远端用户
   */
  subscribe(uid: string, mediaType: MediaType): Promise<boolean>;
  /**
   * 取消订阅远端用户
   */
  unsubscribe(uid: string, mediaType: MediaType): Promise<boolean>;
  /**
   * 获取音视频质量数据
   */
  getQOEStats(): QOEStats;
  /**
   * 注册回调事件
   * @param event 事件名
   * @param callBack 回调函数
   */
  on<K extends keyof LingoRTCEvent>(event: K, callBack: LingoRTCEvent[K]): void;
  once<K extends keyof LingoRTCEvent>(
    event: K,
    callBack: LingoRTCEvent[K]
  ): void;
  off<K extends keyof LingoRTCEvent>(
    event: K,
    callBack: LingoRTCEvent[K]
  ): void;
  emit<K extends keyof LingoRTCEvent>(event: K, ...args: any[]): void;
}

/**
 * 加入频道所需参数
 */
export interface ILingoRTCJoinParam {
  appId: string;
  token: string;
  roomId: string;
  uid: string;
  role: number;
}
/**
 * 质量数据
 */
export interface QOEStats {
  // 分辨率
  res: string;
  // 本端视频帧率（如14，表示每秒14帧画面）
  vfps: number;
  // 本端音频帧率
  afps: number;
  // 本端视频码率，单位kb/s（如1150kb/s, 每秒编码出1150kb视频数据)
  vra: number;
  // 音频码率，单位kb/s（如64kb/s, 每秒编码出64kb音频数据）
  ara: number;
  // 上行网络quality（设备到音视频边缘服务器质量评分）
  upQuality: number;
  // 下行网络quality（设备到音视频边缘服务器质量评分）
  downQuality: number;
  // 总卡顿时长
  totalCatonDuration: number;
  // 总通话时长
  totalCallDuration: number;
  // 卡顿率=总卡顿时长/总通话时长
  catonRate: number;
  // 本端接收远端的mos值 {uid: mos, ….} （只移动端）Map 类型
  mos: { [uid: string]: number };
  // 远端卡顿: 远端 {uid: 卡顿率, …} Map类型
  remoteFrozen: { [uid: string]: number };
  // 点到点的延迟：{uid: 延迟, …}
  pRtt: { [uid: string]: number };
  // 设备上行丢包丢包率 ，单位：% 0-100
  pktLostRate: number;
  // 音视频延迟 ，如93 单位：ms, 设备到 声网 Server 的往返延时（ms）
  rtt: number;
}
