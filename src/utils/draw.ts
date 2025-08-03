// 绘图工具函数

/**
 * 手绘涂鸦的配置项接口
 */
export interface DrawOptions {
    strokeColor: string;
    strokeWidth: number;
    isEraser: boolean;
}

/**
 * 手绘涂鸦点
 */
export interface DrawPoint {
    x: number;
    y: number;
    pressure?: number; // 压力值，用于支持手写笔
}

/**
 * 涂鸦路径
 */
export interface DrawPath {
    points: DrawPoint[];
    options: DrawOptions;
}

/**
 * 初始化画布
 * @param canvas Canvas元素
 * @returns 返回画布上下文
 */
export function initCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    // 设置画布大小为容器大小
    const container = canvas.parentElement;
    if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('无法获取画布上下文');
    }

    // 设置默认绘图样式
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    return ctx;
}

/**
 * 清空画布
 * @param ctx 画布上下文
 */
export function clearCanvas(ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * 绘制一条路径
 * @param ctx 画布上下文
 * @param path 涂鸦路径
 */
export function drawPath(ctx: CanvasRenderingContext2D, path: DrawPath): void {
    const { points, options } = path;
    if (points.length < 2) return;

    ctx.save();

    // 设置绘图样式
    if (options.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = options.strokeColor;
    }

    ctx.lineWidth = options.strokeWidth;

    // 开始绘制
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    // 使用二次贝塞尔曲线使线条更平滑
    for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        // 根据压力调整线宽（如果支持）
        if (p2.pressure !== undefined) {
            ctx.lineWidth = options.strokeWidth * p2.pressure;
        }

        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
    }

    // 连接到最后一个点
    const lastPoint = points[points.length - 1];
    ctx.lineTo(lastPoint.x, lastPoint.y);

    ctx.stroke();
    ctx.restore();
}

/**
 * 保存画布内容为图像
 * @param canvas 画布元素
 * @returns 图像的dataURL
 */
export function saveCanvasAsImage(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL('image/png');
}

/**
 * 在画布上添加贴纸
 * @param ctx 画布上下文
 * @param sticker 贴纸图像
 * @param x 贴纸位置x坐标
 * @param y 贴纸位置y坐标
 * @param scale 贴纸缩放比例
 */
export function addStickerToCanvas(
    ctx: CanvasRenderingContext2D,
    sticker: HTMLImageElement,
    x: number,
    y: number,
    scale: number = 1
): void {
    const width = sticker.width * scale;
    const height = sticker.height * scale;

    // 计算贴纸的位置，使贴纸中心点在指定位置
    const posX = x - width / 2;
    const posY = y - height / 2;

    ctx.drawImage(sticker, posX, posY, width, height);
}
