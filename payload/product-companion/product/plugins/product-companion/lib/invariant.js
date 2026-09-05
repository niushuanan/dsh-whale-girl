//#region src/invariant.ts
const PACKAGE_NAME = "@deepseek-ai/dsh-client-ui-product-companion";
/** Cordis companion plugin name. */
const name = "client-ui-product-companion-invariant";
/** Service required before reserving package ownership. */
const inject = ["invariants"];
/**
* No runtime invariant: the overlay owns one effect-scoped slot entry and its
* persisted root store is governed by the shared client runtime.
*/
const install = () => {};
/** Register this package's invariant companion. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
