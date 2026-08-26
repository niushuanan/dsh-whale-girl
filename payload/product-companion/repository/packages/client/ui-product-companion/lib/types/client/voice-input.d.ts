/** Browser-native microphone dictation. No model or AI processing is involved. */
import type { CompanionLocaleKey } from './locales.ts';
export type VoiceStage = 'idle' | 'listening' | 'error' | 'unsupported';
interface SpeechRecognitionAlternativeLike {
    transcript: string;
}
interface SpeechRecognitionResultLike {
    readonly isFinal: boolean;
    readonly length: number;
    readonly [index: number]: SpeechRecognitionAlternativeLike | undefined;
}
interface SpeechRecognitionEventLike {
    readonly results: {
        readonly length: number;
        readonly [index: number]: SpeechRecognitionResultLike | undefined;
    };
}
interface SpeechRecognitionErrorEventLike {
    readonly error: string;
}
interface SpeechRecognitionLike {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}
interface SpeechRecognitionConstructor {
    new (): SpeechRecognitionLike;
}
declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }
}
export interface VoiceInputPreferences {
    enabled: boolean;
    shortcut: string;
}
interface VoiceInputOptions {
    preferences: VoiceInputPreferences;
    t: (key: CompanionLocaleKey, params?: Record<string, unknown>) => string;
}
export interface VoiceInputState {
    stage: VoiceStage;
    liveText: string;
    feedback: string | null;
    supported: boolean;
    toggle: () => void;
}
/** Match one persisted, browser-local key chord without stealing unrelated typing. */
export declare function matchesVoiceShortcut(event: KeyboardEvent, shortcut: string): boolean;
/** Insert at the current selection through the native setter so React sees the input. */
export declare function insertVoiceText(text: string): boolean;
/** One microphone-recognition session at a time; unmount aborts it immediately. */
export declare function useVoiceInput({ preferences, t }: VoiceInputOptions): VoiceInputState;
export {};
//# sourceMappingURL=voice-input.d.ts.map