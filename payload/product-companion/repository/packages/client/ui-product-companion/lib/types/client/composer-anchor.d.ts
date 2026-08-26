/** Horizontal geometry that pins the companion to the composer card. */
export interface ComposerRect {
    readonly left: number;
    readonly width: number;
}
/** Side insets keep the silhouette off the card's rounded corners. */
export declare const COMPOSER_LEFT_INSET = 6;
export declare const COMPOSER_RIGHT_INSET = 14;
/**
 * Map a persisted 0–1 offset ratio to the companion's left edge: 0 hugs the
 * composer's left inset, 1 the right inset (the historical default berth).
 * A card narrower than the character parks at the left inset.
 *
 * @param ratio - Persisted horizontal offset as a 0–1 fraction of usable width.
 * @param composer - Visible composer card rectangle.
 * @param petWidth - Rendered companion width in pixels.
 * @returns The companion's left edge in viewport pixels.
 */
export declare function composerXForRatio(ratio: number, composer: ComposerRect, petWidth: number): number;
/**
 * Inverse of {@link composerXForRatio}: derive the persisted ratio from a left
 * edge the user dragged to, clamped into the usable span.
 *
 * @param x - Proposed companion left edge in viewport pixels.
 * @param composer - Visible composer card rectangle.
 * @param petWidth - Rendered companion width in pixels.
 * @returns The clamped 0–1 offset ratio to persist.
 */
export declare function composerRatioForX(x: number, composer: ComposerRect, petWidth: number): number;
/**
 * Keep the authored lounge silhouette touching the composer's top border
 * without covering its text.
 *
 * @param top - Composer card top edge in viewport pixels.
 * @param petHeight - Rendered companion height in pixels.
 * @param bottomInset - Authored overlap of the transparent canvas edge.
 * @returns The companion's top edge in viewport pixels.
 */
export declare function composerYForTop(top: number, petHeight: number, bottomInset: number): number;
//# sourceMappingURL=composer-anchor.d.ts.map