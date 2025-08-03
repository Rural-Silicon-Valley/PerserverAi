// 本地存储工具

/**
 * 任务类型
 */
export interface Task {
    id: string;
    title: string;
    icon: string;
    isCompleted: boolean;
    date: string; // YYYY-MM-DD格式
    completedTime?: string;
    isDuration?: boolean; // 是否是持续任务
    durationEndDate?: string; // 持续结束日期 YYYY-MM-DD格式
    durationStatus?: { [date: string]: boolean }; // 按日期记录持续任务的完成状态
}

/**
 * 日记条目
 */
export interface DiaryEntry {
    id: string;
    date: string; // YYYY-MM-DD格式
    content: string;
    mood?: string; // 心情
    weather?: string; // 天气
    drawingImageData?: string; // 手绘图片的 data URL
    stickers?: Array<{
        id: string;
        imageUrl: string;
        x: number;
        y: number;
        scale: number;
    }>;
    createdAt: string;
    updatedAt: string;
}

/**
 * 存储键名
 */
const STORAGE_KEYS = {
    TASKS: 'stable-thought:tasks',
    DIARY_ENTRIES: 'stable-thought:diary-entries',
    THEME: 'stable-thought:theme',
    USER_SETTINGS: 'stable-thought:user-settings',
    CUSTOM_ICONS: 'stable-thought:custom-icons'
};

/**
 * 保存数据到本地存储
 * @param key 存储键名
 * @param data 要存储的数据
 */
export function saveToStorage<T>(key: string, data: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('保存数据到本地存储失败', error);
    }
}

/**
 * 从本地存储获取数据
 * @param key 存储键名
 * @param defaultValue 默认值
 * @returns 存储的数据或默认值
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('从本地存储获取数据失败', error);
        return defaultValue;
    }
}

/**
 * 保存任务列表
 * @param tasks 任务列表
 */
export function saveTasks(tasks: Task[]): void {
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
}

/**
 * 获取任务列表
 * @returns 任务列表
 */
export function getTasks(): Task[] {
    return getFromStorage<Task[]>(STORAGE_KEYS.TASKS, []);
}

/**
 * 获取指定日期的任务
 * @param date YYYY-MM-DD格式的日期
 * @returns 指定日期的任务列表
 */
export function getTasksByDate(date: string): Task[] {
    const allTasks = getTasks();
    return allTasks.filter(task => task.date === date);
}

/**
 * 保存日记条目
 * @param entries 日记条目列表
 */
export function saveDiaryEntries(entries: DiaryEntry[]): void {
    saveToStorage(STORAGE_KEYS.DIARY_ENTRIES, entries);
}

/**
 * 获取所有日记条目
 * @returns 日记条目列表
 */
export function getDiaryEntries(): DiaryEntry[] {
    return getFromStorage<DiaryEntry[]>(STORAGE_KEYS.DIARY_ENTRIES, []);
}

/**
 * 获取指定日期的日记
 * @param date YYYY-MM-DD格式的日期
 * @returns 指定日期的日记，不存在则返回undefined
 */
export function getDiaryByDate(date: string): DiaryEntry | undefined {
    const entries = getDiaryEntries();
    return entries.find(entry => entry.date === date);
}

/**
 * 保存或更新单个日记条目
 * @param entry 日记条目
 */
export function saveDiaryEntry(entry: DiaryEntry): void {
    const entries = getDiaryEntries();
    const index = entries.findIndex(e => e.id === entry.id);

    if (index >= 0) {
        entries[index] = entry;
    } else {
        entries.push(entry);
    }

    saveDiaryEntries(entries);
}

/**
 * 保存主题设置
 * @param theme 主题名称
 */
export function saveTheme(theme: string): void {
    saveToStorage(STORAGE_KEYS.THEME, theme);
}

/**
 * 获取当前主题
 * @returns 当前主题名称
 */
export function getTheme(): string {
    return getFromStorage<string>(STORAGE_KEYS.THEME, 'default');
}

/**
 * 保存用户设置
 * @param settings 用户设置对象
 */
export function saveUserSettings(settings: Record<string, any>): void {
    saveToStorage(STORAGE_KEYS.USER_SETTINGS, settings);
}

/**
 * 获取用户设置
 * @returns 用户设置对象
 */
export function getUserSettings(): Record<string, any> {
    return getFromStorage<Record<string, any>>(STORAGE_KEYS.USER_SETTINGS, {});
}

/**
 * 自定义图标类型
 */
export interface CustomIcon {
    url: string;  // 图标的数据URL
    data: string; // 图标的base64数据
}

/**
 * 保存自定义图标
 * @param icons 自定义图标数组
 */
export function saveCustomIcons(icons: CustomIcon[]): void {
    saveToStorage(STORAGE_KEYS.CUSTOM_ICONS, icons);
}

/**
 * 获取自定义图标
 * @returns 自定义图标数组
 */
export function getCustomIcons(): CustomIcon[] {
    return getFromStorage<CustomIcon[]>(STORAGE_KEYS.CUSTOM_ICONS, []);
}
