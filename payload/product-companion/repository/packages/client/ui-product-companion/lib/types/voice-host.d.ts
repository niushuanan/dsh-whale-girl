/** Host-only voice dictation processing owned by the product-companion plugin. */
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Context } from '@deepseek-ai/cordis';
/** Same-origin API prefix removed when the native plugin is disabled. */
export declare const VOICE_API_ROUTE = "/plugins/ui-product-companion/api/voice";
export interface VoiceModelView {
    id: string;
    name: string;
}
export interface VoiceModelGroupView {
    id: string;
    name: string;
    models: VoiceModelView[];
}
/** Local-only handler for model catalog and one-shot dictation cleanup. */
export declare function voiceApiHandler(ctx: Context, req: IncomingMessage, res: ServerResponse): Promise<void>;
//# sourceMappingURL=voice-host.d.ts.map