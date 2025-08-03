<!-- 手绘风格日历组件 -->
<template>
  <div class="hand-drawn-calendar paper-texture">
    <!-- 日历头部 月份和导航 -->
    <div class="calendar-header">
      <button class="nav-btn prev" @click="prevMonth">
        <div class="hand-arrow">❮</div>
      </button>
      <h2 class="month-title handwritten-text">{{ currentMonthText }}</h2>
      <button class="nav-btn next" @click="nextMonth">
        <div class="hand-arrow">❯</div>
      </button>
    </div>

    <!-- 星期表头 -->
    <div class="weekday-header">
      <div v-for="(day, index) in weekdays" :key="day" 
           class="weekday-cell"
           :style="{ color: weekdayColors[index] }">
        {{ day }}
      </div>
    </div>

    <!-- 日历主体 -->
    <div class="calendar-grid">
      <div 
        v-for="(date, index) in calendarDays" 
        :key="index" 
        class="date-cell"
        :class="{ 
          'other-month': date.getMonth() !== currentMonth,
          'today': isToday(date),
          'selected': isSelected(date),
          'has-task': hasTask(date),
          'has-diary': hasDiary(date),
          'task-completed': isTaskCompleted(date)
        }"
        @click="selectDate(date)"
      >
        <div class="date-number handwritten-text">{{ date.getDate() }}</div>
        
        <!-- 任务图标区域 -->
        <div 
          class="task-icons" 
          v-if="hasTask(date)"
          :class="{ 'has-more': getTasksForDate(date).length > 4 }"
          :data-count="getTasksForDate(date).length > 4 ? '+' + (getTasksForDate(date).length - 4) : ''"
        >
          <img 
            v-for="(task, idx) in getTasksForDate(date).slice(0, 4)" 
            :key="task.id"
            :src="getTaskIconUrl(task.icon)"
            class="task-icon"
            :class="{ 'completed': task.isCompleted }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getCalendarDays, formatDate, isSameDay, getChineseWeekday } from '../utils/date';
import type { Task, DiaryEntry, CustomIcon } from '../utils/storage';
import { useMainStore } from '../store/main';
import { SoundType, playSound } from '../utils/sound';
import { getCustomIcons } from '../utils/storage';

// Props
const props = defineProps<{
  // 可传入初始显示的月份
  initialMonth?: Date
}>();

// Store
const store = useMainStore();

// 状态
const currentMonth = ref(props.initialMonth?.getMonth() ?? new Date().getMonth());
const currentYear = ref(props.initialMonth?.getFullYear() ?? new Date().getFullYear());

// 周几表头 - 英文
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// 周几对应的颜色
const weekdayColors = ['var(--color-monet-red)', 'var(--color-monet-orange)', 'var(--color-monet-yellow)', 
                     'var(--color-monet-green)', 'var(--color-monet-cyan)', 'var(--color-monet-blue)', 
                     'var(--color-monet-purple)'];

// 自定义图标
const customIcons = ref<CustomIcon[]>([]);

// 计算属性
const calendarDays = computed(() => {
  return getCalendarDays(currentYear.value, currentMonth.value);
});

const currentMonthText = computed(() => {
  return `${currentYear.value}年${currentMonth.value + 1}月`;
});

// 方法
const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
  playSound(SoundType.FLIP_PAGE);
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
  playSound(SoundType.FLIP_PAGE);
};

const isToday = (date: Date) => {
  const today = new Date();
  return isSameDay(date, today);
};

const isSelected = (date: Date) => {
  return formatDate(date) === store.selectedDate;
};

const selectDate = (date: Date) => {
  playSound(SoundType.TAP);
  store.selectDate(date);
};

// 任务相关方法
const hasTask = (date: Date) => {
  const dateStr = formatDate(date);
  return store.tasks.some(task => task.date === dateStr);
};

const getTasksForDate = (date: Date) => {
  const dateStr = formatDate(date);
  return store.tasks.filter(task => task.date === dateStr);
};

const getTaskIconUrl = (iconName: string) => {
  // 检查是否是自定义图标
  if (iconName && iconName.startsWith('custom-')) {
    const index = parseInt(iconName.replace('custom-', ''));
    if (customIcons.value[index]) {
      return customIcons.value[index].url;
    }
    // 如果找不到自定义图标，返回一个默认图标
    return `/src/assets/images/icons/heart.svg`;
  }
  return `/src/assets/images/icons/${iconName}.svg`;
};

const isTaskCompleted = (date: Date) => {
  const dateStr = formatDate(date);
  return store.tasks.some(task => task.date === dateStr && task.isCompleted);
};

// 日记相关方法
const hasDiary = (date: Date) => {
  const dateStr = formatDate(date);
  return store.diaryEntries.some(entry => entry.date === dateStr);
};

// 生命周期
onMounted(() => {
  // 初始化加载数据
  if (store.tasks.length === 0) {
    store.initData();
  }
  
  // 加载自定义图标
  customIcons.value = getCustomIcons();
});
</script>

<style scoped>
.hand-drawn-calendar {
  width: 100%;
  height: 100%;
  min-height: 450px; /* 确保最小高度，无论月份如何 */
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  background-color: var(--bg-paper);
  display: flex;
  flex-direction: column;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.month-title {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
  flex-grow: 1;
  text-align: center;
  font-weight: bold;
}

.nav-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-mint-green);
  background-color: transparent;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: none;
}

.nav-btn:hover {
  background-color: rgba(209, 245, 226, 0.3);
  transform: translateY(-2px);
}

.nav-btn:active {
  transform: scale(0.92);
}

.hand-arrow {
  font-size: 1.2rem;
  color: var(--color-monet-green);
  line-height: 1;
}

.nav-btn:hover .hand-arrow {
  color: #333;
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: var(--spacing-sm);
}

.weekday-cell {
  text-align: center;
  padding: var(--spacing-xs) 0;
  font-size: 1rem;
  font-family: var(--font-handwritten-en);
  font-weight: bold;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
  flex: 1;
  gap: var(--spacing-xs);
  height: 0; /* 让网格高度由flex-grow决定 */
}

.date-cell {
  position: relative;
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs);
  background-color: rgba(255, 255, 255, 0.5);
  border: 1px dashed #ddd;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  aspect-ratio: 1;
  min-height: 0; /* 修复Firefox中固定高度的问题 */
}

.date-cell:hover {
  background-color: rgba(255, 249, 230, 0.8);
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}

.date-number {
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: var(--spacing-xs);
}

.other-month {
  opacity: 0.5;
}

.today {
  background-color: rgba(209, 245, 226, 0.3);
  border: 2px solid var(--color-mint-green);
}

.selected {
  background-color: rgba(255, 243, 214, 0.5);
  border: 2px solid var(--color-cream-yellow);
  transform: scale(1.05);
}

.task-icons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2px;
  max-height: 40px; /* 限制最大高度 */
  overflow: hidden; /* 超出部分隐藏 */
  position: relative; /* 为::after提供定位上下文 */
}

/* 当有更多图标时显示一个指示器 */
.task-icons:not(:empty)::after {
  content: attr(data-count);
  position: absolute;
  bottom: -5px;
  right: -2px;
  background-color: var(--color-monet-blue);
  color: white;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}

/* 只有当任务图标溢出时才显示指示器 */
.task-icons.has-more::after {
  opacity: 1;
}

.task-icon {
  width: 14px;
  height: 14px;
  opacity: 0.7;
  transition: all 0.2s;
}

.task-icon.completed {
  opacity: 1;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
}

.has-diary::after {
  content: '';
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-soft-pink);
}

.task-completed {
  background-color: rgba(255, 249, 230, 0.3);
}

/* 响应式调整 */
@media (max-width: 480px) {
  .hand-drawn-calendar {
    min-height: 380px; /* 移动端稍微降低最小高度 */
  }

  .calendar-grid {
    gap: 2px;
  }
  
  .date-cell {
    padding: 2px;
  }
  
  .date-number {
    font-size: 0.9rem;
  }
  
  .task-icon {
    width: 12px;
    height: 12px;
  }
  
  .weekday-cell {
    font-size: 0.8rem;
    font-weight: bold;
  }

  .hand-arrow {
    font-size: 1.2rem;
  }

  .nav-btn {
    width: 30px;
    height: 30px;
  }
}
</style>
