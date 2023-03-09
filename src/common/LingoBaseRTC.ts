import { LingoDeviceInfo, MediaType, RTCPermissions } from "../types/base";
import {
  DetectMicrophoneResult,
  LingoCameraVideoTrackInitConfig,
} from "../types/ILingoRTC";
import { ILingoRTCClient } from "../types/ILingoRTCClient";
import {
  ILingoCameraVideoTrack,
  ILingoCustomVideoTrack,
  ILingoMicrophoneAudioTrack,
} from "../types/ILingoTrack";
import { LingoRTCError, LingoRTCErrorCode } from "./LingoRTCError";

export abstract class LingoBaseRTC {
  /**
   * LingoRTC SDK 版本信息
   */
  lingoVersion = "1.0.0";
  client: ILingoRTCClient = {} as any;
  /**
   * 本地音频，全局共享一个实例
   */
  microphoneAudioTrack: ILingoMicrophoneAudioTrack | undefined;
  /**
   * 设备检测专用本地视频
   * 为什么用两个实例？是因为同一个VideoTrack只能同一时间渲染到一个元素上，当前课中设备检测和上课视频画面会同时存在，所以使用两个VideoTrack
   */
  previewVideoTrack: ILingoCameraVideoTrack | undefined;
  /**
   * 本地视频，摄像头渲染
   */
  cameraVideoTrack: ILingoCameraVideoTrack | undefined;
  /**
   * 自定义视频
   */
  customVideoTrack: ILingoCustomVideoTrack | undefined;
  /**
   * 记录当前使用的扬声器设备id
   */
  activeSpeakerId = "";
  /**
   * 当前本端视频镜像状态
   * 使用全局管理模式，确保各处视频画面镜像状态一致，修改此值需要同步所有的 localVideoTrack
   */
  mirrored: boolean = false;
  /**
   * 创建本地麦克风轨道，由各家 sdk 具体实现
   */
  abstract createMicrophoneAudioTrack(
    microphoneId?: string
  ): Promise<ILingoMicrophoneAudioTrack>;
  /**
   * 创建本地摄像头轨道，由各家 sdk 具体实现
   */
  abstract createCameraVideoTrack(
    config: LingoCameraVideoTrackInitConfig
  ): Promise<ILingoCameraVideoTrack>;
  /**
   * 检查浏览器音视频权限
   * @param checkType 不传参数则音视频权限两个都检查
   */
  async checkPermissions(checkType?: MediaType): Promise<RTCPermissions> {
    const result: RTCPermissions = {};
    async function checkUserMedia(isVideo: boolean) {
      const constraints: MediaStreamConstraints = isVideo
        ? {
            video: true,
          }
        : {
            audio: true,
          };
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );
        mediaStream.getTracks().forEach((track) => {
          track.stop();
        });
        return 0;
      } catch (error: any) {
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
  private async getDevicesCore(
    skipPermissionCheck?: boolean,
    checkType?: MediaType
  ) {
    if (!skipPermissionCheck) {
      const result = await this.checkPermissions(checkType);
      if (result.audio === false || result.video === false) {
        const isBySystem = result.audioBySystem || result.videoBySystem;
        throw new LingoRTCError(
          LingoRTCErrorCode.PermissionDenied,
          "Permission denied" + (isBySystem ? ` by system` : "")
        );
      }
    }
    const list = await navigator.mediaDevices.enumerateDevices();
    // 过滤掉没有 deviceId 的数据，当没有权限时获取到的列表有数据，但是 deviceId = ""
    return list.filter((p) => p.deviceId);
  }
  async getDevices(skipPermissionCheck?: boolean): Promise<MediaDeviceInfo[]> {
    return this.getDevicesCore(skipPermissionCheck);
  }
  async getCameras(skipPermissionCheck?: boolean): Promise<MediaDeviceInfo[]> {
    const list = await this.getDevicesCore(skipPermissionCheck, "video");
    return list.filter((p) => p.kind === "videoinput");
  }
  async getMicrophones(
    skipPermissionCheck?: boolean
  ): Promise<MediaDeviceInfo[]> {
    const list = await this.getDevicesCore(skipPermissionCheck, "audio");
    return list.filter((p) => p.kind === "audioinput");
  }
  async getSpeakerDevices(
    skipPermissionCheck?: boolean
  ): Promise<MediaDeviceInfo[]> {
    const list = await this.getDevicesCore(skipPermissionCheck, "audio");
    return list.filter((p) => p.kind === "audiooutput");
  }
  async setMicrophoneDevice(microphoneId: string): Promise<void> {
    if (this.microphoneAudioTrack) {
      const currentDeviceId = this.microphoneAudioTrack.getDeviceId();
      if (currentDeviceId !== microphoneId) {
        await this.microphoneAudioTrack.setDevice(microphoneId);
        // 事件通知
        if (this.client) {
          const deviceInfo: LingoDeviceInfo = {
            deviceId: microphoneId,
            label: this.microphoneAudioTrack.getTrackLabel(),
            kind: "audioinput",
          };
          this.client.emit("DeciceSwitched", deviceInfo);
        }
      }
    }
  }
  async setSpeakerDevice(speakerId: string): Promise<void> {
    const currentDeviceId = this.activeSpeakerId;
    if (currentDeviceId !== speakerId) {
      if (this.client) {
        const remoteUsers = this.client.getRemoteUsers();
        remoteUsers.forEach((user) => {
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
  async setCameraDevice(cameraId: string): Promise<void> {
    let isSwitched = false;
    const jobs = [this.cameraVideoTrack, this.previewVideoTrack].map((item) => {
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
      const deviceInfo: LingoDeviceInfo = {
        deviceId: cameraId,
        label: track ? track.getTrackLabel() : "",
        kind: "videoinput",
      };
      this.client.emit("DeciceSwitched", deviceInfo);
    }
  }
  getActiveMicrophone(): Promise<LingoDeviceInfo> {
    const result: LingoDeviceInfo = {
      deviceId: "",
      label: "",
      kind: "audioinput",
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
  async getActiveSpeaker(): Promise<LingoDeviceInfo> {
    const speakers = await this.getSpeakerDevices(true);
    const result: LingoDeviceInfo = {
      deviceId: "default",
      label: "",
      kind: "audiooutput",
    };
    if (speakers.length > 0) {
      const activeItem =
        speakers.find((p) => p.deviceId === this.activeSpeakerId) ||
        speakers[0];
      result.deviceId = activeItem.deviceId;
      result.label = activeItem.label;
    }
    return result;
  }
  /**
   * 获取正在使用的摄像头
   */
  getActiveCamera(): Promise<LingoDeviceInfo> {
    const result: LingoDeviceInfo = {
      deviceId: "",
      label: "",
      kind: "videoinput",
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
    [
      this.microphoneAudioTrack,
      this.previewVideoTrack,
      this.cameraVideoTrack,
      this.customVideoTrack,
    ].forEach((item) => {
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
  async detectMicrophone(
    microphoneId?: string
  ): Promise<DetectMicrophoneResult> {
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
      const values: number[] = [];
      // 音量间隔取样
      function sampling(resolve: (value: boolean) => void) {
        setTimeout(() => {
          const volume = getVolumeLevel();
          values.push(volume);
          if (values.length < 10) {
            sampling(resolve);
          } else {
            resolve(values.some((p) => p > 0));
          }
        }, 200);
      }
      return new Promise((resolve: (value: boolean) => void) => {
        sampling(resolve);
      });
    }
    return {
      checkIsActive,
      getVolumeLevel,
      cleanup: () => {
        // 麦克风是共用的，这里不能清除
      },
    };
  }
  mirrorVideo(mirror: boolean) {
    this.mirrored = mirror;
    [
      (this.previewVideoTrack, this.cameraVideoTrack, this.customVideoTrack),
    ].forEach((videoTrack) => {
      if (videoTrack) {
        videoTrack.mirrorVideo(mirror);
      }
    });
  }
  /**
   * 检测当前本地音视频轨道的设备id是否可用，如果不可用则切换到其他的设备id
   */
  async checkAndSetDevice(): Promise<void> {
    try {
      const devices = await this.getDevices(true);
      const checkList = [
        {
          kind: "audioinput", // 麦克风检测
          getDevice: this.getActiveMicrophone,
          setDevice: this.setMicrophoneDevice,
        },
        {
          kind: "videoinput", // 摄像头检测
          getDevice: this.getActiveCamera,
          setDevice: this.setCameraDevice,
        },
      ];
      const promiseList = checkList.map((item) => {
        return new Promise(async (resolve) => {
          const kindList = devices.filter((p) => p.kind === item.kind);
          const currentDevice = await item.getDevice();
          // 当前的设备id已不可用，重新指定一个
          if (
            kindList.length > 0 &&
            !kindList.some((p) => p.deviceId === currentDevice.deviceId)
          ) {
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
      throw LingoRTCError.createRTCError(error as Error);
    }
  }
  async resumeLocalTracks(): Promise<void> {
    const createMic =
      !this.microphoneAudioTrack || this.microphoneAudioTrack.closed;
    const createCam = !this.cameraVideoTrack || this.cameraVideoTrack.closed;

    const unpublish = async (mediaType: MediaType) => {
      const localTrack = this.client.localTracks.find(
        (p) => p.trackMediaType === mediaType
      );
      if (localTrack) {
        // 已经推流了的，要取消推流
        await this.client.unpublish(localTrack);
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
        throw LingoRTCError.createRTCError(error as Error);
      }
    }
  }
}
