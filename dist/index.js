import EventEmitter from 'events';

const config = {
  isDev: false,
  // 本地用户的 uid（一些场景下，无法获取用户身份uid时，用 0 代替本人身份）
  localUid: "0",
  // 屏幕共享使用约定的固定 uid = 1
  screenSharingUid: "1",
  // 某些需要明确设置屏幕共享分辨率的
  screenSharingSize: {
    width: 1280,
    height: 720
  },
  // 摄像头采集默认宽高
  captureSize: {
    width: 320,
    height: 240
  }
};

class LingoBaseTrack {}

class LingoBaseRemoteTrack extends LingoBaseTrack {
  constructor(...args) {
    super(...args);
    /**
     * 该轨道所属的用户 userId
     * 一般是用户加入频道时才有值，所以本地用户可能会是空字符串
     */
    this.uid = "";
  }
}

/**
 * 统一不同 rtc sdk 的对外抛出的错误
 */
var LingoRTCErrorCode;
(function (LingoRTCErrorCode) {
  LingoRTCErrorCode["NotSupported"] = "NotSupported";
  LingoRTCErrorCode["PermissionDenied"] = "PermissionDenied";
  LingoRTCErrorCode["DeviceNotFound"] = "DeviceNotFound";
  LingoRTCErrorCode["NotReadable"] = "NotReadable";
  LingoRTCErrorCode["Other"] = "Other";
})(LingoRTCErrorCode || (LingoRTCErrorCode = {}));
class LingoRTCError extends Error {
  constructor(code, message) {
    super();
    this.name = LingoRTCError.name;
    this.code = code;
    this.message = message || "";
  }
  /**
   * 将普通 Error 对象转成 LingoRTCError
   * @param error Error
   * @returns LingoRTCError
   */
  static createRTCError(error) {
    const errorName = error.name;
    const message = error.message;
    if (errorName === "NotAllowedError") {
      return new LingoRTCError(LingoRTCErrorCode.PermissionDenied, message);
    } else if (errorName === "NotFoundError") {
      return new LingoRTCError(LingoRTCErrorCode.DeviceNotFound, message);
    } else if (["NotReadableError", "OverconstrainedError"].includes(errorName)) {
      return new LingoRTCError(LingoRTCErrorCode.NotReadable, message);
    }
    return new LingoRTCError(LingoRTCErrorCode.Other, message);
  }
  /**
   * 创建一个 LIngoRTCError.Other 的错误
   * @param message 错误消息
   * @returns LingoRTCError
   */
  static createOtherError(message) {
    return new LingoRTCError(LingoRTCErrorCode.Other, message);
  }
}

class LingoBaseRTC {
  constructor() {
    /**
     * LingoRTC SDK 版本信息
     */
    this.lingoVersion = "1.0.0";
    this.client = {};
    /**
     * 记录当前使用的扬声器设备id
     */
    this.activeSpeakerId = "";
    /**
     * 当前本端视频镜像状态
     * 使用全局管理模式，确保各处视频画面镜像状态一致，修改此值需要同步所有的 localVideoTrack
     */
    this.mirrored = false;
  }
  /**
   * 检查浏览器音视频权限
   * @param checkType 不传参数则音视频权限两个都检查
   */
  async checkPermissions(checkType) {
    const result = {};
    async function checkUserMedia(isVideo) {
      const constraints = isVideo ? {
        video: true
      } : {
        audio: true
      };
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        mediaStream.getTracks().forEach(track => {
          track.stop();
        });
        return 0;
      } catch (error) {
        if (error && error.name === "NotAllowedError") {
          const isBySystem = error.message.endsWith("by system");
          return isBySystem ? 1 : 2;
        }
        return 0;
      }
    }
    if (!checkType || checkType === "audio") {
      const audioResult = await checkUserMedia(false);
      if (audioResult === 0) {
        result.audio = true;
      } else {
        result.audio = false;
        result.audioBySystem = audioResult === 1;
      }
    }
    if (!checkType || checkType === "video") {
      const videoResult = await checkUserMedia(true);
      if (videoResult === 0) {
        result.video = true;
      } else {
        result.video = false;
        result.videoBySystem = videoResult === 1;
      }
    }
    return result;
  }
  /**
   * 获取设备列表
   */
  async getDevicesCore(skipPermissionCheck, checkType) {
    if (!skipPermissionCheck) {
      const result = await this.checkPermissions(checkType);
      if (result.audio === false || result.video === false) {
        const isBySystem = result.audioBySystem || result.videoBySystem;
        throw new LingoRTCError(LingoRTCErrorCode.PermissionDenied, "Permission denied" + (isBySystem ? ` by system` : ""));
      }
    }
    const list = await navigator.mediaDevices.enumerateDevices();
    // 过滤掉没有 deviceId 的数据，当没有权限时获取到的列表有数据，但是 deviceId = ""
    return list.filter(p => p.deviceId);
  }
  async getDevices(skipPermissionCheck) {
    return this.getDevicesCore(skipPermissionCheck);
  }
  async getCameras(skipPermissionCheck) {
    const list = await this.getDevicesCore(skipPermissionCheck, "video");
    return list.filter(p => p.kind === "videoinput");
  }
  async getMicrophones(skipPermissionCheck) {
    const list = await this.getDevicesCore(skipPermissionCheck, "audio");
    return list.filter(p => p.kind === "audioinput");
  }
  async getSpeakerDevices(skipPermissionCheck) {
    const list = await this.getDevicesCore(skipPermissionCheck, "audio");
    return list.filter(p => p.kind === "audiooutput");
  }
  async setMicrophoneDevice(microphoneId) {
    if (this.microphoneAudioTrack) {
      const currentDeviceId = this.microphoneAudioTrack.getDeviceId();
      if (currentDeviceId !== microphoneId) {
        await this.microphoneAudioTrack.setDevice(microphoneId);
        // 事件通知
        if (this.client) {
          const deviceInfo = {
            deviceId: microphoneId,
            label: this.microphoneAudioTrack.getTrackLabel(),
            kind: "audioinput"
          };
          this.client.emit("DeciceSwitched", deviceInfo);
        }
      }
    }
  }
  async setSpeakerDevice(speakerId) {
    const currentDeviceId = this.activeSpeakerId;
    if (currentDeviceId !== speakerId) {
      if (this.client) {
        const remoteUsers = this.client.getRemoteUsers();
        remoteUsers.forEach(user => {
          const audioTrack = user.audioTrack;
          if (audioTrack) {
            audioTrack.setSpeakerDevice(speakerId);
          }
        });
        this.activeSpeakerId = speakerId;
        // 事件通知
        const deviceInfo = await this.getActiveSpeaker();
        this.client.emit("DeciceSwitched", deviceInfo);
      }
    }
  }
  async setCameraDevice(cameraId) {
    let isSwitched = false;
    const jobs = [this.cameraVideoTrack, this.previewVideoTrack].map(item => {
      if (item && item.getDeviceId() !== cameraId) {
        isSwitched = true;
        return item.setDevice(cameraId);
      } else {
        return Promise.resolve();
      }
    });
    await Promise.allSettled(jobs);
    // 事件通知
    if (this.client && isSwitched) {
      const track = this.cameraVideoTrack || this.previewVideoTrack;
      const deviceInfo = {
        deviceId: cameraId,
        label: track ? track.getTrackLabel() : "",
        kind: "videoinput"
      };
      this.client.emit("DeciceSwitched", deviceInfo);
    }
  }
  getActiveMicrophone() {
    const result = {
      deviceId: "",
      label: "",
      kind: "audioinput"
    };
    if (this.microphoneAudioTrack) {
      result.deviceId = this.microphoneAudioTrack.getDeviceId() || "";
      result.label = this.microphoneAudioTrack.getTrackLabel();
    }
    return Promise.resolve(result);
  }
  /**
   * 获取正在使用的扬声器
   */
  async getActiveSpeaker() {
    const speakers = await this.getSpeakerDevices(true);
    const result = {
      deviceId: "default",
      label: "",
      kind: "audiooutput"
    };
    if (speakers.length > 0) {
      const activeItem = speakers.find(p => p.deviceId === this.activeSpeakerId) || speakers[0];
      result.deviceId = activeItem.deviceId;
      result.label = activeItem.label;
    }
    return result;
  }
  /**
   * 获取正在使用的摄像头
   */
  getActiveCamera() {
    const result = {
      deviceId: "",
      label: "",
      kind: "videoinput"
    };
    const list = [this.cameraVideoTrack, this.previewVideoTrack];
    for (const item of list) {
      if (item) {
        result.deviceId = item.getDeviceId() || "";
        result.label = item.getTrackLabel();
        break;
      }
    }
    return Promise.resolve(result);
  }
  /**
   * 释放音视频资源，使用同步调用的方式直接执行（立即执行），调用方不关心结果
   */
  release() {
    [this.microphoneAudioTrack, this.previewVideoTrack, this.cameraVideoTrack, this.customVideoTrack].forEach(item => {
      if (item) {
        item.stop();
        item.close();
      }
    });
    if (this.client) {
      this.client.leave();
      this.client.remoteAudioTrackMap.clear();
      this.client.remoteVideoTrackMap.clear();
    }
  }
  /**
   * 麦克风检测
   */
  async detectMicrophone(microphoneId) {
    // 因为麦克风是共用的，所以这里要判断是否应该创建
    if (!this.microphoneAudioTrack || this.microphoneAudioTrack.closed) {
      await this.createMicrophoneAudioTrack(microphoneId);
    }
    // 获取音量，提供给应用层调用
    const getVolumeLevel = () => {
      if (this.microphoneAudioTrack) {
        return this.microphoneAudioTrack.getVolume();
      }
      return 0;
    };
    // 检测音频是否活跃
    function checkIsActive() {
      // 连续的音量取样值
      const values = [];
      // 音量间隔取样
      function sampling(resolve) {
        setTimeout(() => {
          const volume = getVolumeLevel();
          values.push(volume);
          if (values.length < 10) {
            sampling(resolve);
          } else {
            resolve(values.some(p => p > 0));
          }
        }, 200);
      }
      return new Promise(resolve => {
        sampling(resolve);
      });
    }
    return {
      checkIsActive,
      getVolumeLevel,
      cleanup: () => {
        // 麦克风是共用的，这里不能清除
      }
    };
  }
  mirrorVideo(mirror) {
    this.mirrored = mirror;
    [(this.previewVideoTrack, this.cameraVideoTrack, this.customVideoTrack)].forEach(videoTrack => {
      if (videoTrack) {
        videoTrack.mirrorVideo(mirror);
      }
    });
  }
  /**
   * 检测当前本地音视频轨道的设备id是否可用，如果不可用则切换到其他的设备id
   */
  async checkAndSetDevice() {
    try {
      const devices = await this.getDevices(true);
      const checkList = [{
        kind: "audioinput",
        getDevice: this.getActiveMicrophone,
        setDevice: this.setMicrophoneDevice
      }, {
        kind: "videoinput",
        getDevice: this.getActiveCamera,
        setDevice: this.setCameraDevice
      }];
      const promiseList = checkList.map(item => {
        return new Promise(async function (resolve) {
          const kindList = devices.filter(p => p.kind === item.kind);
          const currentDevice = await item.getDevice();
          // 当前的设备id已不可用，重新指定一个
          if (kindList.length > 0 && !kindList.some(p => p.deviceId === currentDevice.deviceId)) {
            for (let i = 0; i < kindList.length; i++) {
              const deviceInfo = kindList[i];
              try {
                await item.setDevice(deviceInfo.deviceId);
                break;
              } catch (error) {
                console.error(error);
              }
            }
          }
          resolve(true);
        });
      });
      await Promise.allSettled(promiseList);
    } catch (error) {
      console.error("checkAndResumeDevice error:", error);
      throw LingoRTCError.createRTCError(error);
    }
  }
  async resumeLocalTracks() {
    var _this = this;
    const createMic = !this.microphoneAudioTrack || this.microphoneAudioTrack.closed;
    const createCam = !this.cameraVideoTrack || this.cameraVideoTrack.closed;
    const unpublish = async function unpublish(mediaType) {
      const localTrack = _this.client.localTracks.find(p => p.trackMediaType === mediaType);
      if (localTrack) {
        // 已经推流了的，要取消推流
        await _this.client.unpublish(localTrack);
        return true;
      }
      return false;
    };
    // 音视频是否已推流
    let audioPublished = false;
    let videoPublished = false;
    if (createMic) {
      audioPublished = await unpublish("audio");
    }
    if (createCam) {
      videoPublished = await unpublish("video");
    }
    // 之前已经推流了的，创建完成后，重新推流
    if (createMic) {
      try {
        const newLocalTrack = await this.createMicrophoneAudioTrack();
        if (audioPublished) {
          await this.client.publish(newLocalTrack);
        }
      } catch (error) {}
    }
    if (createCam) {
      try {
        const newLocalTrack = await this.createCameraVideoTrack({});
        if (videoPublished) {
          await this.client.publish(newLocalTrack);
        }
      } catch (error) {
        console.error("resumeLocalTracks error:", error);
        throw LingoRTCError.createRTCError(error);
      }
    }
  }
}

/**
 * RTC 频道连接状态
 */
var RTCConnectionState;
(function (RTCConnectionState) {
  /**
   * 连接断开。该状态表示用户处于以下任一阶段: 1. 尚未通过 join 加入频道。2.已经通过 leave 离开频道。3.被踢出频道或者连接失败等异常情况。
   */
  RTCConnectionState["DISCONNECTED"] = "DISCONNECTED";
  /**
   * 正在连接中。当调用 join 时为此状态
   */
  RTCConnectionState["CONNECTING"] = "CONNECTING";
  /**
   * 已连接。该状态表示用户已经加入频道，可以在频道内发布或订阅媒体流。
   */
  RTCConnectionState["CONNECTED"] = "CONNECTED";
  /**
   * 正在重连中。因网络断开或切换而导致 SDK 与服务器的连接中断，SDK 会自动重连，此时连接状态变为 "RECONNECTING"。
   */
  RTCConnectionState["RECONNECTING"] = "RECONNECTING";
  /**
   * 正在断开连接。在调用 leave 的时候为此状态。
   */
  RTCConnectionState["DISCONNECTING"] = "DISCONNECTING";
})(RTCConnectionState || (RTCConnectionState = {}));
/**
 * RTC 类型
 */
var RTCType;
(function (RTCType) {
  RTCType[RTCType["Zego"] = 0] = "Zego";
  RTCType[RTCType["Agora"] = 1] = "Agora";
  RTCType[RTCType["Zoom"] = 2] = "Zoom";
})(RTCType || (RTCType = {}));

class LingoBaseRTCClient {
  constructor() {
    this.eventEmitter = new EventEmitter();
    this.uid = "";
    /**
     * 当前的连接状态
     */
    this.connectionState = RTCConnectionState.DISCONNECTED;
    /**
     * 当前推送的轨道
     */
    this.localTracks = [];
    /**
     * 记录每个用户的音频 track ，key = uid
     */
    this.remoteAudioTrackMap = new Map();
    /**
     * 记录每个用户的视频 track ，key = uid
     */
    this.remoteVideoTrackMap = new Map();
  }
  /**
   * 判断是否是屏幕共享
   */
  isScreenSharing(uid) {
    return uid.toString() === config.screenSharingUid;
  }
  /**
   * 删除远端用户对应的 track（当远端用户取消发流/本端主动取消订阅，需要删除对应用户的 track）
   */
  deleteRemoteTrack(uid, mediaType) {
    const key = uid;
    const map = mediaType === "audio" ? this.remoteAudioTrackMap : this.remoteVideoTrackMap;
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
  on(event, callBack) {
    this.eventEmitter.on(event, callBack);
  }
  once(event, callBack) {
    this.eventEmitter.once(event, callBack);
  }
  off(event, callBack) {
    this.eventEmitter.removeListener(event, callBack);
  }
  emit(event, ...args) {
    this.eventEmitter.emit(event, ...args);
  }
}

/**
 * 公共的共享数据存储
 */
class LingoBaseStore {}

export { LingoBaseRTC, LingoBaseRTCClient, LingoBaseRemoteTrack, LingoBaseStore, LingoBaseTrack, LingoRTCError, RTCConnectionState, RTCType, config };
