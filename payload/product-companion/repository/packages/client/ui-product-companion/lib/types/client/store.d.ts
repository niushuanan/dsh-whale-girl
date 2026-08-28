/** Persisted user choices for the global product companion. */
import { type EngineStoreHandle } from '@deepseek-ai/dsh-client-store';
export type CompanionSkin = 'blue' | 'black';
export type CompanionSize = 'standard' | 'large';
export type CompanionAction = 'none' | 'focusComposer' | 'voiceInput' | 'switchSide' | 'newSession' | 'menu' | 'close';
/** Default product-facing name. Technical plugin ids remain stable. */
export declare const DEFAULT_COMPANION_NAME = "\u9CB8\u5C11\u5973";
/** Read the saved product name before the slot-owned store first renders. */
export declare function persistedCompanionName(): string;
export interface CompanionPosition {
    x: number;
    y: number;
}
export interface CompanionPreferences {
    skin: CompanionSkin;
    /** Optional for records persisted before global naming was introduced. */
    displayName?: string;
    /** Optional for records persisted before the input-dock redesign. */
    visible?: boolean;
    /** Optional for records persisted before size selection was introduced. */
    size?: CompanionSize;
    /** Optional gesture bindings preserve compatible defaults for older records. */
    clickAction?: CompanionAction;
    doubleClickAction?: CompanionAction;
    contextAction?: CompanionAction;
    /** Horizontal berth on the composer card as a 0–1 ratio; absent keeps the default right berth. */
    composerOffsetRatio?: number;
    showStatus: boolean;
    autoTravel: boolean;
    /** Voice is a companion capability and disappears with this native plugin. */
    voiceEnabled?: boolean;
    voiceShortcut?: string;
}
type CompanionActions = {
    setDisplayName: (draft: CompanionPreferences, name: string) => void;
    setSkin: (draft: CompanionPreferences, skin: CompanionSkin) => void;
    setSize: (draft: CompanionPreferences, size: CompanionSize) => void;
    setVisible: (draft: CompanionPreferences, visible: boolean) => void;
    setClickAction: (draft: CompanionPreferences, action: CompanionAction) => void;
    setDoubleClickAction: (draft: CompanionPreferences, action: CompanionAction) => void;
    setContextAction: (draft: CompanionPreferences, action: CompanionAction) => void;
    setComposerOffsetRatio: (draft: CompanionPreferences, ratio: number) => void;
    setShowStatus: (draft: CompanionPreferences, enabled: boolean) => void;
    setAutoTravel: (draft: CompanionPreferences, enabled: boolean) => void;
    setVoiceEnabled: (draft: CompanionPreferences, enabled: boolean) => void;
    setVoiceShortcut: (draft: CompanionPreferences, shortcut: string) => void;
};
export declare const DEFAULT_VOICE_SHORTCUT = "Alt+Space";
/** Declare the root-scoped persisted preference store. */
export declare function createCompanionStore(): EngineStoreHandle<CompanionPreferences, CompanionActions>;
export {};
//# sourceMappingURL=store.d.ts.map