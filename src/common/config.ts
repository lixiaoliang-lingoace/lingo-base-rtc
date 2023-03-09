const config = {
  isDev: false,
  // 本地用户的 uid（一些场景下，无法获取用户身份uid时，用 0 代替本人身份）
  localUid: "0",
  // 屏幕共享使用约定的固定 uid = 1
  screenSharingUid: "1",
  // 某些需要明确设置屏幕共享分辨率的
  screenSharingSize: {
    width: 1280,
    height: 720,
  },
  // 摄像头采集默认宽高
  captureSize: {
    width: 320,
    height: 240,
  },
};

export default config;
