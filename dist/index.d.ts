/**
 * 媒体轨道类型
 */
declare type MediaType = "audio" | "video";
/**
 * 设备信息
 */
interface LingoDeviceInfo {
    deviceId: string;
    label: string;
    kind: MediaDeviceKind;
}
/**
 * RTC权限信息
 */
interface RTCPermissions {
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
interface NetworkQuality {
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

/**
 * 视频渲染相关参数
 */
interface LingoPlayOptions {
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
interface ILingoTrack {
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
interface ILingoLocalTrack extends ILingoTrack {
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
interface ILingoAudioTrack {
    /**
     * 设置音量
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
interface ILingoVideoTrack {
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
interface ILingoLocalAudioTrack extends ILingoLocalTrack, ILingoAudioTrack {
}
/**
 * 本端麦克风track
 */
interface ILingoMicrophoneAudioTrack extends ILingoLocalAudioTrack {
    /**
     * 切换设备
     * @param deviceId 设备id
     */
    setDevice(deviceId: string): Promise<void>;
}
/**
 * 本端视频track
 */
interface ILingoLocalVideoTrack extends ILingoLocalTrack, ILingoVideoTrack {
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
interface ILingoCameraVideoTrack extends ILingoLocalVideoTrack {
    /**
     * 切换设备
     * @param deviceId 设备id
     */
    setDevice(deviceId: string): Promise<void>;
}
/**
 * 本端视频自采集track
 */
interface ILingoCustomVideoTrack extends ILingoLocalVideoTrack {
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
interface ILingoRemoteTrack extends ILingoTrack {
    /**
     * 该轨道所属的用户 uid
     */
    uid: string;
}
interface ILingoRemoteAudioTrack extends ILingoRemoteTrack, ILingoAudioTrack {
}
interface ILingoRemoteVideoTrack extends ILingoRemoteTrack, ILingoVideoTrack {
    play(options: LingoPlayOptions): Promise<void>;
}

/**
 * 远端用户信息
 */
interface ILingoRTCRemoteUser {
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
interface LingoUserPropertiesPayload {
    uid: string;
    hasAudio?: boolean;
    hasVideo?: boolean;
}

interface ILingoScreenSharing {
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

/**
 * RTC 频道连接状态
 */
declare enum RTCConnectionState {
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
    DISCONNECTING = "DISCONNECTING"
}
/**
 * RTC 类型
 */
declare enum RTCType {
    Zego = 0,
    Agora = 1,
    Zoom = 2
}

interface LingoRTCEvent {
    /**
     * SDK 与服务器的连接状态发生改变回调
     */
    ConnectionStateChange: ConnectionStateChangeCallback;
    /**
     * SDK 监测到异常事件回调
     */
    Exception: ExceptionCallback;
    /**
     * 远端用户或主播加入频道回调
     */
    UserJoined: UserCallback;
    /**
     * 远端用户离线回调
     */
    UserLeft: UserCallback;
    /**
     * 该回调通知远端用户发布了新的音频轨道或者视频轨道
     */
    UserPublished: UserPublishedCallback;
    /**
     * 该回调通知远端用户取消发布了音频或视频轨道
     */
    UserUnpublished: UserPublishedCallback;
    /**
     * 用户状态更新，用于 用户加入频道/离开频道/推流/取消推流 之外的其他事件导致用户状态变化的补充通知
     */
    UserUpdated: UserCallback;
    /**
     * 视频采集设备状态变化回调
     */
    CameraChanged: KindDeviceChangedCallback;
    /**
     * 音频采集设备状态变化回调
     */
    MicrophoneChanged: KindDeviceChangedCallback;
    /**
     * 音频播放设备状态变化回调
     */
    SpeakerDeviceChanged: KindDeviceChangedCallback;
    /**
     * 设备切换使用事件
     */
    DeciceSwitched: DeciceSwitchedCallback;
    /**
     * 音频或视频轨道自动播放失败回调
     */
    AutoplayFailed: AutoplayFailedCallback;
    /**
     * 远端用户 开启/结束 屏幕共享
     */
    RemoteScreenSharing: RemoteScreenSharingCallback;
    /**
     * 本端屏幕共享结束
     */
    ScreenSharingEnded: () => void;
    /**
     * localTrack 创建成功后事件通知（不止主动调用 API 的返回值，还存在中途 localTrack 异常后重新创建的通知）
     */
    LocalTrackCreated: LocalTrackCreatedCallback;
    /**
     * 虚拟背景过载事件
     */
    VirtualBackgroundOverload: () => void;
    /**
     * 网络质量回调
     */
    NetworkQuality: NetworkQualityCallback;
}
declare type ConnectionStateChangeCallback = (curState: RTCConnectionState, revState: RTCConnectionState, reason: string) => void;
declare type ExceptionCallback = (code: number, msg: string, uid: string) => void;
declare type UserCallback = (uid: string) => void;
declare type UserPublishedCallback = (uid: string, mediaType: MediaType) => void;
declare type KindDeviceChangedCallback = (isAdd: boolean, device: LingoDeviceInfo) => void;
declare type DeciceSwitchedCallback = (deviceInfo: LingoDeviceInfo) => void;
declare type AutoplayFailedCallback = () => void;
declare type RemoteScreenSharingCallback = (uid: string, active: boolean, mediaType: MediaType) => void;
declare type LocalTrackCreatedCallback = (localTrack: ILingoLocalTrack) => void;
declare type NetworkQualityCallback = (stat: NetworkQuality) => void;

interface ILingoRTCClient extends ILingoScreenSharing {
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
    once<K extends keyof LingoRTCEvent>(event: K, callBack: LingoRTCEvent[K]): void;
    off<K extends keyof LingoRTCEvent>(event: K, callBack: LingoRTCEvent[K]): void;
    emit<K extends keyof LingoRTCEvent>(event: K, ...args: any[]): void;
}
/**
 * 加入频道所需参数
 */
interface ILingoRTCJoinParam {
    appId: string;
    token: string;
    roomId: string;
    uid: string;
    role: number;
}
/**
 * 质量数据
 */
interface QOEStats {
    res: string;
    vfps: number;
    afps: number;
    vra: number;
    ara: number;
    upQuality: number;
    downQuality: number;
    totalCatonDuration: number;
    totalCallDuration: number;
    catonRate: number;
    mos: {
        [uid: string]: number;
    };
    remoteFrozen: {
        [uid: string]: number;
    };
    pRtt: {
        [uid: string]: number;
    };
    pktLostRate: number;
    rtt: number;
}

interface ILingoRTC {
    /**
     * LingoRTC SDK 版本信息
     */
    lingoVersion: string;
    /**
     * 第三方音视频服务商 sdk 版本信息
     */
    version: string;
    /**
     * 设备检测专用本地视频轨道
     * 为什么和摄像头渲染不共用而是两个实例？是因为同一个VideoTrack只能同一时间渲染到一个元素上，当前课中设备检测和上课视频画面会同时存在，所以使用两个VideoTrack
     */
    previewVideoTrack: ILingoCameraVideoTrack | undefined;
    /**
     * 初始化，init 应该在其他方法之前调用
     */
    init(param: LingoAceRTCInitParam): Promise<void>;
    /**
     * 本地资源释放，一旦释放之后，后续 rtc 功能无法再使用
     */
    release(): void;
    /**
     * 检查 SDK 对正在使用的浏览器的适配情况（至少需要支持音视频互通、屏幕共享功能；实现方可自行定义当前环境是否可用）
     * 该方法必须在创建客户端对象 {@link createClient} 之前调用
     * @returns
     * - `true`: 支持
     * - `false`: 不支持
     */
    checkSystemRequirements(): Promise<boolean>;
    /**
     * 检查浏览器音视频权限
     * @param checkType 不传参数则音视频权限两个都检查
     */
    checkPermissions(checkType?: MediaType): Promise<RTCPermissions>;
    /**
     * 创建一个客户端对象用于通话/直播管理
     */
    createClient(): Promise<ILingoRTCClient>;
    /**
     * 创建本地音频轨道
     * @param microphoneId 麦克风id
     */
    createMicrophoneAudioTrack(microphoneId?: string): Promise<ILingoMicrophoneAudioTrack>;
    /**
     * 创建本地视频轨道
     */
    createCameraVideoTrack(config: LingoCameraVideoTrackInitConfig): Promise<ILingoCameraVideoTrack>;
    /**
     * 创建自定义视频轨道
     * 自定义视频轨道就是在摄像头采集的画面上做二次加工，所以参数传递 摄像头轨道
     */
    createCustomVideoTrack(cameraVideoTrack: ILingoCameraVideoTrack): Promise<ILingoCustomVideoTrack>;
    /**
     * 获取设备列表
     * @param skipPermissionCheck 是否跳过权限检查
     */
    getDevices(skipPermissionCheck?: boolean): Promise<MediaDeviceInfo[]>;
    /**
     * 获取摄像头列表
     */
    getCameras(skipPermissionCheck?: boolean): Promise<MediaDeviceInfo[]>;
    /**
     * 获取麦克风列表
     */
    getMicrophones(skipPermissionCheck?: boolean): Promise<MediaDeviceInfo[]>;
    /**
     * 获取音频播放设备列表
     */
    getSpeakerDevices(skipPermissionCheck?: boolean): Promise<MediaDeviceInfo[]>;
    /**
     * 设置当前所有麦克风实例的设备id
     */
    setMicrophoneDevice(microphoneId: string): Promise<void>;
    /**
     * 设置当前所有摄像头实例的设备id
     */
    setCameraDevice(cameraId: string): Promise<void>;
    /**
     * 设置当前所有扬声器实例的设备id
     */
    setSpeakerDevice(speakerId: string): Promise<void>;
    /**
     * 检测麦克风
     */
    detectMicrophone(microphoneId?: string): Promise<DetectMicrophoneResult>;
    /**
     * 检测摄像头
     */
    detectCamera(param: DetectCameraParam): Promise<DetectCameraResult>;
    /**
     * 镜像所有本地视频
     */
    mirrorVideo(mirror: boolean): void;
    /**
     * 获取正在使用的麦克风
     */
    getActiveMicrophone(): Promise<LingoDeviceInfo>;
    /**
     * 获取正在使用的扬声器
     */
    getActiveSpeaker(): Promise<LingoDeviceInfo>;
    /**
     * 获取正在使用的摄像头
     */
    getActiveCamera(): Promise<LingoDeviceInfo>;
    /**
     * 检测当前本地音视频轨道的设备id是否可用，如果不可用则切换到其他的设备id
     */
    checkAndSetDevice(): Promise<void>;
    /**
     * 修复本地音视频（重新创建、重新推流）
     */
    resumeLocalTracks(): Promise<void>;
    /**
     * 对本地播放的音频启用回声消除
     * @param element 需要进行回声消除的媒体元素
     */
    processExternalMediaAEC(element: HTMLMediaElement): void;
}
/**
 * RTC 初始化参数
 */
interface LingoAceRTCInitParam {
    appId: string;
    /**
     * zego 初始化所需参数
     */
    zego?: {
        server: string;
    };
}
/**
 * 创建摄像头视频轨道的配置对象
 */
interface LingoCameraVideoTrackInitConfig {
    /**
     * 指定摄像头的设备 ID
     */
    cameraId?: string;
}
/**
 * 设备检测结果
 */
interface DetectDeviceResult {
    /**
     * sdk 检测是否活跃
     */
    checkIsActive: () => Promise<boolean>;
    /**
     * 清除函数
     */
    cleanup: () => void;
}
/**
 * 麦克风检测结果
 */
interface DetectMicrophoneResult extends DetectDeviceResult {
    /**
     * 调用此方法获取实时音量 [0,100]
     */
    getVolumeLevel: () => number;
}
/**
 * 摄像头检测结果
 */
interface DetectCameraResult extends DetectDeviceResult {
}
interface DetectCameraParam {
    /**
     * 视频渲染元素
     */
    container: HTMLDivElement;
    /**
     * 指定设备id
     */
    cameraId?: string;
    /**
     * 设置是否开启镜像模式
     */
    mirror?: boolean;
}

export { AutoplayFailedCallback, ConnectionStateChangeCallback, DeciceSwitchedCallback, DetectCameraParam, DetectCameraResult, DetectDeviceResult, DetectMicrophoneResult, ExceptionCallback, ILingoAudioTrack, ILingoCameraVideoTrack, ILingoCustomVideoTrack, ILingoLocalAudioTrack, ILingoLocalTrack, ILingoLocalVideoTrack, ILingoMicrophoneAudioTrack, ILingoRTC, ILingoRTCClient, ILingoRTCJoinParam, ILingoRTCRemoteUser, ILingoRemoteAudioTrack, ILingoRemoteTrack, ILingoRemoteVideoTrack, ILingoTrack, ILingoVideoTrack, KindDeviceChangedCallback, LingoAceRTCInitParam, LingoCameraVideoTrackInitConfig, LingoDeviceInfo, LingoPlayOptions, LingoRTCEvent, LingoUserPropertiesPayload, LocalTrackCreatedCallback, MediaType, NetworkQuality, NetworkQualityCallback, QOEStats, RTCConnectionState, RTCPermissions, RTCType, RemoteScreenSharingCallback, UserCallback, UserPublishedCallback };
