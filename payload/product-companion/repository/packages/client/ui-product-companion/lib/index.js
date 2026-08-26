import { mkdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { join } from "node:path";
import { dshHomeDisplay, resolveDshHome } from "@deepseek-ai/dsh-home-paths";
//#region lib/types/global-rules-host.js
/** Host-only editor for the user-global AGENTS.md used by every DSH session. */
/** Same-origin API removed together with the native companion plugin. */
const GLOBAL_RULES_API_ROUTE = "/plugins/ui-product-companion/api/global-rules";
const GLOBAL_RULES_FILE = "AGENTS.md";
const MAX_RULES_BYTES = 1048576;
const MISSING_REVISION = "missing";
var GlobalRulesError = class extends Error {
	status;
	constructor(status, message) {
		super(message);
		this.status = status;
	}
};
function sendJson(res, status, body) {
	res.statusCode = status;
	res.setHeader("Content-Type", "application/json; charset=utf-8");
	res.setHeader("Cache-Control", "no-store");
	res.end(JSON.stringify(body));
}
function isLoopbackRequest(req) {
	const authority = req.headers.host ?? "";
	const host = authority.startsWith("[") ? authority.slice(1, authority.indexOf("]")) : authority.split(":")[0] ?? "";
	return host === "localhost" || host === "::1" || host.startsWith("127.");
}
function globalRulesLocation(dshHome = resolveDshHome()) {
	return {
		home: dshHome,
		path: join(dshHome, GLOBAL_RULES_FILE),
		displayPath: `${dshHomeDisplay(dshHome)}/${GLOBAL_RULES_FILE}`
	};
}
function revisionOf(content) {
	return createHash("sha256").update(content, "utf8").digest("hex");
}
async function readJson(req) {
	let size = 0;
	const chunks = [];
	for await (const chunk of req) {
		if (!Buffer.isBuffer(chunk) && typeof chunk !== "string") throw new GlobalRulesError(400, "invalid request body");
		const buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
		size += buffer.byteLength;
		if (size > 1056768) throw new GlobalRulesError(413, "global rules are too large");
		chunks.push(buffer);
	}
	try {
		return JSON.parse(Buffer.concat(chunks).toString("utf8"));
	} catch {
		throw new GlobalRulesError(400, "invalid JSON");
	}
}
function writeRequest(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) throw new GlobalRulesError(400, "invalid global rules request");
	const body = value;
	if (typeof body.content !== "string" || Buffer.byteLength(body.content, "utf8") > MAX_RULES_BYTES) throw new GlobalRulesError(413, "global rules are too large");
	if (typeof body.revision !== "string" || body.revision !== MISSING_REVISION && !/^[a-f0-9]{64}$/u.test(body.revision)) throw new GlobalRulesError(400, "invalid global rules revision");
	return {
		content: body.content,
		revision: body.revision
	};
}
async function readGlobalRules(dshHome) {
	const location = globalRulesLocation(dshHome);
	const info = await stat(location.path).catch((error) => {
		if (error.code === "ENOENT") return void 0;
		throw error;
	});
	if (info === void 0) return {
		path: location.path,
		displayPath: location.displayPath,
		exists: false,
		content: "",
		revision: MISSING_REVISION
	};
	if (!info.isFile() || info.size > MAX_RULES_BYTES) throw new GlobalRulesError(info.size > MAX_RULES_BYTES ? 413 : 400, "AGENTS.md is not an editable text file");
	const content = await readFile(location.path, "utf8");
	return {
		path: location.path,
		displayPath: location.displayPath,
		exists: true,
		content,
		revision: revisionOf(content)
	};
}
async function writeGlobalRules(body, dshHome) {
	if ((await readGlobalRules(dshHome)).revision !== body.revision) throw new GlobalRulesError(409, "AGENTS.md changed outside this editor; load the latest content before saving");
	const location = globalRulesLocation(dshHome);
	await mkdir(location.home, { recursive: true });
	const temporary = join(location.home, `.AGENTS.md.dsh-${randomUUID()}.tmp`);
	try {
		await writeFile(temporary, body.content, {
			encoding: "utf8",
			flag: "wx",
			mode: 420
		});
		await rename(temporary, location.path);
	} finally {
		await unlink(temporary).catch(() => void 0);
	}
	return {
		path: location.path,
		displayPath: location.displayPath,
		exists: true,
		content: body.content,
		revision: revisionOf(body.content)
	};
}
/** Read and update only the fixed user-global AGENTS.md on loopback. */
async function globalRulesApiHandler(req, res, dshHome) {
	if (!isLoopbackRequest(req)) {
		sendJson(res, 403, { error: "global rules are available only on this computer" });
		return;
	}
	if (new URL(req.url ?? "/", "http://127.0.0.1").pathname !== "/plugins/ui-product-companion/api/global-rules") {
		sendJson(res, 404, { error: "not found" });
		return;
	}
	try {
		if (req.method === "GET") {
			sendJson(res, 200, await readGlobalRules(dshHome));
			return;
		}
		if (req.method === "PUT" && (req.headers["content-type"] ?? "").startsWith("application/json")) {
			sendJson(res, 200, await writeGlobalRules(writeRequest(await readJson(req)), dshHome));
			return;
		}
		sendJson(res, 405, { error: "GET or JSON PUT required" });
	} catch (error) {
		sendJson(res, error instanceof GlobalRulesError ? error.status : 500, { error: error instanceof Error ? error.message : String(error) });
	}
}
//#endregion
//#region lib/types/index.js
/**
* Product companion, Host half: serves the generated sprite frames from the
* same origin as the Web client. The browser half contributes the actual
* cross-page companion through the shell overlay slot.
*/
/** Host route prefix for immutable companion frames. */
const ASSET_ROUTE = "/plugins/ui-product-companion/assets";
const FRAME_COUNTS = {
	lounge: 20,
	portal: 12,
	focus: 12,
	waiting: 12,
	success: 12
};
const FRAME_NAMES = new Set(["blue", "black"].flatMap((skin) => Object.entries(FRAME_COUNTS).flatMap(([clip, count]) => Array.from({ length: count }, (_, index) => `v14/${skin}-${clip}-${String(index + 1).padStart(2, "0")}.png`))));
for (const skin of ["blue", "black"]) for (let index = 1; index <= 20; index += 1) FRAME_NAMES.add(`v9/${skin}-portal-effect-${String(index).padStart(2, "0")}.png`);
for (let index = 1; index <= 48; index += 1) {
	const suffix = String(index).padStart(2, "0");
	FRAME_NAMES.add(`v13/body-mask-${suffix}.png`);
	FRAME_NAMES.add(`v13/fragment-mask-${suffix}.png`);
}
/** Required host service. */
const inject = ["webServer"];
function sendText(res, status, body) {
	res.statusCode = status;
	res.setHeader("Content-Type", "text/plain; charset=utf-8");
	res.end(body);
}
/** Serve one whitelisted frame; paths never reach the filesystem unchecked. */
async function handler(req, res) {
	if (req.method !== "GET") {
		sendText(res, 405, "method not allowed");
		return;
	}
	const name = new URL(req.url ?? "/", "http://127.0.0.1").pathname.slice(37);
	if (!FRAME_NAMES.has(name)) {
		sendText(res, 404, "not found");
		return;
	}
	try {
		const data = await readFile(new URL(`../assets/${name}`, import.meta.url));
		res.statusCode = 200;
		res.setHeader("Content-Type", "image/png");
		res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
		res.end(data);
	} catch {
		sendText(res, 404, "not found");
	}
}
/** Mount the asset route for the lifetime of this native plugin. */
function apply(ctx) {
	ctx.effect(() => {
		const disposeAssets = ctx.webServer.register({
			kind: "prefix",
			path: ASSET_ROUTE,
			handler
		});
		const disposeGlobalRules = ctx.webServer.register({
			kind: "prefix",
			path: GLOBAL_RULES_API_ROUTE,
			handler: (req, res) => {
				globalRulesApiHandler(req, res);
			}
		});
		return () => {
			disposeGlobalRules();
			disposeAssets();
		};
	}, "ui-product-companion: generated assets and global rules API");
}
//#endregion
export { ASSET_ROUTE, apply, inject };
