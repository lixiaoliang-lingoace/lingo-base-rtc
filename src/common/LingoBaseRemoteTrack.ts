import { LingoBaseTrack } from "./LingoBaseTrack";

export abstract class LingoBaseRemoteTrack extends LingoBaseTrack {
  /**
   * 该轨道所属的用户 userId
   * 一般是用户加入频道时才有值，所以本地用户可能会是空字符串
   */
  uid: string = "";
}
