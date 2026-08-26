import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import { createCompanionStore } from './store.ts';
type ProductCompanionSettingsProps = PropsRuntime<'settings.section'> & PropsStore<ReturnType<typeof createCompanionStore>> & PropsLocale<'productCompanion'>;
/** Dedicated settings page for the cross-page companion. */
export declare function ProductCompanionSettings({ useStore, actions, setLabel, t }: ProductCompanionSettingsProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ProductCompanionSettings.d.ts.map