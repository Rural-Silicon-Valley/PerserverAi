<!-- 日记编辑组件 -->
<template>
  <div class="diary-editor">
    <div class="section-title handwritten-text">{{ selectedDatePrefix }}心情记录</div>
    
    <!-- 日记状态 -->
    <div class="diary-status">
      <div class="date-display">
        {{ formattedDate }}
      </div>
      <div class="mood-picker">
        <span>心情：</span>
        <div class="mood-options">
          <div 
            v-for="mood in moodOptions" 
            :key="mood.value"
            class="mood-option"
            :class="{ active: diaryData.mood === mood.value }"
            @click="selectMood(mood.value)"
          >
            {{ mood.icon }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 日记文本编辑区 -->
    <div class="diary-text-area">
      <textarea 
        v-model="diaryData.content"
        placeholder="今天有什么想记录的呢？"
        class="diary-textarea handwritten-text"
        @input="autosave"
      ></textarea>
    </div>
    
    <!-- 涂鸦区 -->
    <div class="drawing-area">
      <div class="drawing-controls">
        <div class="drawing-tools">
          <button 
            v-for="tool in drawingTools" 
            :key="tool.type"
            class="tool-btn"
            :class="{ active: currentTool === tool.type }"
            @click="selectTool(tool.type)"
          >
            {{ tool.icon }}
          </button>
        </div>
        <div class="color-picker">
          <div 
            v-for="color in colorOptions" 
            :key="color"
            class="color-option"
            :style="{ backgroundColor: color }"
            :class="{ active: drawOptions.strokeColor === color }"
            @click="selectColor(color)"
          ></div>
        </div>
        <button class="clear-btn" @click="clearCanvas">清除</button>
      </div>
      <canvas 
        ref="drawCanvas"
        class="draw-canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart="handleTouch"
        @touchmove="handleTouch"
        @touchend="stopDrawing"
      ></canvas>
    </div>
    
    <!-- 贴纸区 -->
    <div class="stickers-area">
      <div class="stickers-title">心情贴纸</div>
      <div class="stickers-container">
        <div 
          v-for="sticker in availableStickers" 
          :key="sticker.id"
          class="sticker-option"
          @click="addSticker(sticker)"
        >
          <img :src="sticker.imageUrl" :alt="sticker.name" class="sticker-img" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { formatDate, getFriendlyDateDesc } from '../utils/date';
import { useMainStore } from '../store/main';
import { SoundType, playSound } from '../utils/sound';
import type { DiaryEntry } from '../utils/storage';
import { 
  initCanvas, 
  clearCanvas as clearCanvasUtil, 
  drawPath,
  saveCanvasAsImage,
  type DrawOptions,
  type DrawPoint,
  type DrawPath
} from '../utils/draw';

// Props
const props = defineProps<{
  date?: Date | string;  // 当前日期
}>();

// Store
const store = useMainStore();

// 状态
const drawCanvas = ref<HTMLCanvasElement | null>(null);
const canvasContext = ref<CanvasRenderingContext2D | null>(null);
const isDrawing = ref(false);
const currentPath = reactive<DrawPath>({
  points: [],
  options: {
    strokeColor: '#333333',
    strokeWidth: 3,
    isEraser: false
  }
});

// 绘图工具和选项
const currentTool = ref('pen');
const drawOptions = reactive<DrawOptions>({
  strokeColor: '#333333',
  strokeWidth: 3,
  isEraser: false
});

const drawingTools = [
  { type: 'pen', icon: '✏️' },
  { type: 'brush', icon: '🖌️' },
  { type: 'eraser', icon: '🧽' }
];

const colorOptions = [
  '#333333', '#e74c3c', '#3498db', '#2ecc71', 
  '#f1c40f', '#9b59b6', '#e67e22'
];

// 心情选项
const moodOptions = [
  { value: 'happy', icon: '😊' },
  { value: 'calm', icon: '😌' },
  { value: 'excited', icon: '🥳' },
  { value: 'sad', icon: '😔' },
  { value: 'angry', icon: '😡' }
];

// 贴纸选项
const availableStickers = [
  { id: 'sticker1', name: '花朵', imageUrl: '/src/assets/stickers/flower.png' },
  { id: 'sticker2', name: '星星', imageUrl: '/src/assets/stickers/star.png' },
  { id: 'sticker3', name: '爱心', imageUrl: '/src/assets/stickers/heart.png' },
  { id: 'sticker4', name: '彩虹', imageUrl: '/src/assets/stickers/rainbow.png' }
];

// 日记数据
const diaryData = reactive<Partial<DiaryEntry>>({
  content: '',
  mood: '',
  drawingImageData: '',
  stickers: []
});

// 格式化日期显示
const formattedDate = computed(() => {
  // 使用store中的selectedDate
  const dateStr = store.selectedDate;
  const dateObj = new Date(dateStr);
  
  return `${getFriendlyDateDesc(dateObj)} · ${dateStr}`;
});

// 日期前缀（今日/昨日/明日/日期）
const selectedDatePrefix = computed(() => {
  const dateObj = new Date(store.selectedDate);
  const friendly = getFriendlyDateDesc(dateObj);
  
  // 如果是今天/昨天/明天，返回对应的描述，否则返回月日
  if (friendly === '今天') return '今日';
  if (friendly === '昨天') return '昨日';
  if (friendly === '明天') return '明日';
  
  return `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
});

// 方法
// 初始化
onMounted(() => {
  initializeCanvas();
  loadDiaryData();
  
  // 窗口大小变化时重新初始化Canvas
  window.addEventListener('resize', initializeCanvas);
});

// 初始化Canvas
const initializeCanvas = () => {
  if (!drawCanvas.value) return;
  
  // 设置Canvas大小为容器大小
  const container = drawCanvas.value.parentElement;
  if (container) {
    drawCanvas.value.width = container.clientWidth;
    drawCanvas.value.height = 180; // 固定高度
  }
  
  canvasContext.value = initCanvas(drawCanvas.value);
  
  // 如果有已保存的绘图，恢复它
  if (diaryData.drawingImageData) {
    const img = new Image();
    img.onload = () => {
      canvasContext.value?.drawImage(img, 0, 0);
    };
    img.src = diaryData.drawingImageData;
  }
};

// 加载日记数据
const loadDiaryData = () => {
  // 始终使用store中的selectedDate
  const dateStr = store.selectedDate;
  
  const existingDiary = store.diaryEntries.find(entry => entry.date === dateStr);
  
  if (existingDiary) {
    diaryData.content = existingDiary.content || '';
    diaryData.mood = existingDiary.mood || '';
    diaryData.drawingImageData = existingDiary.drawingImageData || '';
    diaryData.stickers = existingDiary.stickers || [];
    
    // 如果有已保存的绘图，恢复它
    if (diaryData.drawingImageData && canvasContext.value) {
      const img = new Image();
      img.onload = () => {
        canvasContext.value?.drawImage(img, 0, 0);
      };
      img.src = diaryData.drawingImageData;
    }
  }
};

// 自动保存
const autosave = () => {
  // 始终使用store中的selectedDate
  const dateStr = store.selectedDate;
  
  // 保存Canvas内容为图片
  if (drawCanvas.value) {
    diaryData.drawingImageData = saveCanvasAsImage(drawCanvas.value);
  }
  
  store.saveDiary({
    ...diaryData,
    date: dateStr
  });
};

// 选择绘图工具
const selectTool = (toolType: string) => {
  playSound(SoundType.TAP);
  currentTool.value = toolType;
  
  // 更新绘图选项
  switch (toolType) {
    case 'pen':
      drawOptions.strokeWidth = 2;
      drawOptions.isEraser = false;
      break;
    case 'brush':
      drawOptions.strokeWidth = 5;
      drawOptions.isEraser = false;
      break;
    case 'eraser':
      drawOptions.isEraser = true;
      drawOptions.strokeWidth = 15;
      break;
  }
};

// 选择颜色
const selectColor = (color: string) => {
  playSound(SoundType.TAP);
  drawOptions.strokeColor = color;
};

// 清空画布
const clearCanvas = () => {
  if (!canvasContext.value) return;
  
  if (confirm('确定要清空画布吗？')) {
    playSound(SoundType.TAP);
    clearCanvasUtil(canvasContext.value);
    autosave();
  }
};

// 开始绘图
const startDrawing = (event: MouseEvent) => {
  if (!canvasContext.value || !drawCanvas.value) return;
  
  isDrawing.value = true;
  const { offsetX, offsetY } = event;
  
  // 重置当前路径
  currentPath.points = [{ x: offsetX, y: offsetY }];
  currentPath.options = { ...drawOptions };
  
  // 播放绘图音效
  playSound(SoundType.WRITING, 0.3);
};

// 绘制
const draw = (event: MouseEvent) => {
  if (!isDrawing.value || !canvasContext.value) return;
  
  const { offsetX, offsetY } = event;
  currentPath.points.push({ x: offsetX, y: offsetY });
  
  // 重新绘制整个路径，实现平滑的线条
  drawPath(canvasContext.value, currentPath);
};

// 停止绘图
const stopDrawing = () => {
  if (isDrawing.value) {
    isDrawing.value = false;
    autosave();
  }
};

// 处理触摸事件
const handleTouch = (event: TouchEvent) => {
  event.preventDefault();
  
  if (!drawCanvas.value || !canvasContext.value) return;
  
  const rect = drawCanvas.value.getBoundingClientRect();
  const touch = event.touches[0];
  
  const offsetX = touch.clientX - rect.left;
  const offsetY = touch.clientY - rect.top;
  
  if (event.type === 'touchstart') {
    isDrawing.value = true;
    currentPath.points = [{ x: offsetX, y: offsetY }];
    currentPath.options = { ...drawOptions };
    playSound(SoundType.WRITING, 0.3);
  } else if (event.type === 'touchmove' && isDrawing.value) {
    currentPath.points.push({ x: offsetX, y: offsetY });
    drawPath(canvasContext.value, currentPath);
  }
};

// 选择心情
const selectMood = (mood: string) => {
  playSound(SoundType.TAP);
  diaryData.mood = mood;
  autosave();
};

// 添加贴纸
const addSticker = (sticker: { id: string, name: string, imageUrl: string }) => {
  playSound(SoundType.STICKER_ADD);
  
  // 在画布中间添加贴纸
  if (canvasContext.value && drawCanvas.value) {
    const centerX = drawCanvas.value.width / 2;
    const centerY = drawCanvas.value.height / 2;
    
    const img = new Image();
    img.onload = () => {
      if (!canvasContext.value) return;
      
      const width = 60;  // 贴纸宽度
      const height = width * (img.height / img.width); // 保持宽高比
      
      canvasContext.value.drawImage(
        img, 
        centerX - width/2, 
        centerY - height/2, 
        width, 
        height
      );
      
      autosave();
    };
    img.src = sticker.imageUrl;
  }
};

// 当日期变更时，重新加载日记数据
watch([() => props.date, () => store.selectedDate], () => {
  loadDiaryData();
  if (canvasContext.value) {
    clearCanvasUtil(canvasContext.value);
    
    // 如果有已保存的绘图，恢复它
    if (diaryData.drawingImageData) {
      const img = new Image();
      img.onload = () => {
        canvasContext.value?.drawImage(img, 0, 0);
      };
      img.src = diaryData.drawingImageData;
    }
  }
});
</script>

<style scoped>
.diary-editor {
  margin-top: var(--spacing-lg);
}

.section-title {
  font-size: 1.2rem;
  margin-bottom: var(--spacing-md);
  color: #333;
}

.diary-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.date-display {
  font-size: 0.9rem;
  color: #666;
}

.mood-picker {
  display: flex;
  align-items: center;
}

.mood-picker span {
  font-size: 0.9rem;
  color: #666;
  margin-right: var(--spacing-sm);
}

.mood-options {
  display: flex;
  gap: var(--spacing-xs);
}

.mood-option {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.mood-option:hover {
  transform: scale(1.1);
}

.mood-option.active {
  background-color: var(--color-mint-green);
  transform: scale(1.1);
}

.diary-text-area {
  margin-bottom: var(--spacing-lg);
}

.diary-textarea {
  width: 100%;
  height: 120px;
  padding: var(--spacing-md);
  border: 2px dashed var(--color-mint-green);
  border-radius: var(--radius-md);
  background-color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
  line-height: 1.5;
  resize: none;
}

.drawing-area {
  margin-bottom: var(--spacing-lg);
  border: 2px dashed var(--color-mint-green);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.drawing-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: rgba(255, 255, 255, 0.7);
  border-bottom: 1px dashed var(--color-mint-green);
}

.drawing-tools {
  display: flex;
  gap: var(--spacing-sm);
}

.tool-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn.active {
  background-color: var(--color-mint-green);
}

.color-picker {
  display: flex;
  gap: var(--spacing-xs);
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-option:hover {
  transform: scale(1.2);
}

.color-option.active {
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.2);
  transform: scale(1.2);
}

.clear-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid #ddd;
  border-radius: var(--radius-sm);
  background-color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  cursor: pointer;
}

.draw-canvas {
  background-color: rgba(255, 255, 255, 0.8);
  width: 100%;
  height: 180px;
  cursor: crosshair;
  touch-action: none;
}

.stickers-area {
  margin-bottom: var(--spacing-lg);
}

.stickers-title {
  font-size: 0.9rem;
  margin-bottom: var(--spacing-sm);
  color: #666;
}

.stickers-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm);
}

.sticker-option {
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  background-color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.sticker-option:hover {
  background-color: rgba(255, 249, 230, 0.7);
  transform: scale(1.05);
}

.sticker-img {
  width: 80%;
  height: 80%;
  object-fit: contain;
}
</style>
