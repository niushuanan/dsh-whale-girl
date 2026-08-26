import type { PendingInteractionStatus, SessionId, SessionListState } from '@deepseek-ai/dsh-client-runtime/client';
export type CompanionBaseState = 'idle' | 'working' | 'waiting';
export interface CompanionActivity {
    state: CompanionBaseState;
    running: number;
    waiting: number;
    focusTitle: string | null;
    latestUpdate: number;
}
export interface CompanionTask {
    id: SessionId;
    title: string;
    current: boolean;
    status: 'working' | PendingInteractionStatus;
    updatedAt: number;
}
/**
 * Project every live or attention-blocked conversation into one compact switcher row.
 * Attention comes first, followed by the open conversation and then the freshest work.
 */
export declare function deriveCompanionTasks(sessions: SessionListState): CompanionTask[];
/** Derive one calm companion state from the same session facts visible in the sidebar. */
export declare function deriveCompanionActivity(sessions: SessionListState): CompanionActivity;
//# sourceMappingURL=activity.d.ts.map