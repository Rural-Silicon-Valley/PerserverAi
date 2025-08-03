<!-- 任务列表组件 -->
<template>
  <div class="task-checklist">
    <div class="section-title handwritten-text">{{ selectedDatePrefix }}任务</div>
    
    <!-- 没有任务时的空状态 -->
    <div v-if="!tasks || tasks.length === 0" class="empty-state">
      <div class="empty-icon">🌱</div>
      <p class="empty-text">今天还没有安排呢~</p>
  <button class="add-task-btn handwritten-text" @click="showAddTask">添加一个小任务</button>
</div>
    
    <!-- 任务列表 -->
    <div v-else class="tasks-container">
      <div 
        v-for="task in tasks" 
        :key="task.id"
        class="task-item"
        :class="{ 
          'task-completed': isTaskCompleted(task),
          'task-duration': task.isDuration
        }"
      >
        <div class="checkbox-container" @click.stop="toggleTask(task)">
          <div class="custom-checkbox" :class="{ checked: isTaskCompleted(task) }">
            <span class="checkmark" v-if="isTaskCompleted(task)">✓</span>
          </div>
        </div>
        
        <div class="task-content" @click="toggleTask(task)">
          <img :src="getTaskIconUrl(task.icon)" class="task-icon" />
          <div class="task-info">
            <span class="task-title" :class="{ 'completed-text': isTaskCompleted(task) }">{{ task.title }}</span>
            <span v-if="task.isDuration" class="task-duration-badge">
              持续任务 ({{ formatDurationPeriod(task) }})
            </span>
          </div>
        </div>
        
        <button class="delete-btn" @click.stop="deleteTask(task.id)">×</button>
      </div>
      
      <!-- 添加任务按钮 -->
      <button class="add-task-btn handwritten-text" @click="showAddTask">+ 添加任务</button>
    </div>
    
    <!-- 添加任务弹窗 -->
    <div v-if="showAddTaskDialog" class="add-task-dialog">
      <div class="dialog-content paper-texture">
        <h3 class="dialog-title handwritten-text">新增任务</h3>
        
        <div class="form-group">
          <label>任务名称</label>
          <input 
            type="text" 
            v-model="newTask.title" 
            placeholder="今天要做什么呢？"
            class="task-input"
          />
        </div>
        
        <div class="form-group">
          <label>任务类型</label>
          <div class="task-type-selector">
            <div 
              class="task-type-option"
              :class="{ selected: !newTask.isDuration }"
              @click="newTask.isDuration = false"
            >
              单日任务
            </div>
            <div 
              class="task-type-option"
              :class="{ selected: newTask.isDuration }"
              @click="newTask.isDuration = true"
            >
              持续任务
            </div>
          </div>
        </div>
        
        <div class="form-group" v-if="newTask.isDuration">
          <label>结束日期</label>
          <input 
            type="date" 
            v-model="newTask.durationEndDate" 
            class="task-input date-input"
            :min="minEndDate"
          />
        </div>
        
        <div class="form-group">
          <label>选择图标</label>
          <div class="icon-selector">
            <div 
              v-for="icon in availableIcons" 
              :key="icon"
              class="icon-option"
              :class="{ selected: newTask.icon === icon }"
              @click="newTask.icon = icon"
            >
              <img :src="getTaskIconUrl(icon)" />
            </div>
            
            <!-- 自定义图标区域 -->
            <div
              v-for="(icon, index) in customIcons"
              :key="`custom-${index}`"
              class="icon-option custom-icon"
              :class="{ selected: newTask.icon === `custom-${index}` }"
              @click="newTask.icon = `custom-${index}`"
            >
              <img :src="icon.url" />
            </div>
            
            <!-- 添加自定义图标按钮 -->
            <div class="icon-option add-icon" @click="triggerIconUpload">
              <span>+</span>
              <input 
                type="file" 
                ref="iconFileInput" 
                accept="image/*" 
                class="hidden-file-input" 
                @change="handleIconUpload" 
              />
            </div>
          </div>
        </div>
        
        <div class="dialog-buttons">
          <button class="cancel-btn" @click="cancelAddTask">取消</button>
          <button 
            class="confirm-btn" 
            @click="confirmAddTask"
            :disabled="!newTask.title || !newTask.icon"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import type { Task, CustomIcon } from '../utils/storage';
import { useMainStore } from '../store/main';
import { SoundType, playSound } from '../utils/sound';
import { formatDate, getFriendlyDateDesc } from '../utils/date';
import { getCustomIcons, saveCustomIcons } from '../utils/storage';

// Props
const props = defineProps<{
  date?: Date | string;  // 当前日期
}>();

// Store
const store = useMainStore();

// 任务列表
const tasks = computed(() => {
  // 始终使用store中的selectedDate和currentDateTasks
  return store.currentDateTasks;
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

// 可用的任务图标
const availableIcons = [
  'coffee', 'book', 'run', 'heart', 
  'smile', 'sun', 'water', 'sleep', 
  'fruit', 'chat', 'meditate', 'music'
];

// 新任务表单
const newTask = reactive({
  title: '',
  icon: '',
  isDuration: false,
  durationEndDate: ''
});

// UI状态
const showAddTaskDialog = ref(false);
const iconFileInput = ref<HTMLInputElement | null>(null);

// 计算属性
const minEndDate = computed(() => {
  // 最小结束日期为当前选择日期的第二天
  const startDate = new Date(store.selectedDate);
  startDate.setDate(startDate.getDate() + 1);
  return formatDate(startDate);
});

// 自定义图标

const customIcons = ref<CustomIcon[]>([]);

// 获取任务图标URL
const getTaskIconUrl = (icon: string) => {
  if (icon.startsWith('custom-')) {
    const index = parseInt(icon.replace('custom-', ''));
    return customIcons.value[index]?.url || '';
  }
  return `/src/assets/images/icons/${icon}.svg`;
};

// 显示添加任务弹窗
const showAddTask = () => {
  playSound(SoundType.TAP);
  showAddTaskDialog.value = true;
};

// 取消添加任务
const cancelAddTask = () => {
  playSound(SoundType.TAP);
  showAddTaskDialog.value = false;
  newTask.title = '';
  newTask.icon = '';
  newTask.isDuration = false;
  newTask.durationEndDate = '';
};

// 检查任务是否已完成（考虑持续任务和普通任务）
const isTaskCompleted = (task: Task): boolean => {
  if (task.isDuration) {
    const dateStr = store.selectedDate;
    return Boolean(task.durationStatus?.[dateStr]);
  } else {
    return task.isCompleted;
  }
};

// 格式化持续任务的时间段
const formatDurationPeriod = (task: Task): string => {
  if (!task.isDuration || !task.durationEndDate) {
    return '';
  }
  
  const startDate = new Date(task.date);
  const endDate = new Date(task.durationEndDate);
  
  // 计算时间差（天数）
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return `${diffDays}天`;
};

// 确认添加任务
const confirmAddTask = () => {
  if (!newTask.title || !newTask.icon) return;
  
  // 使用store中的selectedDate
  const dateStr = store.selectedDate;
  
  // 创建任务对象
  const taskData: Partial<Task> = {
    title: newTask.title,
    icon: newTask.icon,
    isCompleted: false,
    date: dateStr
  };
  
  // 如果是持续任务，添加相关属性
  if (newTask.isDuration) {
    if (!newTask.durationEndDate) {
      alert('请选择结束日期');
      return;
    }
    
    taskData.isDuration = true;
    taskData.durationEndDate = newTask.durationEndDate;
    taskData.durationStatus = { [dateStr]: false }; // 初始化当天的状态
  }
  
  // 添加任务
  store.addTask(taskData);
  
  playSound(SoundType.TAP);
  showAddTaskDialog.value = false;
  newTask.title = '';
  newTask.icon = '';
  newTask.isDuration = false;
  newTask.durationEndDate = '';
};

// 切换任务完成状态
const toggleTask = (task: Task) => {
  const dateStr = store.selectedDate;
  let newStatus = false;
  
  if (task.isDuration) {
    // 对于持续任务，我们更新当前日期的完成状态
    const durationStatus = task.durationStatus || {};
    newStatus = !(durationStatus[dateStr] || false);
    
    // 更新当前日期的状态
    store.updateTask(task.id, {
      durationStatus: {
        ...durationStatus,
        [dateStr]: newStatus
      }
    });
  } else {
    // 对于普通任务，直接切换完成状态
    newStatus = !task.isCompleted;
    store.updateTask(task.id, {
      isCompleted: newStatus
    });
  }
  
  if (newStatus) {
    playSound(SoundType.TASK_COMPLETE);
    
    // 任务完成动画 (可以通过DOM操作实现)
    const taskElements = document.querySelectorAll(`.task-item`);
    taskElements.forEach(el => {
      if ((el as HTMLElement).textContent?.includes(task.title)) {
        el.classList.add('completion-animation');
        setTimeout(() => {
          el.classList.remove('completion-animation');
        }, 1000);
      }
    });
  } else {
    playSound(SoundType.TAP);
  }
};

// 删除任务
const deleteTask = (taskId: string) => {
  if (confirm('确定要删除这个任务吗？')) {
    store.deleteTask(taskId);
    playSound(SoundType.TAP);
  }
};

// 触发文件选择
const triggerIconUpload = () => {
  playSound(SoundType.TAP);
  if (iconFileInput.value) {
    iconFileInput.value.click();
  }
};

// 处理图标上传
const handleIconUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  
  const file = target.files[0];
  
  if (!file.type.match('image.*')) {
    alert('请选择图片文件');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataURL = e.target?.result as string;
    
    // 调整图像大小并保存
    resizeImage(dataURL, 48, 48).then(resizedDataURL => {
      // 保存自定义图标
      customIcons.value.push({
        url: resizedDataURL,
        data: resizedDataURL
      });
      
      // 保存到本地存储
      saveCustomIcons(customIcons.value);
      
      // 自动选择新上传的图标
      newTask.icon = `custom-${customIcons.value.length - 1}`;
      
      // 清空文件选择
      if (iconFileInput.value) {
        iconFileInput.value.value = '';
      }
    });
  };
  
  reader.readAsDataURL(file);
};

// 调整图像大小
const resizeImage = (dataURL: string, maxWidth: number, maxHeight: number): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round(height * maxWidth / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round(width * maxHeight / height);
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataURL;
  });
};

// 加载保存的自定义图标
onMounted(() => {
  const savedIcons = localStorage.getItem('custom-icons');
  if (savedIcons) {
    try {
      customIcons.value = JSON.parse(savedIcons);
    } catch (e) {
      console.error('加载自定义图标失败', e);
    }
  }
});
</script>

<style scoped>
.task-checklist {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: 1.2rem;
  margin-bottom: var(--spacing-md);
  color: #333;
}

.tasks-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.task-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  position: relative;
}

.task-item:hover {
  background-color: rgba(255, 249, 230, 0.7);
}

.task-completed {
  background-color: rgba(209, 245, 226, 0.3);
}

.checkbox-container {
  margin-right: var(--spacing-md);
}

.custom-checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid var(--color-mint-green);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-checkbox.checked {
  background-color: var(--color-mint-green);
}

.checkmark {
  color: #fff;
  font-size: 0.9rem;
  font-weight: bold;
}

.task-content {
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
}

.task-icon {
  width: 18px;
  height: 18px;
  margin-right: var(--spacing-sm);
}

.task-info {
  display: flex;
  flex-direction: column;
}

.task-title {
  font-size: 1rem;
}

.task-duration-badge {
  font-size: 0.75rem;
  color: var(--color-monet-blue);
  margin-top: 2px;
}

.task-duration {
  border-left: 3px solid var(--color-monet-blue);
}

.completed-text {
  text-decoration: line-through;
  opacity: 0.7;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #999;
  font-size: 1.2rem;
  cursor: pointer;
  padding: var(--spacing-xs);
  opacity: 0.5;
  transition: opacity 0.2s;
}

.delete-btn:hover {
  opacity: 1;
}

.add-task-btn {
  align-self: center;
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--color-cream-yellow);
  border: 2px dashed var(--color-mint-green);
  border-radius: var(--radius-md);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-task-btn:hover {
  background-color: var(--color-mint-green);
  color: #fff;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl) 0;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: var(--spacing-md);
}

.empty-text {
  color: #999;
  margin-bottom: var(--spacing-lg);
}

/* 添加任务弹窗 */
.add-task-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.dialog-content {
  width: 85%;
  max-width: 350px;
  background-color: var(--bg-paper);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.dialog-title {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  font-size: 1.3rem;
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-size: 0.9rem;
  color: #666;
}

.task-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 2px dashed var(--color-mint-green);
  border-radius: var(--radius-sm);
  background-color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
}

.icon-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm);
}

.icon-option {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #ddd;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.icon-option img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.icon-option.selected {
  background-color: var(--color-mint-green);
  border-color: var(--color-mint-green);
}

.icon-option.custom-icon {
  border-style: dotted;
}

.icon-option.add-icon {
  background-color: rgba(255, 255, 255, 0.5);
}

.icon-option.add-icon span {
  font-size: 24px;
  color: #999;
}

.hidden-file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
}

.task-type-selector {
  display: flex;
  gap: var(--spacing-sm);
}

.task-type-option {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-sm);
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px dashed #ddd;
  cursor: pointer;
  flex: 1;
  text-align: center;
  transition: all 0.2s;
}

.task-type-option.selected {
  background-color: var(--color-mint-green);
  color: #fff;
  border-color: var(--color-mint-green);
}

.date-input {
  font-family: var(--font-primary);
}

.dialog-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-lg);
}

.cancel-btn,
.confirm-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  cursor: pointer;
}

.cancel-btn {
  background-color: transparent;
  border: 1px solid #ddd;
  color: #666;
}

.confirm-btn {
  background-color: var(--color-cream-yellow);
  border: 1px solid var(--color-cream-yellow);
  color: #333;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 任务完成动画 */
@keyframes completion {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.completion-animation {
  animation: completion 0.5s ease;
}
</style>
