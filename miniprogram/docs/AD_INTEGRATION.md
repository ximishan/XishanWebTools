# 微信广告接入预留

## 当前状态

广告代码默认关闭，未填写任何测试或真实广告位 ID，不会显示空白占位，也不会影响工具功能。

当前已经完成：

- `config/ads.js`：集中管理开关和广告位 ID。
- `components/ad-slot/`：Banner、视频和格子广告的统一组件。
- 首页和线稿工具页：已经接入组件，但配置关闭时完全不渲染广告。
- 加载失败：只记录并向页面转发错误，不用自制广告冒充微信广告。

## 为什么没有引入第三方广告 SDK

GitHub 上能找到的多数广告封装针对微信小游戏、Unity 或多平台游戏，并不适合原生微信小程序。原生小程序的 Banner、视频和格子广告本身就是微信组件，额外引入 SDK 会增加体积、隐私和维护风险。

可参考的开源项目：

- 微信官方示例：<https://github.com/wechat-miniprogram/miniprogram-demo/tree/master/miniprogram/page/ad>
- `wegame-adapter-kit`：<https://github.com/YCL0101/wegame-adapter-kit>，面向微信/抖音小游戏，不直接引入本项目。
- `wechat-minigame-rewarded-video-ad`：<https://github.com/hwei/wechat-minigame-rewarded-video-ad>，用于小游戏激励视频行为实验，不直接引入本项目。

本项目采用微信官方原生广告能力，并保留自己的轻量配置层。

## 开通后如何启用

1. 在微信公众平台满足并开通“流量主”要求。
2. 在流量主后台创建广告位，取得以 `adunit-` 开头的广告单元 ID。
3. 打开 `config/ads.js`。
4. 将 `masterEnabled` 改为 `true`。
5. 填写相应 `unitId`，并把该广告位的 `enabled` 改为 `true`。
6. 使用体验版和真机测试；广告真实填充不能只靠开发者工具确认。

示例：

```js
const AD_CONFIG = {
  masterEnabled: true,
  slots: {
    homeBanner: {
      enabled: true,
      unitId: 'adunit-这里替换成微信后台生成的真实ID',
      type: 'banner',
      theme: 'white',
      intervals: 60
    }
  }
}
```

不要把示例文字当成真实广告位 ID 提交。

## 产品策略建议

- 第一阶段只启用首页或结果页 Banner，确认布局和填充稳定。
- 不要在用户输入文字、调整参数或选择图片时弹插屏。
- 当前基础 PNG 保存保持免费，不接激励视频门槛。
- 如果以后提供批量生成、超高分辨率或高级模板，可把激励视频作为用户主动选择的可选入口。
- 插屏广告只应出现在一次完整任务结束之后，并设置合理频率，不能每次保存都强制展示。
- 广告加载失败或无填充时，页面必须保持原布局，不显示自制假广告。

## 上线前检查

- 广告位 ID 与当前小程序 AppID 匹配。
- 广告不遮挡保存、返回、授权等核心按钮。
- 安卓和 iPhone 真机都完成测试。
- 微信后台的隐私保护指引和服务类目已填写。
- 体验版记录广告加载成功、失败、关闭和无填充状态。
- 按微信流量主规范检查位置、间距和诱导点击风险。
