/** Host-only editor for the active project's AGENTS.md, owned by the companion plugin. */
import type { IncomingMessage, ServerResponse } from 'node:http';
/** Same-origin API removed together with the native companion plugin. */
export declare const PROJECT_RULES_API_ROUTE = "/plugins/ui-product-companion/api/project-rules";
export interface ProjectRulesView {
    cwd: string;
    path: string;
    exists: boolean;
    content: string;
    revision: string;
}
/** Read, create, and update only the fixed AGENTS.md at a loopback project's root. */
export declare function projectRulesApiHandler(req: IncomingMessage, res: ServerResponse): Promise<void>;
//# sourceMappingURL=project-rules-host.d.ts.map