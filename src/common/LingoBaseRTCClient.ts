import EventEmitter from "events";
import { MediaType } from "../types/base";
import { ILingoRTCJoinParam } from "../types/ILingoRTCClient";
import {
  ILingoLocalTrack,
  ILingoRemoteAudioTrack,
  ILingoRemoteVideoTrack,
} from "../types/ILingoTrack";
import { LingoRTCEvent } from "../types/LingoEvent";
import { RTCConnectionState } from "../types/LingoRTCEnums";
import config from "./config";

export abstract class LingoBaseRTCClient {
  eventEmitter = new EventEmitter();
  uid = "";
  /**
   * 加入频道参数
   */
  joinParam: ILingoRTCJoinParam | undefined;
  /**
   * 当前的连接状态
   */
  connectionState = RTCConnectionState.DISCONNECTED;
  /**
   * 当前推送的轨道
   */
  localTracks: ILingoLocalTrack[] = [];
  /**
   * 记录每个用户的音频 track ，key = uid
   */
  remoteAudioTrackMap: Map<string, ILingoRemoteAudioTrack> = new Map();
  /**
   * 记录每个用户的视频 track ，key = uid
   */
  remoteVideoTrackMap: Map<string, ILingoRemoteVideoTrack> = new Map();
  /**
   * 判断是否是屏幕共享
   */
  protected isScreenSharing(uid: number | string) {
    return uid.toString() === config.screenSharingUid;
  }
  /**
   * 删除远端用户对应的 track（当远端用户取消发流/本端主动取消订阅，需要删除对应用户的 track）
   */
  protected deleteRemoteTrack(uid: string, mediaType: MediaType) {
    const key = uid;
    const map =
      mediaType === "audio"
        ? this.remoteAudioTrackMap
        : this.remoteVideoTrackMap;
    const track = map.get(key);
    if (track) {
      track.stop();
      map.delete(key);
    }
  }
  /**
   * 注册回调事件
   * @param event 事件名
   * @param callBack 回调函数
   */
  on<K extends keyof LingoRTCEvent>(event: K, callBack: LingoRTCEvent[K]) {
    this.eventEmitter.on(event, callBack);
  }
  once<K extends keyof LingoRTCEvent>(event: K, callBack: LingoRTCEvent[K]) {
    this.eventEmitter.once(event, callBack);
  }
  off<K extends keyof LingoRTCEvent>(event: K, callBack: LingoRTCEvent[K]) {
    this.eventEmitter.removeListener(event, callBack);
  }
  emit<K extends keyof LingoRTCEvent>(event: K, ...args: any[]) {
    this.eventEmitter.emit(event, ...args);
  }
}
