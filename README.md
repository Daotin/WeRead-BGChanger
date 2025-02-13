# PC 微信读书主题增强

一个用于修改微信读书网页版背景色的 Tampermonkey 脚本。支持多种预设背景色和背景图片，并能够自动适配深色/浅色模式。

![image](https://github.com/user-attachments/assets/c9e8320a-df10-4a40-bb70-7ec7e46cfe5d)

## 功能特点

- 支持多种预设背景色选项
- 自动适配深色/浅色模式

## 使用说明

1. 在微信读书页面右侧工具栏中找到 🎨 按钮
2. 点击按钮打开背景选择面板
3. 选择喜欢的背景色或背景图即可应用

## 自定义背景

提交 issue 即可。

## 更新日志

### v0.4 (2024-02-13)

- 脚本已接入 DeepSeek &nbsp;&nbsp;&nbsp;蓝
- 新增全屏阅读功能
- 增加记忆功能

### v0.3 (2024-02-10)

- 新增绿松石，木纹图片背景
- 新增 8 个传统中国色背景
- PS：深色图片背景缺失，目前使用同一张代替。

### v0.2 (2024-02-10)

- 新增背景图片支持（base64 格式）
- 优化背景图片显示效果
- 改进深色模式下的背景图显示
- 添加背景图预览功能
- 优化面板布局和样式

### v0.1 (2024-02-10)

- 初始版本发布
- 实现基础的背景色修改功能
- 添加 6 种预设背景色选项
- 支持深浅色模式自动切换
- 添加颜色选择记忆功能

## 注意事项

- 脚本仅在微信读书网页版（weread.qq.com）中生效
- 如遇到页面样式异常，请刷新页面
- 如需恢复默认背景，请选择"默认背景"选项
- 深浅色模式切换时会自动重置为默认背景
- 背景图片使用 base64 格式以避免 CSP 限制
- 建议使用适当大小的图片以避免 base64 字符串过长
