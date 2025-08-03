<!-- 底部抽屉组件 -->
<template>
  <div>
    <!-- 遮罩层 -->
    <div 
      class="drawer-mask" 
      :class="{ 'drawer-mask-open': modelValue }" 
      @click="closeDrawer"
    ></div>
    
    <!-- 抽屉容器 -->
    <div 
      class="drawer-container paper-texture" 
      :class="{ 'drawer-open': modelValue }"
    >
      <!-- 抽屉头部和标题 -->
      <div class="drawer-header">
        <div class="drawer-handle"></div>
        <h3 class="drawer-title handwritten-text" v-if="title">{{ title }}</h3>
        <button class="drawer-close-btn" @click="closeDrawer">×</button>
      </div>
      
      <!-- 抽屉内容 -->
      <div class="drawer-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SoundType, playSound } from '../utils/sound';

// Props
const props = defineProps<{
  modelValue: boolean; // v-model绑定
  title?: string;     // 抽屉标题
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
}>();

// 关闭抽屉
const closeDrawer = () => {
  playSound(SoundType.TAP);
  emit('update:modelValue', false);
  emit('close');
};
</script>

<style scoped>
.drawer-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease;
}

.drawer-mask-open {
  opacity: 1;
  visibility: visible;
}

.drawer-container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-height: 85vh;
  background-color: var(--bg-paper);
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom);
}

.drawer-open {
  transform: translateY(0);
}

.drawer-header {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px dashed var(--color-mint-green);
  position: relative;
}

.drawer-handle {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 4px;
  background-color: #ddd;
  border-radius: 2px;
}

.drawer-title {
  flex: 1;
  text-align: center;
  font-size: 1.2rem;
  margin: var(--spacing-md) 0 var(--spacing-xs);
  color: #333;
}

.drawer-close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: var(--spacing-xs);
}

.drawer-content {
  padding: var(--spacing-md) var(--spacing-lg);
  overflow-y: auto;
  max-height: calc(85vh - 60px);
  -webkit-overflow-scrolling: touch;
}
</style>
