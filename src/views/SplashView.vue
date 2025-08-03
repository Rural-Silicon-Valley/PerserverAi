<!-- 启动页面 -->
<template>
  <div class="splash-view paper-texture">
    <div class="splash-content">
      <!-- 标题和图标 -->
      <h1 class="app-title handwritten-text">稳定的思想流</h1>
      <div class="splash-illustration">
        <div class="illustration-wrapper">
          <!-- 这里可以放置一个动画图标或SVG插画 -->
          <div class="illustration-placeholder">
            <div class="plant-animation"></div>
          </div>
        </div>
      </div>
      <p class="splash-quote">记录思想，保持稳定的思考～</p>
      
      <!-- 加载进度 -->
      <div class="loading-bar">
        <div class="loading-progress" :style="{ width: loadingProgress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMainStore } from '../store/main';
import { SoundType, preloadSounds } from '../utils/sound';

// 状态
const loadingProgress = ref(0);
const router = useRouter();
const store = useMainStore();

// 生命周期
onMounted(async () => {
  // 预加载所需资源
  await Promise.all([
    preloadResources(),
    simulateLoading()
  ]);
  
  // 初始化数据
  store.initData();
  
  // 导航到主页
  router.replace('/home');
});

// 模拟加载过程
const simulateLoading = async () => {
  const totalSteps = 10;
  
  for (let i = 1; i <= totalSteps; i++) {
    loadingProgress.value = (i / totalSteps) * 100;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
};

// 预加载资源
const preloadResources = async () => {
  // 预加载音效
  await preloadSounds([
    SoundType.FLIP_PAGE,
    SoundType.TAP,
    SoundType.WRITING,
    SoundType.TASK_COMPLETE,
    SoundType.STICKER_ADD
  ]);
  
  // 预加载图片等资源
  // ...
};
</script>

<style scoped>
.splash-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  text-align: center;
}

.splash-content {
  width: 100%;
  max-width: 320px;
}

.app-title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: var(--spacing-xl);
  animation: float 3s ease-in-out infinite;
}

.splash-illustration {
  margin-bottom: var(--spacing-xl);
}

.illustration-wrapper {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  position: relative;
}

.illustration-placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--color-cream-yellow);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.plant-animation {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 120px;
  background-color: var(--color-mint-green);
  clip-path: path('M40,120 Q20,80 40,60 Q60,40 40,0 Q20,40 40,60 Q60,80 40,120');
  animation: grow 3s ease-in-out infinite;
}

.splash-quote {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: var(--spacing-xl);
  font-family: var(--font-handwritten);
}

.loading-bar {
  width: 100%;
  height: 4px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.loading-progress {
  height: 100%;
  background-color: var(--color-mint-green);
  border-radius: 2px;
  transition: width 0.2s ease;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes grow {
  0%, 100% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.1);
  }
}
</style>
