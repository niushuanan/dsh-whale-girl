/**
 * Product companion, Host half: serves the generated sprite frames from the
 * same origin as the Web client. The browser half contributes the actual
 * cross-page companion through the shell overlay slot.
 */
import type { Context } from '@deepseek-ai/cordis';
/** Host route prefix for immutable companion frames. */
export declare const ASSET_ROUTE = "/plugins/ui-product-companion/assets";
/** Required host service. */
export declare const inject: string[];
/** Mount the asset route for the lifetime of this native plugin. */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map