// 日期处理工具

/**
 * 获取当前月份的所有日期
 * @param year 年份
 * @param month 月份（0-11）
 * @returns 月份中的所有日期对象
 */
export function getDaysInMonth(year: number, month: number): Date[] {
    const days: Date[] = [];
    const lastDay = new Date(year, month + 1, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
        days.push(new Date(year, month, day));
    }

    return days;
}

/**
 * 获取日历网格所需的完整日期数组（包含上月和下月的部分日期）
 * @param year 年份
 * @param month 月份（0-11）
 * @returns 完整日历视图的日期对象数组
 */
export function getCalendarDays(year: number, month: number): Date[] {
    const days = getDaysInMonth(year, month);
    const firstDayOfWeek = days[0].getDay(); // 0是周日

    // 添加上月的日期
    const prevMonthDays: Date[] = [];
    if (firstDayOfWeek > 0) {
        const lastDayOfPrevMonth = new Date(year, month, 0).getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            prevMonthDays.push(new Date(year, month - 1, lastDayOfPrevMonth - i));
        }
    }

    // 添加下月的日期，始终显示6行（42天），无论当月有多少天
    const totalCurrentDays = prevMonthDays.length + days.length;
    const nextMonthDays: Date[] = [];
    const daysNeeded = 42 - totalCurrentDays; // 6行×7列=42

    for (let i = 1; i <= daysNeeded; i++) {
        nextMonthDays.push(new Date(year, month + 1, i));
    }

    return [...prevMonthDays, ...days, ...nextMonthDays];
}

/**
 * 格式化日期为YYYY-MM-DD字符串
 * @param date 日期对象
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 获取两个日期对象是否是同一天
 * @param date1 日期对象1
 * @param date2 日期对象2
 * @returns 是否是同一天
 */
export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

/**
 * 获取中文星期表示
 * @param day 星期几（0-6）
 * @returns 中文星期
 */
export function getChineseWeekday(day: number): string {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return weekdays[day];
}

/**
 * 获取友好的日期描述
 * @param date 日期对象
 * @returns 友好描述，如"今天"、"明天"等
 */
export function getFriendlyDateDesc(date: Date): string {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (isSameDay(date, today)) {
        return '今天';
    } else if (isSameDay(date, tomorrow)) {
        return '明天';
    } else if (isSameDay(date, yesterday)) {
        return '昨天';
    }

    return `${date.getMonth() + 1}月${date.getDate()}日`;
}
