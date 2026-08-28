export type CompanionAssetClip = 'lounge' | 'portal' | 'focus' | 'waiting' | 'success';
export type CompanionTrackName = 'lounge' | 'dissolve' | 'focus' | 'waiting' | 'success' | 'sleep';
export interface CompanionTrack {
    asset: CompanionAssetClip;
    frames: readonly number[];
}
export interface CompanionFrameStep {
    frame: number;
    durationMs: number;
}
/**
 * Drawings use a 24 fps exposure sheet while the browser moves the complete
 * character on its display refresh loop. Quiet acting stays on twos or threes;
 * semantic loops expose their authored drawings on twos or threes.
 */
export declare const COMPANION_ANIMATION_FPS = 24;
export declare const COMPANION_FRAME_TICK_MS: number;
/** The persistent prone breathing loop above the composer. */
export declare const COMPANION_LOUNGE_SEQUENCE: readonly CompanionFrameStep[];
/**
 * Relocation keeps one authored character image at one fixed scale. Forty-eight
 * silhouette-derived material masks release that same bitmap from the outer
 * body edges into progressively smaller source-colored fragments; arrival
 * reverses the exact sequence. No independent foam or replacement character.
 */
export declare const COMPANION_DISSOLVE_PHASE_MS = 1040;
export declare const COMPANION_DISSOLVE_FRAME_COUNT = 48;
export declare function companionDissolveFrame(elapsedMs: number, reverse?: boolean): number;
/** Prone Agent-work loop with a small DeepSeek whale data pulse. */
export declare const COMPANION_FOCUS_SEQUENCE: readonly CompanionFrameStep[];
/** Prone attention loop used when the Agent needs the user. */
export declare const COMPANION_WAITING_SEQUENCE: readonly CompanionFrameStep[];
/** One prone wave and whale sparkle after a real task completes. */
export declare const COMPANION_SUCCESS_SEQUENCE: readonly CompanionFrameStep[];
export declare const COMPANION_SUCCESS_DURATION_MS: number;
export declare function companionSequenceFrame(sequence: readonly CompanionFrameStep[], elapsedMs: number, loop?: boolean): number;
/** Semantic states stay prone; geometry changes temporarily use body-material dissolution. */
export declare const COMPANION_TRACKS: Readonly<Record<CompanionTrackName, CompanionTrack>>;
export declare const COMPANION_ASSET_CLIPS: readonly CompanionAssetClip[];
export declare const COMPANION_ASSET_FRAME_COUNTS: Readonly<Record<CompanionAssetClip, number>>;
//# sourceMappingURL=animation.d.ts.map