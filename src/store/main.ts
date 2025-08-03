// Pinia 状态管理
import { defineStore } from 'pinia';
import type { Task, DiaryEntry } from '../utils/storage';
import { getTasks, saveTasks, getDiaryEntries, saveDiaryEntries } from '../utils/storage';
import { formatDate } from '../utils/date';

export const useMainStore = defineStore('main', {
    state: () => ({
        tasks: [] as Task[],
        diaryEntries: [] as DiaryEntry[],
        currentDate: new Date(),
        isDetailOpen: false,
        selectedDate: formatDate(new Date()), // 当前选中日期，默认今天
        theme: 'default', // 当前主题
        loading: false,
    }),

    getters: {
        // 获取当前选中日期的任务
        currentDateTasks(): Task[] {
            const dateStr = formatDate(new Date(this.selectedDate));
            return this.tasks.filter(task => task.date === dateStr);
        },

        // 获取当前选中日期的日记
        currentDateDiary(): DiaryEntry | undefined {
            const dateStr = formatDate(new Date(this.selectedDate));
            return this.diaryEntries.find(entry => entry.date === dateStr);
        },

        // 获取本月已完成任务数量
        currentMonthCompletedTasksCount(): number {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            return this.tasks.filter(task => {
                const taskDate = new Date(task.date);
                return task.isCompleted &&
                    taskDate >= startOfMonth &&
                    taskDate <= endOfMonth;
            }).length;
        },

        // 获取本月已写日记的天数
        currentMonthDiaryDaysCount(): number {
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();

            return this.diaryEntries.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate.getFullYear() === currentYear &&
                    entryDate.getMonth() === currentMonth;
            }).length;
        }
    },

    actions: {
        // 初始化从本地存储加载数据
        initData() {
            this.loading = true;
            this.tasks = getTasks();
            this.diaryEntries = getDiaryEntries();
            this.loading = false;
        },

        // 选择日期
        selectDate(date: Date | string) {
            if (date instanceof Date) {
                this.selectedDate = formatDate(date);
            } else {
                this.selectedDate = date;
            }
            this.isDetailOpen = true;
        },

        // 关闭日期详情
        closeDetail() {
            this.isDetailOpen = false;
        },

        // 添加新任务
        addTask(task: Omit<Task, 'id'>) {
            const id = `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            const newTask: Task = {
                ...task,
                id,
            };

            this.tasks.push(newTask);
            saveTasks(this.tasks);
        },

        // 更新任务
        updateTask(taskId: string, updates: Partial<Task>) {
            const index = this.tasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
                this.tasks[index] = {
                    ...this.tasks[index],
                    ...updates,
                    ...(updates.isCompleted ? { completedTime: new Date().toISOString() } : {})
                };
                saveTasks(this.tasks);
            }
        },

        // 删除任务
        deleteTask(taskId: string) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            saveTasks(this.tasks);
        },

        // 保存日记
        saveDiary(entry: Partial<DiaryEntry>) {
            const now = new Date().toISOString();
            const dateStr = entry.date || this.selectedDate;

            // 查找是否已存在该日期的日记
            const existingIndex = this.diaryEntries.findIndex(e => e.date === dateStr);

            if (existingIndex !== -1) {
                // 更新已有日记
                this.diaryEntries[existingIndex] = {
                    ...this.diaryEntries[existingIndex],
                    ...entry,
                    updatedAt: now
                };
            } else {
                // 创建新日记
                const newEntry: DiaryEntry = {
                    id: `diary_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    date: dateStr,
                    content: entry.content || '',
                    mood: entry.mood || '',
                    weather: entry.weather || '',
                    drawingImageData: entry.drawingImageData || '',
                    stickers: entry.stickers || [],
                    createdAt: now,
                    updatedAt: now
                };

                this.diaryEntries.push(newEntry);
            }

            // 保存到本地存储
            saveDiaryEntries(this.diaryEntries);
        },

        // 设置主题
        setTheme(theme: string) {
            this.theme = theme;
        }
    }
});
