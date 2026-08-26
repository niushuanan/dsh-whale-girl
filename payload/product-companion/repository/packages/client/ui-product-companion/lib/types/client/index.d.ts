/** Browser half of the native cross-page product companion plugin. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type CompanionLocaleKey } from './locales.ts';
export { ProductCompanion, companionDissolveMaskUrl, companionFrameUrl, type CompanionVisualState, type ProductCompanionInjected, } from './ProductCompanion.tsx';
export type { CompanionAssetClip, CompanionTrackName } from './animation.ts';
export { ProductCompanionSettings } from './ProductCompanionSettings.tsx';
export { deriveCompanionActivity, deriveCompanionTasks, type CompanionActivity, type CompanionBaseState, type CompanionTask, } from './activity.ts';
export type { CompanionAction, CompanionSize, CompanionSkin, CompanionPosition, CompanionPreferences, } from './store.ts';
export { DEFAULT_COMPANION_NAME, DEFAULT_VOICE_SHORTCUT, persistedCompanionName, } from './store.ts';
export { insertVoiceText, matchesVoiceShortcut, useVoiceInput, type VoiceStage } from './voice-input.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Cross-page product companion copy. */
        productCompanion: CompanionLocaleKey;
    }
}
/** Runtime, locale and layout slot services required by the companion. */
export declare const inject: string[];
/** Register one additive, root-scoped companion above every product page. */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map