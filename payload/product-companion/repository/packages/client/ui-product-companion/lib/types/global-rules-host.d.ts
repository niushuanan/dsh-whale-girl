/** Host-only editor for the user-global AGENTS.md used by every DSH session. */
import type { IncomingMessage, ServerResponse } from 'node:http';
/** Same-origin API removed together with the native companion plugin. */
export declare const GLOBAL_RULES_API_ROUTE = "/plugins/ui-product-companion/api/global-rules";
export interface GlobalRulesView {
    path: string;
    displayPath: string;
    exists: boolean;
    content: string;
    revision: string;
}
/** Read and update only the fixed user-global AGENTS.md on loopback. */
export declare function globalRulesApiHandler(req: IncomingMessage, res: ServerResponse, dshHome?: string): Promise<void>;
//# sourceMappingURL=global-rules-host.d.ts.map