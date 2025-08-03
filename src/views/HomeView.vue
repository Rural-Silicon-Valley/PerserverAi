<!-- 主页视图 -->
<template>
  <div class="home-view">
    <!-- 顶部导航 -->
    <header class="app-header">
      <div class="logo handwritten-text">稳定的思想流</div>
      <button class="theme-btn" @click="toggleTheme">{{ currentThemeIcon }}</button>
    </header>
    
    <!-- 主体内容 -->
    <main class="main-content">
      <!-- 日历组件 -->
      <HandDrawnCalendar />
    </main>
    
    <!-- 底部导航 -->
    <footer class="app-footer">
      <div class="nav-item" :class="{ active: activeTab === 'calendar' }" @click="activeTab = 'calendar'">
        <div class="nav-icon">📅</div>
        <div class="nav-text">日历</div>
      </div>
      <div class="nav-item" :class="{ active: activeTab === 'statistics' }" @click="activeTab = 'statistics'">
        <div class="nav-icon">📊</div>
        <div class="nav-text">统计</div>
      </div>
      <div class="nav-item" :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'">
        <div class="nav-icon">⚙️</div>
        <div class="nav-text">设置</div>
      </div>
    </footer>
    
    <!-- 日期详情抽屉 -->
    <Drawer 
      v-model="isDetailOpen"
      :title="selectedDateTitle"
    >
      <TaskCheckList />
      <DiaryEditor />
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useMainStore } from '../store/main';
import HandDrawnCalendar from '../components/HandDrawnCalendar.vue';
import Drawer from '../components/Drawer.vue';
import TaskCheckList from '../components/TaskCheckList.vue';
import DiaryEditor from '../components/DiaryEditor.vue';
import { SoundType, playSound, initAudio } from '../utils/sound';
import { getFriendlyDateDesc } from '../utils/date';

// Store
const store = useMainStore();

// 状态
const activeTab = ref('calendar');
const themes = {
  default: '🌞',
  dark: '🌙',
  spring: '🌸',
  summer: '🏝️',
  autumn: '🍁',
  winter: '❄️'
};

// 计算属性
const isDetailOpen = computed({
  get: () => store.isDetailOpen,
  set: (value) => {
    store.isDetailOpen = value;
    if (!value) {
      store.closeDetail();
    }
  }
});

const selectedDateTitle = computed(() => {
  const dateObj = new Date(store.selectedDate);
  return getFriendlyDateDesc(dateObj);
});

const currentThemeIcon = computed(() => {
  return themes[store.theme as keyof typeof themes] || themes.default;
});

// 方法
const toggleTheme = () => {
  playSound(SoundType.TAP);
  
  const themeKeys = Object.keys(themes);
  const currentIndex = themeKeys.indexOf(store.theme);
  const nextIndex = (currentIndex + 1) % themeKeys.length;
  
  store.setTheme(themeKeys[nextIndex]);
};

// 监听主题变化，应用相应的CSS类
watch(() => store.theme, (newTheme) => {
  document.body.className = `theme-${newTheme}`;
}, { immediate: true });

// 生命周期
onMounted(() => {
  // 初始化音频（需要用户交互才能使用Web Audio API）
  document.addEventListener('click', initAudio, { once: true });
  
  // 初始化数据
  store.initData();
});
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
  padding-top: env(safe-area-inset-top);
}

.logo {
  font-size: 1.5rem;
  color: #333;
}

.theme-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.7);
  border: 2px dashed var(--color-mint-green);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-btn:hover {
  transform: rotate(30deg);
}

.main-content {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  padding-bottom: 70px; /* 为底部导航留出空间 */
  display: flex;
  flex-direction: column;
  height: calc(100vh - 130px); /* 减去头部和底部导航的高度 */
  min-height: 500px; /* 确保有最小高度 */
}

.app-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-top: 1px dashed var(--color-mint-green);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 10;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 33.33%;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-icon {
  font-size: 1.5rem;
  margin-bottom: 2px;
}

.nav-text {
  font-size: 0.7rem;
  color: #666;
}

.nav-item.active {
  color: var(--color-mint-green);
}

.nav-item.active .nav-text {
  color: var(--color-mint-green);
}

@media (max-width: 480px) {
  .app-header {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .main-content {
    padding: var(--spacing-sm) var(--spacing-md);
  }
}
</style>
