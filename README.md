# XishanWebTools

一个用于集中管理本地网页版小工具的仓库。当前工具全部使用纯 HTML / CSS / JavaScript，默认在浏览器本地处理文件。

## 已收录工具

- **图片随机拼接**：多目录随机抽图，3/4 张模式，9:16 / 3:4 / 16:9 / 1:1 / 自定义尺寸，拼接缝虚化，JPG 导出。
- **线稿文字生成器 V2**：文字线稿、断裂、局部干扰、字符错位、噪点、模糊，PNG 导出。

## 微信小程序

原生微信小程序代码位于 [`miniprogram/`](miniprogram/)，当前已经实现线稿文字生成器、透明/纯色/自定义图片背景、PNG 保存，以及默认关闭的微信广告接入预留。

## 使用

直接打开根目录 `index.html`，再从工具箱首页进入具体工具。

也可以启用 GitHub Pages，把仓库根目录作为静态站点发布。

## 目录

```text
XishanWebTools/
├─ index.html
├─ miniprogram/
│  ├─ pages/
│  ├─ components/
│  ├─ config/
│  └─ project.config.json
├─ tools/
│  ├─ image-collage/
│  │  └─ index.html
│  └─ line-art-text/
│     └─ index.html
└─ README.md
```
