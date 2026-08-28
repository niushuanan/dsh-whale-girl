import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { UseSessionPendingInteraction } from '@deepseek-ai/dsh-client-ui-session/client';
import { type CompanionAssetClip } from './animation.ts';
import { createCompanionStore, type CompanionSkin } from './store.ts';
export type CompanionVisualState = 'idle' | 'working' | 'waiting' | 'success' | 'sleep';
type ProductCompanionProps = Omit<PropsRuntime<'shell.overlay'>, 'useSessionPendingInteraction'> & {
    useSessionPendingInteraction?: UseSessionPendingInteraction;
} & PropsStore<ReturnType<typeof createCompanionStore>> & PropsLocale<'productCompanion'> & ProductCompanionInjected;
export interface ProductCompanionInjected {
    /** Reuse the shell's current-workspace-aware New Session action. */
    startSession?: () => void;
    /** Reuse the session runtime's canonical navigation path. */
    openSession?: (id: SessionId) => void;
}
/** Public and testable frame URL contract. */
export declare function companionFrameUrl(skin: CompanionSkin, clip: CompanionAssetClip, frame?: number): string;
/** Public URL contract for masks applied directly to the current character bitmap. */
export declare function companionDissolveMaskUrl(kind: 'body' | 'fragment', frame?: number): string;
/** Global product companion, mounted once above all app columns. */
export declare function ProductCompanion({ useSessions, useSessionPendingInteraction, useStore, actions, startSession, openSession, t, }: ProductCompanionProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=ProductCompanion.d.ts.map