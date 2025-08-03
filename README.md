# 稳定的思想流 - 手绘风日记 + 打卡应用

一个轻量级、跨平台的手机端Web应用，帮助用户通过日记记录和每日打卡来稳定和记录思想流。

## 项目特点

- 🎨 手绘风格：柔和淡彩 + 手绘笔触，营造"思想流动"质感
- 📅 日历为中心：可视化记录思想轨迹，展示思考历程
- ✏️ 自由涂鸦：支持手绘笔记、添加贴纸，记录每日思考
- 🔔 智能反馈：记录完成后有轻量动画和音效反馈
- 📊 月度统计：回顾每月思考成果，跟踪思想发展

## 技术栈

- Vue 3 + TypeScript + Vite（轻量高效）
- Vant UI 底层支持（定制手绘风格组件）
- PWA 支持（可添加至主屏幕）
- Canvas/Web Audio API（绘图和音效）
- LocalStorage（本地数据存储）

## 快速开始

### 克隆项目

```bash
git clone https://github.com/Rural-Silicon-Valley/PerserverAi.git
cd PerserverAi/healing-diary-app
```

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 打包构建

```bash
npm run build
```

### 预览打包结果

```bash
npm run preview
```

## 项目结构

```
src/
  assets/        # 资源文件（图标、贴纸、音效）
  components/    # 可复用组件
  views/         # 页面视图
  utils/         # 工具函数
  store/         # 状态管理
  styles/        # 全局样式
```

## 主要功能

1. **月视图日历**：直观展示打卡记录
2. **任务打卡**：简单记录每日小目标
3. **心情日记**：结合文字和涂鸦，记录每日感受
4. **主题切换**：支持多种视觉主题，适应不同场景和心情

## 注意事项

- 本应用采用响应式设计，在移动端体验最佳
- 支持iOS/Android/鸿蒙等主流平台
- 可使用系统自带的语音输入功能

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
