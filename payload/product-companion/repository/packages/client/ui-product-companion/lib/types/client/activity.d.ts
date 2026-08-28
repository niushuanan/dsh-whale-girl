import type { SessionListState } from '@deepseek-ai/dsh-api-session-controller/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { SessionPendingInteractionSnapshot } from '@deepseek-ai/dsh-client-ui-session/client';
export type PendingInteractionStatus = 'approval' | 'plan-review' | 'question';
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
export declare function deriveCompanionTasks(sessions: SessionListState, interactions?: SessionPendingInteractionSnapshot): CompanionTask[];
/** Derive one calm companion state from the same session facts visible in the sidebar. */
export declare function deriveCompanionActivity(sessions: SessionListState, interactions?: SessionPendingInteractionSnapshot): CompanionActivity;
//# sourceMappingURL=activity.d.ts.map