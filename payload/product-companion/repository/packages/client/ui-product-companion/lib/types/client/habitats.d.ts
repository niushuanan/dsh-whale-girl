import type { CompanionHabitat, CompanionPosition } from './store.ts';
export interface HabitatAnchors {
    sidebar: CompanionPosition;
    header: CompanionPosition | null;
    composer: CompanionPosition | null;
}
/** Resolve a semantic home to the closest available product surface. */
export declare function resolveHabitat(habitat: CompanionHabitat, anchors: HabitatAnchors): Exclude<CompanionHabitat, 'free'>;
/** Snap a dropped character to a nearby real surface; otherwise keep it free. */
export declare function nearestHabitat(position: CompanionPosition, anchors: HabitatAnchors): CompanionHabitat;
//# sourceMappingURL=habitats.d.ts.map