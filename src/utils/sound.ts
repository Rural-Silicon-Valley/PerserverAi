// 音效管理工具

// 音效类型常量
export const SoundType = {
    FLIP_PAGE: 'flip-page',
    WRITING: 'writing',
    TASK_COMPLETE: 'task-complete',
    STICKER_ADD: 'sticker-add',
    TAP: 'tap'
} as const

export type SoundType = typeof SoundType[keyof typeof SoundType];

// 缓存已加载的音频
const audioCache: Record<string, AudioBuffer> = {};
let audioContext: AudioContext | null = null;

/**
 * 初始化音频上下文（需要用户交互后调用）
 */
export function initAudio(): void {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
}

/**
 * 预加载音频文件
 * @param types 要预加载的音频类型列表
 */
export async function preloadSounds(types: SoundType[]): Promise<void> {
    if (!audioContext) {
        initAudio();
    }

    const loadPromises = types.map(type => loadSound(type));
    await Promise.all(loadPromises);
}

/**
 * 加载单个音效文件
 */
async function loadSound(type: SoundType): Promise<void> {
    if (!audioContext) return;

    try {
        const response = await fetch(`/src/assets/sounds/${type}.mp3`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioCache[type] = audioBuffer;
    } catch (error) {
        console.error(`Failed to load sound: ${type}`, error);
    }
}

/**
 * 播放指定类型的声音
 * @param type 声音类型
 * @param volume 音量（0-1）
 * @returns 
 */
export function playSound(type: SoundType, volume = 0.5): void {
    if (!audioContext) {
        initAudio();
        loadSound(type).then(() => playFromCache(type, volume));
        return;
    }

    if (audioCache[type]) {
        playFromCache(type, volume);
    } else {
        loadSound(type).then(() => playFromCache(type, volume));
    }
}

/**
 * 从缓存播放音频
 */
function playFromCache(type: SoundType, volume: number): void {
    if (!audioContext || !audioCache[type]) return;

    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = audioCache[type];
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start(0);
}
