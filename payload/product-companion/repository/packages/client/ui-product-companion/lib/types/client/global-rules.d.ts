/** Browser transport for the companion-owned user-global AGENTS.md editor. */
export interface GlobalRulesDocument {
    path: string;
    displayPath: string;
    exists: boolean;
    content: string;
    revision: string;
}
export declare class GlobalRulesRequestError extends Error {
    readonly status: number;
    constructor(status: number, message: string);
}
/** Load the exact user-global AGENTS.md used by the instruction loader. */
export declare function loadGlobalRules(signal?: AbortSignal): Promise<GlobalRulesDocument>;
/** Save only when the revision loaded by the editor is still current. */
export declare function saveGlobalRules(document: Pick<GlobalRulesDocument, 'revision'> & {
    content: string;
}): Promise<GlobalRulesDocument>;
//# sourceMappingURL=global-rules.d.ts.map