/**
 * 统一不同 rtc sdk 的对外抛出的错误
 */
export enum LingoRTCErrorCode {
  NotSupported = "NotSupported",
  PermissionDenied = "PermissionDenied", // 没有音视频权限 / 屏幕共享权限
  DeviceNotFound = "DeviceNotFound",
  NotReadable = "NotReadable",
  Other = "Other",
}
export class LingoRTCError extends Error {
  readonly name = LingoRTCError.name;
  readonly code: LingoRTCErrorCode;
  readonly message: string;

  constructor(code: LingoRTCErrorCode, message?: string) {
    super();
    this.code = code;
    this.message = message || "";
  }
  /**
   * 将普通 Error 对象转成 LingoRTCError
   * @param error Error
   * @returns LingoRTCError
   */
  static createRTCError(error: Error): LingoRTCError {
    if (error.name === LingoRTCError.name) {
      return error as LingoRTCError;
    }
    const errorName = error.name;
    const message = error.message;
    if (errorName === "NotAllowedError") {
      return new LingoRTCError(LingoRTCErrorCode.PermissionDenied, message);
    } else if (errorName === "NotFoundError") {
      return new LingoRTCError(LingoRTCErrorCode.DeviceNotFound, message);
    } else if (
      ["NotReadableError", "OverconstrainedError"].includes(errorName)
    ) {
      return new LingoRTCError(LingoRTCErrorCode.NotReadable, message);
    }
    return new LingoRTCError(LingoRTCErrorCode.Other, message);
  }
  /**
   * 创建一个 LIngoRTCError.Other 的错误
   * @param message 错误消息
   * @returns LingoRTCError
   */
  static createOtherError(message: string) {
    return new LingoRTCError(LingoRTCErrorCode.Other, message);
  }
  toString() {
    return `Name=${this.name},code=${this.code},message=${this.message}`;
  }
}
