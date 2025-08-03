<script setup lang="ts">
import { onMounted } from 'vue';
import { useMainStore } from './store/main';
import { SoundType, initAudio } from './utils/sound';

// 获取Store
const store = useMainStore();

// 初始化音频上下文（需要用户交互）
onMounted(() => {
  document.addEventListener('click', initAudio, { once: true });
});
</script>

<template>
  <div class="app-container" :class="'theme-' + store.theme">
    <!-- 路由出口 -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
/* 全局样式 */
@import './styles/variables.css';
@import './styles/global.css';

.app-container {
  min-height: 100vh;
  width: 100%;
}

/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 主题相关样式 */
.theme-default {
  --bg-paper: var(--color-warm-yellow);
}

.theme-dark {
  --bg-paper: #333;
  color: #eee;
}

.theme-spring {
  --bg-paper: #f5f9f0;
  --color-mint-green: #8bc34a;
}

.theme-summer {
  --bg-paper: #f9f5e9;
  --color-mint-green: #4caf50;
}

.theme-autumn {
  --bg-paper: #f9f2e6;
  --color-mint-green: #ff9800;
}

.theme-winter {
  --bg-paper: #f0f4f9;
  --color-mint-green: #03a9f4;
}
</style>
