/** Browser-side transport for the companion-owned project AGENTS.md editor. */
export interface ProjectRulesDocument {
    cwd: string;
    path: string;
    exists: boolean;
    content: string;
    revision: string;
}
export declare class ProjectRulesRequestError extends Error {
    readonly status: number;
    constructor(status: number, message: string);
}
/** Load the fixed AGENTS.md in one absolute project directory. */
export declare function loadProjectRules(cwd: string, signal?: AbortSignal): Promise<ProjectRulesDocument>;
/** Save an AGENTS.md only when the revision the editor loaded is still current. */
export declare function saveProjectRules(document: Pick<ProjectRulesDocument, 'cwd' | 'revision'> & {
    content: string;
}): Promise<ProjectRulesDocument>;
//# sourceMappingURL=project-rules.d.ts.map