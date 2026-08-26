window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-product-companion",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region lib/types/client/activity.js
		/**
		* Project every live or attention-blocked conversation into one compact switcher row.
		* Attention comes first, followed by the open conversation and then the freshest work.
		*/
		function deriveCompanionTasks(sessions) {
			return sessions.ids.map((id) => sessions.byId[id]).filter((row) => row !== void 0 && (row.running || row.pendingInteraction !== void 0)).map((row) => ({
				id: row.id,
				title: row.displayTitle,
				current: row.id === sessions.current,
				status: row.pendingInteraction ?? "working",
				updatedAt: row.updatedAt
			})).sort((left, right) => {
				const leftNeedsAttention = left.status === "working" ? 0 : 1;
				const rightNeedsAttention = right.status === "working" ? 0 : 1;
				if (leftNeedsAttention !== rightNeedsAttention) return rightNeedsAttention - leftNeedsAttention;
				if (left.current !== right.current) return left.current ? -1 : 1;
				return right.updatedAt - left.updatedAt;
			});
		}
		/** Derive one calm companion state from the same session facts visible in the sidebar. */
		function deriveCompanionActivity(sessions) {
			const rows = sessions.ids.map((id) => sessions.byId[id]).filter((row) => row !== void 0);
			const waitingRows = rows.filter((row) => row.pendingInteraction !== void 0);
			const runningRows = rows.filter((row) => row.running);
			const current = sessions.current === void 0 ? void 0 : sessions.byId[sessions.current];
			const focus = current?.pendingInteraction !== void 0 ? current : waitingRows[0] ?? (current?.running === true ? current : runningRows[0]);
			return {
				state: waitingRows.length > 0 ? "waiting" : runningRows.length > 0 ? "working" : "idle",
				running: runningRows.length,
				waiting: waitingRows.length,
				focusTitle: focus?.displayTitle ?? null,
				latestUpdate: rows.reduce((latest, row) => Math.max(latest, row.updatedAt), 0)
			};
		}
		const COMPANION_FRAME_TICK_MS = 1e3 / 24;
		function exposure(frame, ticks = 2) {
			return {
				frame,
				durationMs: COMPANION_FRAME_TICK_MS * ticks
			};
		}
		/** The persistent prone breathing loop above the composer. */
		const COMPANION_LOUNGE_SEQUENCE = Array.from({ length: 20 }, (_, frame) => exposure(frame, frame % 5 === 0 ? 3 : 2));
		/**
		* Relocation keeps one authored character image at one fixed scale. Forty-eight
		* silhouette-derived material masks release that same bitmap from the outer
		* body edges into progressively smaller source-colored fragments; arrival
		* reverses the exact sequence. No independent foam or replacement character.
		*/
		const COMPANION_DISSOLVE_PHASE_MS = 1040;
		function companionDissolveFrame(elapsedMs, reverse = false) {
			const progress = Math.min(.999999, Math.max(0, elapsedMs) / COMPANION_DISSOLVE_PHASE_MS);
			const forward = Math.min(47, Math.floor(progress * 48));
			return reverse ? 47 - forward : forward;
		}
		/** Prone Agent-work loop with a small DeepSeek whale data pulse. */
		const COMPANION_FOCUS_SEQUENCE = Array.from({ length: 12 }, (_, frame) => exposure(frame, frame === 0 || frame === 11 ? 3 : 2));
		/** Prone attention loop used when the Agent needs the user. */
		const COMPANION_WAITING_SEQUENCE = Array.from({ length: 12 }, (_, frame) => exposure(frame, frame === 0 || frame === 11 ? 3 : 2));
		/** One prone wave and whale sparkle after a real task completes. */
		const COMPANION_SUCCESS_SEQUENCE = Array.from({ length: 12 }, (_, frame) => exposure(frame, frame === 0 || frame === 11 ? 3 : 2));
		COMPANION_SUCCESS_SEQUENCE.reduce((total, step) => total + step.durationMs, 0);
		function companionSequenceFrame(sequence, elapsedMs, loop = true) {
			const duration = sequence.reduce((total, step) => total + step.durationMs, 0);
			if (duration <= 0 || sequence.length === 0) return 0;
			let cursor = loop ? Math.max(0, elapsedMs) % duration : Math.min(Math.max(0, elapsedMs), Math.max(0, duration - 1));
			for (const step of sequence) {
				if (cursor < step.durationMs) return step.frame;
				cursor -= step.durationMs;
			}
			return sequence[0]?.frame ?? 0;
		}
		/** Semantic states stay prone; geometry changes temporarily use body-material dissolution. */
		const COMPANION_TRACKS = {
			lounge: {
				asset: "lounge",
				frames: COMPANION_LOUNGE_SEQUENCE.map((step) => step.frame)
			},
			dissolve: {
				asset: "lounge",
				frames: [0]
			},
			focus: {
				asset: "focus",
				frames: COMPANION_FOCUS_SEQUENCE.map((step) => step.frame)
			},
			waiting: {
				asset: "waiting",
				frames: COMPANION_WAITING_SEQUENCE.map((step) => step.frame)
			},
			success: {
				asset: "success",
				frames: COMPANION_SUCCESS_SEQUENCE.map((step) => step.frame)
			},
			sleep: {
				asset: "lounge",
				frames: [15]
			}
		};
		const COMPANION_ASSET_FRAME_COUNTS = {
			lounge: 20,
			portal: 12,
			focus: 12,
			waiting: 12,
			success: 12
		};
		//#endregion
		//#region lib/types/client/store.js
		/** Persisted user choices for the global product companion. */
		/** Default product-facing name. Technical plugin ids remain stable. */
		const DEFAULT_COMPANION_NAME = "鲸少女";
		const COMPANION_PERSIST_KEY = "dsh.product-companion";
		const LEGACY_AI_VOICE_KEYS = [
			"voiceProcessing",
			"voiceProvider",
			"voiceModel",
			"voiceInstruction",
			"voiceStats"
		];
		/** Remove retired AI voice settings without disturbing the user's companion choices. */
		function removeLegacyAiVoicePreferences() {
			if (typeof localStorage === "undefined") return;
			try {
				const raw = localStorage.getItem(COMPANION_PERSIST_KEY);
				if (raw === null) return;
				const parsed = JSON.parse(raw);
				if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return;
				const preferences = parsed;
				const cleaned = Object.fromEntries(Object.entries(preferences).filter(([key]) => !LEGACY_AI_VOICE_KEYS.includes(key)));
				if (Object.keys(cleaned).length !== Object.keys(preferences).length) localStorage.setItem(COMPANION_PERSIST_KEY, JSON.stringify(cleaned));
			} catch {}
		}
		/** Read the saved product name before the slot-owned store first renders. */
		function persistedCompanionName() {
			if (typeof localStorage === "undefined") return DEFAULT_COMPANION_NAME;
			try {
				const parsed = JSON.parse(localStorage.getItem(COMPANION_PERSIST_KEY) ?? "null");
				if (typeof parsed !== "object" || parsed === null) return DEFAULT_COMPANION_NAME;
				const displayName = parsed.displayName;
				return typeof displayName === "string" && displayName.trim().length > 0 ? displayName.trim() : DEFAULT_COMPANION_NAME;
			} catch {
				return DEFAULT_COMPANION_NAME;
			}
		}
		const DEFAULT_VOICE_SHORTCUT = "Alt+Space";
		/** Declare the root-scoped persisted preference store. */
		function createCompanionStore() {
			removeLegacyAiVoicePreferences();
			return (0, _deepseek_ai_dsh_client_runtime_client.defineStore)({
				init: () => ({
					skin: "blue",
					displayName: DEFAULT_COMPANION_NAME,
					visible: true,
					size: "large",
					clickAction: "focusComposer",
					doubleClickAction: "newSession",
					contextAction: "menu",
					position: null,
					home: "sidebar",
					showStatus: true,
					autoTravel: true,
					voiceEnabled: true,
					voiceShortcut: DEFAULT_VOICE_SHORTCUT
				}),
				persist: COMPANION_PERSIST_KEY,
				actions: {
					setDisplayName: (draft, name) => {
						draft.displayName = name.trim() || "鲸少女";
					},
					setSkin: (draft, skin) => {
						draft.skin = skin;
					},
					setSize: (draft, size) => {
						draft.size = size;
					},
					setVisible: (draft, visible) => {
						draft.visible = visible;
					},
					setClickAction: (draft, action) => {
						draft.clickAction = action;
					},
					setDoubleClickAction: (draft, action) => {
						draft.doubleClickAction = action;
					},
					setContextAction: (draft, action) => {
						draft.contextAction = action;
					},
					setPosition: (draft, position) => {
						draft.position = position;
						draft.home = "free";
					},
					setHome: (draft, home) => {
						draft.home = home;
						draft.position = null;
					},
					setShowStatus: (draft, enabled) => {
						draft.showStatus = enabled;
					},
					setAutoTravel: (draft, enabled) => {
						draft.autoTravel = enabled;
					},
					resetPosition: (draft) => {
						draft.home = "sidebar";
						draft.position = null;
					},
					setVoiceEnabled: (draft, enabled) => {
						draft.voiceEnabled = enabled;
					},
					setVoiceShortcut: (draft, shortcut) => {
						draft.voiceShortcut = shortcut || "Alt+Space";
					}
				}
			});
		}
		//#endregion
		//#region lib/types/client/voice-input.js
		/** Browser-native microphone dictation. No model or AI processing is involved. */
		function recognitionConstructor() {
			if (typeof window === "undefined") return void 0;
			return window.SpeechRecognition ?? window.webkitSpeechRecognition;
		}
		/** Match one persisted, browser-local key chord without stealing unrelated typing. */
		function matchesVoiceShortcut(event, shortcut) {
			const pieces = shortcut.split("+").filter(Boolean);
			const key = pieces.at(-1)?.toLowerCase();
			if (key === void 0) return false;
			const has = (name) => pieces.some((piece) => piece.toLowerCase() === name.toLowerCase());
			return (event.code === "Space" ? "space" : event.key.toLowerCase()) === key && event.metaKey === has("Meta") && event.ctrlKey === has("Control") && event.altKey === has("Alt") && event.shiftKey === has("Shift");
		}
		function composerTextarea() {
			return document.querySelector("[data-composer-card] textarea");
		}
		const SENTENCE_PUNCTUATION = /* @__PURE__ */ new Set("，。！？、；：,.!?;:");
		function startsWithPunctuation(value) {
			const first = value[0];
			return first !== void 0 && SENTENCE_PUNCTUATION.has(first);
		}
		/** Insert at the current selection through the native setter so React sees the input. */
		function insertVoiceText(text) {
			const input = composerTextarea();
			if (input === null) return false;
			const start = input.selectionStart;
			const end = input.selectionEnd;
			const prefix = input.value.slice(0, start);
			const suffix = input.value.slice(end);
			const needsLeadingSpace = prefix.length > 0 && !/\s$/.test(prefix) && !startsWithPunctuation(text);
			const needsTrailingSpace = suffix.length > 0 && !/^\s/.test(suffix) && !startsWithPunctuation(suffix) && !/\s$/.test(text);
			const inserted = `${needsLeadingSpace ? " " : ""}${text}${needsTrailingSpace ? " " : ""}`;
			const next = `${prefix}${inserted}${suffix}`;
			const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set?.bind(input);
			if (setter === void 0) input.value = next;
			else setter(next);
			input.dispatchEvent(new InputEvent("input", {
				bubbles: true,
				inputType: "insertText",
				data: inserted
			}));
			const caret = prefix.length + inserted.length;
			input.focus({ preventScroll: true });
			input.setSelectionRange(caret, caret);
			return true;
		}
		function transcriptOf(results) {
			const final = [];
			const interim = [];
			for (let index = 0; index < results.length; index += 1) {
				const result = results[index];
				const text = result?.[0]?.transcript.trim();
				if (result === void 0 || text === void 0 || text.length === 0) continue;
				if (result.isFinal) final.push(text);
				else interim.push(text);
			}
			return {
				final: final.join(" "),
				interim: interim.join(" ")
			};
		}
		function joinTranscript(...parts) {
			return parts.map((part) => part.trim()).filter(Boolean).join(" ");
		}
		const RECOGNITION_RESTART_DELAY_MS = 120;
		/** One microphone-recognition session at a time; unmount aborts it immediately. */
		function useVoiceInput({ preferences, t }) {
			const constructor = recognitionConstructor();
			const [stage, setStage] = (0, react.useState)(constructor === void 0 ? "unsupported" : "idle");
			const [liveText, setLiveText] = (0, react.useState)("");
			const [feedback, setFeedback] = (0, react.useState)(null);
			const recognitionRef = (0, react.useRef)(null);
			const listeningRequestedRef = (0, react.useRef)(false);
			const committedTranscriptRef = (0, react.useRef)("");
			const cycleTranscriptRef = (0, react.useRef)("");
			const feedbackTimer = (0, react.useRef)(null);
			const restartTimer = (0, react.useRef)(null);
			const mountedRef = (0, react.useRef)(true);
			const announce = (0, react.useCallback)((message, nextStage = "idle") => {
				if (!mountedRef.current) return;
				setFeedback(message);
				setStage(nextStage);
				if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current);
				feedbackTimer.current = setTimeout(() => {
					if (!mountedRef.current) return;
					setFeedback(null);
					if (nextStage === "error") setStage("idle");
				}, 2800);
			}, []);
			const commitCycle = (0, react.useCallback)(() => {
				committedTranscriptRef.current = joinTranscript(committedTranscriptRef.current, cycleTranscriptRef.current);
				cycleTranscriptRef.current = "";
				return committedTranscriptRef.current;
			}, []);
			const finish = (0, react.useCallback)(() => {
				const transcript = commitCycle();
				recognitionRef.current = null;
				listeningRequestedRef.current = false;
				committedTranscriptRef.current = "";
				cycleTranscriptRef.current = "";
				setLiveText("");
				if (transcript.length === 0) {
					announce(t("voice.noSpeech"), "error");
					return;
				}
				if (!insertVoiceText(transcript)) {
					announce(t("voice.composerMissing"), "error");
					return;
				}
				announce(t("voice.inserted"));
			}, [
				announce,
				commitCycle,
				t
			]);
			const start = (0, react.useCallback)(() => {
				if (!preferences.enabled) return;
				const Recognition = recognitionConstructor();
				if (Recognition === void 0) {
					setStage("unsupported");
					setFeedback(t("voice.unsupported"));
					return;
				}
				const recognition = new Recognition();
				recognition.lang = "zh-CN";
				recognition.continuous = true;
				recognition.interimResults = true;
				recognition.maxAlternatives = 1;
				listeningRequestedRef.current = true;
				committedTranscriptRef.current = "";
				cycleTranscriptRef.current = "";
				recognition.onresult = (event) => {
					const transcript = transcriptOf(event.results);
					cycleTranscriptRef.current = joinTranscript(transcript.final, transcript.interim);
					setLiveText(transcript.interim || transcript.final);
				};
				recognition.onerror = (event) => {
					if (event.error === "aborted") return;
					if (event.error === "no-speech" && listeningRequestedRef.current) return;
					listeningRequestedRef.current = false;
					recognitionRef.current = null;
					announce(t(event.error === "not-allowed" || event.error === "service-not-allowed" ? "voice.permissionDenied" : "voice.recognitionFailed"), "error");
				};
				recognition.onend = () => {
					if (recognitionRef.current !== recognition) return;
					if (!listeningRequestedRef.current) {
						finish();
						return;
					}
					commitCycle();
					setLiveText("");
					restartTimer.current = setTimeout(() => {
						restartTimer.current = null;
						if (!mountedRef.current || !listeningRequestedRef.current || recognitionRef.current !== recognition) return;
						try {
							recognition.start();
						} catch {
							finish();
						}
					}, RECOGNITION_RESTART_DELAY_MS);
				};
				recognitionRef.current = recognition;
				setFeedback(null);
				setLiveText("");
				setStage("listening");
				try {
					recognition.start();
				} catch {
					recognitionRef.current = null;
					announce(t("voice.recognitionFailed"), "error");
				}
			}, [
				announce,
				finish,
				preferences.enabled,
				t
			]);
			const toggle = (0, react.useCallback)(() => {
				if (listeningRequestedRef.current) {
					listeningRequestedRef.current = false;
					if (restartTimer.current !== null) {
						clearTimeout(restartTimer.current);
						restartTimer.current = null;
					}
					const recognition = recognitionRef.current;
					if (recognition === null) finish();
					else try {
						recognition.stop();
					} catch {
						finish();
					}
					return;
				}
				start();
			}, [finish, start]);
			(0, react.useEffect)(() => {
				if (!preferences.enabled) return;
				const onKeyDown = (event) => {
					if (event.repeat || document.querySelector("[data-voice-shortcut-recording]") !== null) return;
					if (!matchesVoiceShortcut(event, preferences.shortcut)) return;
					event.preventDefault();
					event.stopPropagation();
					toggle();
				};
				window.addEventListener("keydown", onKeyDown, true);
				return () => {
					window.removeEventListener("keydown", onKeyDown, true);
				};
			}, [
				preferences.enabled,
				preferences.shortcut,
				toggle
			]);
			(0, react.useEffect)(() => {
				if (preferences.enabled || !listeningRequestedRef.current) return;
				listeningRequestedRef.current = false;
				if (restartTimer.current !== null) {
					clearTimeout(restartTimer.current);
					restartTimer.current = null;
				}
				const recognition = recognitionRef.current;
				if (recognition === null) finish();
				else try {
					recognition.stop();
				} catch {
					finish();
				}
			}, [finish, preferences.enabled]);
			(0, react.useEffect)(() => {
				mountedRef.current = true;
				return () => {
					mountedRef.current = false;
					listeningRequestedRef.current = false;
					if (restartTimer.current !== null) clearTimeout(restartTimer.current);
					recognitionRef.current?.abort();
					if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current);
				};
			}, []);
			return {
				stage,
				liveText,
				feedback,
				supported: constructor !== void 0,
				toggle
			};
		}
		//#endregion
		//#region \0dsh-css:dsh-source/packages/client/ui-product-companion/src/client/ProductCompanion.module.css.mjs
		const css$1 = ".tjIJNa_root{--habitat-rotate:0deg;--habitat-scale:1;--habitat-x:0px;--companion-x:0px;--companion-y:0px;--pose-x:0px;--pose-y:10px;--pose-rotate:0deg;--pose-scale:1;--companion-width:132px;--companion-height:118px;--dissolve-phase-ms:.92s;--dissolve-frame-crossfade-ms:36ms;z-index:28;width:var(--companion-width);height:var(--companion-height);pointer-events:auto;user-select:none;transform:translate3d(var(--companion-x), var(--companion-y), 0);will-change:transform;contain:layout style;position:fixed;top:0;left:0}.tjIJNa_root[data-habitat=composer]{--habitat-rotate:0deg;--habitat-scale:1}.tjIJNa_character{width:var(--companion-width);height:var(--companion-height);cursor:pointer;touch-action:manipulation;background:0 0;border:0;outline:none;padding:0;display:block;position:relative}.tjIJNa_contextMenu{width:var(--companion-width);height:var(--companion-height)}.tjIJNa_contextMenu>[role=menu]{min-width:116px}.tjIJNa_poseLayer,.tjIJNa_motionLayer,.tjIJNa_spriteLayer{pointer-events:none;transform-origin:bottom;display:block;position:absolute;inset:0}.tjIJNa_poseLayer{transform:translate3d(var(--pose-x), var(--pose-y), 0) rotate(var(--pose-rotate)) scale(var(--pose-scale));will-change:transform;transition:transform .38s cubic-bezier(.2,.82,.24,1)}.tjIJNa_motionLayer{will-change:translate, rotate, scale}.tjIJNa_spriteLayer{transform:translate(var(--habitat-x), 0) rotate(var(--habitat-rotate)) scale(var(--habitat-scale));transition:transform .16s var(--ds-ease-out);backface-visibility:hidden}.tjIJNa_characterImage{width:var(--companion-width);height:var(--companion-height);object-fit:contain;object-position:center bottom;pointer-events:none;backface-visibility:hidden;image-rendering:auto;will-change:contents;display:block;position:absolute;inset:0;transform:translateZ(0)}.tjIJNa_materialDissolveLayer{pointer-events:none;backface-visibility:hidden;display:block;position:absolute;inset:0;transform:translateZ(0)}.tjIJNa_materialCurrent,.tjIJNa_materialPrevious,.tjIJNa_materialFragments{-webkit-mask-image:var(--companion-material-mask);mask-image:var(--companion-material-mask);-webkit-mask-position:bottom;mask-position:bottom;-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}.tjIJNa_materialCurrent{z-index:0}.tjIJNa_materialPrevious{z-index:1;animation:tjIJNa_material-mask-out var(--dissolve-frame-crossfade-ms) linear both}.tjIJNa_materialFragments{z-index:2;opacity:var(--companion-fragment-opacity,.78);filter:saturate(1.12)brightness(1.06);transform:translate3d(var(--companion-fragment-x,1px), var(--companion-fragment-y,-2px), 0)}.tjIJNa_root[data-track=lounge][data-motion=rest]{--pose-x:-2px;--pose-rotate:0deg;--pose-scale:1}.tjIJNa_root[data-track=lounge][data-motion=rest] .tjIJNa_motionLayer{animation:1.833s ease-in-out 80ms infinite tjIJNa_lounge-breathe}.tjIJNa_root[data-pose=sleep][data-motion=rest] .tjIJNa_motionLayer{animation:4.2s ease-in-out .2s infinite tjIJNa_sleep}.tjIJNa_root[data-track=waiting][data-motion=rest] .tjIJNa_motionLayer{animation:2.35s ease-in-out .1s infinite tjIJNa_waiting}.tjIJNa_root[data-track=success][data-motion=rest] .tjIJNa_motionLayer{animation:1.05s cubic-bezier(.18,.82,.2,1) both tjIJNa_respond}@keyframes tjIJNa_material-mask-out{0%{opacity:1}to{opacity:0}}.tjIJNa_bubble,.tjIJNa_taskPanel{left:50%;bottom:calc(var(--companion-height) - 8px);width:min(248px,100vw - 24px);position:absolute;transform:translate(-50%)}.tjIJNa_bubble{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-3);box-shadow:var(--dsw-shadow-lv1);animation:tjIJNa_bubble-in .18s var(--ds-ease-out) both;color:inherit;text-align:left;cursor:pointer;border-radius:13px;padding:8px 11px;display:block}div.tjIJNa_bubble{cursor:default;width:auto;max-width:180px}.tjIJNa_voiceBubble{cursor:default;width:auto;min-width:92px;max-width:min(240px,100vw - 24px)}.tjIJNa_voiceBubble .tjIJNa_taskMeta{white-space:normal}.tjIJNa_bubble:focus-visible,.tjIJNa_taskRow:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.tjIJNa_bubble:hover{background:var(--dsw-alias-bg-layer-2)}.tjIJNa_taskTitle,.tjIJNa_taskMeta{text-overflow:ellipsis;white-space:nowrap;display:block;overflow:hidden}.tjIJNa_taskTitle{color:var(--dsw-alias-label-primary);font-size:12px;font-weight:600;line-height:17px}.tjIJNa_taskMeta{color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:400;line-height:16px}.tjIJNa_taskPanel{overscroll-behavior:contain;scrollbar-width:thin;gap:6px;max-height:216px;padding:4px;display:grid;overflow:hidden auto}.tjIJNa_taskPanel[data-state=closing]{pointer-events:none}.tjIJNa_taskRow{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-3);width:100%;min-width:0;box-shadow:var(--dsw-shadow-lv1);text-align:left;cursor:pointer;transform-origin:bottom;transition:background-color .14s var(--ds-ease-out), border-color .14s var(--ds-ease-out);will-change:opacity, transform;border-radius:11px;padding:8px 10px;position:relative}.tjIJNa_taskPanel[data-state=open] .tjIJNa_taskRow{animation:tjIJNa_task-bubble-in .28s cubic-bezier(.2, .9, .24, 1.08) var(--task-enter-delay) both}.tjIJNa_taskPanel[data-state=closing] .tjIJNa_taskRow{animation:tjIJNa_task-bubble-out .17s cubic-bezier(.55, 0, .72, .35) var(--task-exit-delay) both}.tjIJNa_taskRow:hover,.tjIJNa_taskRow[data-current=true]{background:var(--dsw-alias-bg-module-platform)}.tjIJNa_taskRow[data-current=true] .tjIJNa_taskTitle{color:var(--dsw-alias-label-primary)}.tjIJNa_bubble:after{border-right:1px solid var(--dsw-alias-border-l1);border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-3);content:\"\";width:7px;height:7px;position:absolute;bottom:-4px;left:50%;transform:translate(-50%)rotate(45deg)}.tjIJNa_root[data-bubble-align=left] .tjIJNa_bubble,.tjIJNa_root[data-bubble-align=left] .tjIJNa_taskPanel{left:4px;transform:none}.tjIJNa_root[data-bubble-align=left] .tjIJNa_bubble:after{left:30px}.tjIJNa_root[data-bubble-align=right] .tjIJNa_bubble,.tjIJNa_root[data-bubble-align=right] .tjIJNa_taskPanel{left:auto;right:4px;transform:none}.tjIJNa_root[data-bubble-align=right] .tjIJNa_bubble:after{left:auto;right:30px;transform:rotate(45deg)}.tjIJNa_quickControls{z-index:4;transform-origin:top;will-change:opacity, transform;gap:5px;display:flex;position:absolute;bottom:-14px;left:50%;transform:translate(-50%)}.tjIJNa_root[data-teleport=departing] .tjIJNa_quickControls{pointer-events:none;animation:tjIJNa_companion-accessories-depart var(--dissolve-phase-ms) cubic-bezier(.42, 0, .58, 1) both}.tjIJNa_root[data-teleport=arriving] .tjIJNa_quickControls{pointer-events:none;animation:tjIJNa_companion-accessories-arrive var(--dissolve-phase-ms) cubic-bezier(.42, 0, .58, 1) both}.tjIJNa_quickControl{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-3);width:30px;height:30px;box-shadow:var(--dsw-shadow-lv1);color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border-radius:50%;place-items:center;padding:0;transition:border-color .12s,background-color .12s,box-shadow .12s;display:grid}.tjIJNa_quickControl:not(:disabled):hover{background:var(--dsw-alias-bg-module-platform);box-shadow:0 1px 4px #00000014}.tjIJNa_quickControl[data-control=voice],.tjIJNa_quickControl[data-control=voice]:not(:disabled):hover,.tjIJNa_quickControl[data-control=voice][data-active=true]{border-color:var(--dsw-alias-label-primary);background:var(--dsw-alias-label-primary);box-shadow:var(--dsw-shadow-lv1);color:var(--dsw-alias-bg-base)}.tjIJNa_quickControl:focus-visible{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 3px color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent);outline:0}.tjIJNa_quickControl[data-active=true] .tjIJNa_voiceIcon{animation:.9s ease-in-out infinite tjIJNa_voice-pulse}.tjIJNa_quickControl:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}.tjIJNa_taskCount{text-align:center;min-width:1ch;font-size:12px;font-weight:600;line-height:1}.tjIJNa_voiceIcon{background:currentColor;width:16px;height:16px;display:block;mask:url(data:image/svg+xml;base64,PHN2ZwogIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICB3aWR0aD0iMjQiCiAgaGVpZ2h0PSIyNCIKICB2aWV3Qm94PSIwIDAgMjQgMjQiCiAgZmlsbD0ibm9uZSIKICBzdHJva2U9ImN1cnJlbnRDb2xvciIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMiAxMHYzIiAvPgogIDxwYXRoIGQ9Ik02IDZ2MTEiIC8+CiAgPHBhdGggZD0iTTEwIDN2MTgiIC8+CiAgPHBhdGggZD0iTTE0IDh2NyIgLz4KICA8cGF0aCBkPSJNMTggNXYxMyIgLz4KICA8cGF0aCBkPSJNMjIgMTB2MyIgLz4KPC9zdmc+Cg==) 50%/contain no-repeat}.tjIJNa_srOnly{clip:rect(0, 0, 0, 0);white-space:nowrap;clip-path:inset(50%);width:1px;height:1px;position:absolute;overflow:hidden}@keyframes tjIJNa_bubble-in{0%{opacity:0;translate:0 3px}to{opacity:1;translate:0}}@keyframes tjIJNa_task-bubble-in{0%{opacity:0;transform:translateY(12px)scale(.94)}72%{opacity:1;transform:translateY(-1px)scale(1.008)}to{opacity:1;transform:translateY(0)scale(1)}}@keyframes tjIJNa_task-bubble-out{0%{opacity:1;transform:translateY(0)scale(1)}to{opacity:0;transform:translateY(10px)scale(.95)}}@keyframes tjIJNa_companion-accessories-depart{0%,8%{opacity:1;transform:translate(-50%)translateY(0)scale(1)}40%,to{opacity:0;transform:translate(-50%)translateY(-5px)scale(.88)}}@keyframes tjIJNa_companion-accessories-arrive{0%,38%{opacity:0;transform:translate(-50%)translateY(-5px)scale(.88)}88%,to{opacity:1;transform:translate(-50%)translateY(0)scale(1)}}@keyframes tjIJNa_sleep{0%,to{translate:0;rotate:0deg}50%{translate:-1px 1.5px;rotate:-.45deg}}@keyframes tjIJNa_waiting{0%,to{translate:0;rotate:0deg}38%{translate:0 -1px;rotate:-.25deg}66%{translate:1px -2px;rotate:.35deg}84%{translate:0 -1px;rotate:.1deg}}@keyframes tjIJNa_lounge-breathe{0%,to{translate:0;rotate:0deg}32%{translate:-1px -1px;rotate:-.25deg}58%{translate:1px -2px;rotate:.2deg}78%{translate:0 -1px;rotate:0deg}}@keyframes tjIJNa_respond{0%,to{translate:0;rotate:0deg}34%{translate:1px -2px;rotate:-.45deg}68%{translate:2px -3px;rotate:.7deg}88%{translate:1px -1px;rotate:.2deg}}@keyframes tjIJNa_voice-pulse{0%,to{opacity:.72;transform:scaleY(.82)}50%{opacity:1;transform:scaleY(1.08)}}@media (prefers-reduced-motion:reduce){.tjIJNa_characterImage,.tjIJNa_poseLayer,.tjIJNa_motionLayer,.tjIJNa_materialPrevious,.tjIJNa_bubble,.tjIJNa_taskRow,.tjIJNa_quickControl[data-active=true] .tjIJNa_voiceIcon{animation:none}.tjIJNa_taskPanel[data-state=closing]{visibility:hidden}.tjIJNa_poseLayer,.tjIJNa_spriteLayer{transition-duration:1ms}}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-product-companion/ProductCompanion.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-product-companion";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var ProductCompanion_module_css_default = {
			"bubble": "tjIJNa_bubble",
			"bubble-in": "tjIJNa_bubble-in",
			"character": "tjIJNa_character",
			"characterImage": "tjIJNa_characterImage",
			"companion-accessories-arrive": "tjIJNa_companion-accessories-arrive",
			"companion-accessories-depart": "tjIJNa_companion-accessories-depart",
			"contextMenu": "tjIJNa_contextMenu",
			"lounge-breathe": "tjIJNa_lounge-breathe",
			"material-mask-out": "tjIJNa_material-mask-out",
			"materialCurrent": "tjIJNa_materialCurrent",
			"materialDissolveLayer": "tjIJNa_materialDissolveLayer",
			"materialFragments": "tjIJNa_materialFragments",
			"materialPrevious": "tjIJNa_materialPrevious",
			"motionLayer": "tjIJNa_motionLayer",
			"poseLayer": "tjIJNa_poseLayer",
			"quickControl": "tjIJNa_quickControl",
			"quickControls": "tjIJNa_quickControls",
			"respond": "tjIJNa_respond",
			"root": "tjIJNa_root",
			"sleep": "tjIJNa_sleep",
			"spriteLayer": "tjIJNa_spriteLayer",
			"srOnly": "tjIJNa_srOnly",
			"task-bubble-in": "tjIJNa_task-bubble-in",
			"task-bubble-out": "tjIJNa_task-bubble-out",
			"taskCount": "tjIJNa_taskCount",
			"taskMeta": "tjIJNa_taskMeta",
			"taskPanel": "tjIJNa_taskPanel",
			"taskRow": "tjIJNa_taskRow",
			"taskTitle": "tjIJNa_taskTitle",
			"voice-pulse": "tjIJNa_voice-pulse",
			"voiceBubble": "tjIJNa_voiceBubble",
			"voiceIcon": "tjIJNa_voiceIcon",
			"waiting": "tjIJNa_waiting"
		};
		//#endregion
		//#region lib/types/client/ProductCompanion.js
		const PET_WIDTH = 132;
		const PET_HEIGHT = 118;
		const EDGE = 8;
		const SLEEP_AFTER_MS = 9e4;
		const SUCCESS_MS = 4e3;
		const PROGRESS_REVEAL_MS = 420;
		const TASK_PANEL_EXIT_MS = 260;
		const ANCHOR_SETTLE_MS = 120;
		const SESSION_ANCHOR_SETTLE_MS = 360;
		const MIN_TELEPORT_DISTANCE = 6;
		const WORK_PULSE_COOLDOWN_MS = 5200;
		const ASSET_ROOT = "/plugins/ui-product-companion/assets";
		const UNDERLYING_INTERACTIVE_SELECTOR = [
			"button:not([disabled])",
			"[role=\"button\"]:not([aria-disabled=\"true\"])",
			"a[href]",
			"input:not([disabled]):not([type=\"hidden\"])",
			"textarea:not([disabled])",
			"select:not([disabled])",
			"[contenteditable]:not([contenteditable=\"false\"])"
		].join(", ");
		function readViewport() {
			return {
				width: typeof window === "undefined" ? 1280 : window.innerWidth,
				height: typeof window === "undefined" ? 800 : window.innerHeight
			};
		}
		function companionSize(viewport, preference) {
			if (viewport.width <= 680) return preference === "large" ? {
				width: 144,
				height: 129,
				bottomInset: 14
			} : {
				width: 116,
				height: 104,
				bottomInset: 11
			};
			return preference === "large" ? {
				width: 164,
				height: 147,
				bottomInset: 15
			} : {
				width: PET_WIDTH,
				height: PET_HEIGHT,
				bottomInset: 12
			};
		}
		function clampPosition(position, viewport, preference) {
			const size = companionSize(viewport, preference);
			return {
				x: Math.max(EDGE, Math.min(position.x, viewport.width - size.width - EDGE)),
				y: Math.max(48, Math.min(position.y, viewport.height - size.height - EDGE))
			};
		}
		function visibleRect(element) {
			if (!(element instanceof HTMLElement)) return null;
			const rect = element.getBoundingClientRect();
			return rect.width > 40 && rect.height > 30 ? rect : null;
		}
		function hasBlockingModal() {
			return document.querySelector("[role=\"dialog\"][aria-modal=\"true\"]") !== null;
		}
		/**
		* Keep the companion visually above the app while giving an actionable element
		* beneath its canvas the first primary-click. The root is temporarily removed
		* from hit-testing only to ask the browser what it covers; nothing is moved or
		* hidden from the user.
		*/
		function underlyingInteractiveTarget(root, clientX, clientY) {
			if (typeof document.elementsFromPoint !== "function") return null;
			const previousPointerEvents = root.style.pointerEvents;
			try {
				root.style.pointerEvents = "none";
				for (const element of document.elementsFromPoint(clientX, clientY)) {
					const target = element.closest(UNDERLYING_INTERACTIVE_SELECTOR);
					if (target !== null && !root.contains(target)) return target;
				}
				return null;
			} finally {
				root.style.pointerEvents = previousPointerEvents;
			}
		}
		/** Measure the stable right edge of the real composer without covering its controls. */
		function measureComposerAnchor(viewport, preference) {
			const composer = visibleRect(document.querySelector("[data-composer-card]"));
			if (hasBlockingModal() || composer === null) return null;
			const size = companionSize(viewport, preference);
			const y = composer.top - size.height + size.bottomInset;
			return clampPosition({
				x: composer.right - size.width - 14,
				y
			}, viewport, preference);
		}
		/** Public and testable frame URL contract. */
		function companionFrameUrl(skin, clip, frame = 0) {
			const bounded = Math.max(0, Math.min(COMPANION_ASSET_FRAME_COUNTS[clip] - 1, Math.floor(frame)));
			return `${ASSET_ROOT}/v14/${skin}-${clip}-${String(bounded + 1).padStart(2, "0")}.png`;
		}
		/** Public URL contract for masks applied directly to the current character bitmap. */
		function companionDissolveMaskUrl(kind, frame = 0) {
			return `${ASSET_ROOT}/v13/${kind}-mask-${String(Math.max(0, Math.min(47, Math.floor(frame))) + 1).padStart(2, "0")}.png`;
		}
		function maskStyle(kind, frame) {
			const progress = frame / Math.max(1, 47);
			return {
				"--companion-material-mask": `url("${companionDissolveMaskUrl(kind, frame)}")`,
				"--companion-fragment-x": `${(progress * 3.5).toFixed(2)}px`,
				"--companion-fragment-y": `${(-1.5 - progress * 7).toFixed(2)}px`,
				"--companion-fragment-opacity": String(Math.max(.34, .84 - progress * .28))
			};
		}
		function positionDistance(from, to) {
			return Math.hypot(to.x - from.x, to.y - from.y);
		}
		function stateKey(state) {
			return `state.${state}`;
		}
		function formatDuration(seconds, t) {
			const bounded = Math.max(0, Math.floor(seconds));
			if (bounded < 60) return t("duration.seconds", { seconds: bounded });
			return t("duration.minutes", {
				minutes: Math.floor(bounded / 60),
				seconds: bounded % 60
			});
		}
		function taskStatusKey(status) {
			switch (status) {
				case "approval": return "task.approval";
				case "plan-review": return "task.planReview";
				case "question": return "task.question";
				case "working": return "task.working";
			}
		}
		/** Global product companion, mounted once above all app columns. */
		function ProductCompanion({ useSessions, useStore, actions, startSession = () => void 0, openSession = () => void 0, t }) {
			const sessions = useSessions((snapshot) => snapshot);
			const activity = (0, react.useMemo)(() => deriveCompanionActivity(sessions), [sessions]);
			const activeTasks = (0, react.useMemo)(() => deriveCompanionTasks(sessions), [sessions]);
			const currentSession = sessions.current === void 0 ? void 0 : sessions.byId[sessions.current];
			const skin = useStore((state) => state.skin);
			const displayName = useStore((state) => state.displayName?.trim() || "鲸少女");
			const visible = useStore((state) => state.visible ?? true);
			const sizePreference = useStore((state) => state.size ?? "large");
			const clickAction = useStore((state) => state.clickAction ?? "focusComposer");
			const doubleClickAction = useStore((state) => state.doubleClickAction ?? "newSession");
			const contextAction = useStore((state) => state.contextAction ?? "menu");
			const showStatus = useStore((state) => state.showStatus);
			const voiceEnabled = useStore((state) => state.voiceEnabled ?? true);
			const voiceShortcut = useStore((state) => state.voiceShortcut ?? "Alt+Space");
			const voicePreferences = (0, react.useMemo)(() => ({
				enabled: voiceEnabled,
				shortcut: voiceShortcut
			}), [voiceEnabled, voiceShortcut]);
			const [viewport, setViewport] = (0, react.useState)(readViewport);
			const [viewportResizing, setViewportResizing] = (0, react.useState)(false);
			const [layoutRevision, setLayoutRevision] = (0, react.useState)(0);
			const [renderedPosition, setRenderedPosition] = (0, react.useState)(null);
			const [teleportPhase, setTeleportPhase] = (0, react.useState)("idle");
			const [menuOpen, setMenuOpen] = (0, react.useState)(false);
			const [tasksOpen, setTasksOpen] = (0, react.useState)(false);
			const [tasksMounted, setTasksMounted] = (0, react.useState)(false);
			const [sleeping, setSleeping] = (0, react.useState)(false);
			const [celebrating, setCelebrating] = (0, react.useState)(false);
			const [isDrafting, setIsDrafting] = (0, react.useState)(false);
			const [elapsedSeconds, setElapsedSeconds] = (0, react.useState)(0);
			const [lastDurationSeconds, setLastDurationSeconds] = (0, react.useState)(null);
			const [progressReady, setProgressReady] = (0, react.useState)(false);
			const [animatedFrame, setAnimatedFrame] = (0, react.useState)(0);
			const [workPulse, setWorkPulse] = (0, react.useState)({
				revision: 0,
				active: false
			});
			const [dissolveFrame, setDissolveFrame] = (0, react.useState)({
				previous: null,
				current: 0,
				revision: 0
			});
			const rootRef = (0, react.useRef)(null);
			const previousRunning = (0, react.useRef)(0);
			const runStartedAt = (0, react.useRef)(null);
			const previousSession = (0, react.useRef)(sessions.current);
			const sessionAnchorSettling = (0, react.useRef)(false);
			const previousAnchor = (0, react.useRef)(null);
			const teleportTarget = (0, react.useRef)(null);
			const teleportPhaseRef = (0, react.useRef)("idle");
			const currentCharacterSrc = (0, react.useRef)(null);
			const frozenTeleportCharacterSrc = (0, react.useRef)(null);
			const currentDissolveFrame = (0, react.useRef)(0);
			const sleepTimer = (0, react.useRef)(null);
			const successTimer = (0, react.useRef)(null);
			const teleportTimer = (0, react.useRef)(null);
			const anchorSettleTimer = (0, react.useRef)(null);
			const progressTimer = (0, react.useRef)(null);
			const progressRevealTimer = (0, react.useRef)(null);
			const clickTimer = (0, react.useRef)(null);
			const clickThroughResetTimer = (0, react.useRef)(null);
			const clickThroughPress = (0, react.useRef)(null);
			const suppressCharacterClick = (0, react.useRef)(false);
			const resizeTimer = (0, react.useRef)(null);
			const taskPanelTimer = (0, react.useRef)(null);
			const previousWorkPulseSignature = (0, react.useRef)(null);
			const lastWorkPulseAt = (0, react.useRef)(null);
			const preloadedAssetUrls = (0, react.useRef)(/* @__PURE__ */ new Set());
			const voice = useVoiceInput({
				preferences: voicePreferences,
				t
			});
			const openTasks = (0, react.useCallback)(() => {
				if (taskPanelTimer.current !== null) clearTimeout(taskPanelTimer.current);
				taskPanelTimer.current = null;
				setTasksMounted(true);
				setTasksOpen(true);
			}, []);
			const closeTasks = (0, react.useCallback)(() => {
				setTasksOpen(false);
				if (taskPanelTimer.current !== null) clearTimeout(taskPanelTimer.current);
				taskPanelTimer.current = setTimeout(() => {
					setTasksMounted(false);
					taskPanelTimer.current = null;
				}, TASK_PANEL_EXIT_MS);
			}, []);
			const toggleTasks = (0, react.useCallback)(() => {
				if (tasksOpen) closeTasks();
				else openTasks();
			}, [
				closeTasks,
				openTasks,
				tasksOpen
			]);
			const composerAnchor = (0, react.useMemo)(() => measureComposerAnchor(viewport, sizePreference), [
				viewport,
				layoutRevision,
				sizePreference
			]);
			const renderedSize = companionSize(viewport, sizePreference);
			const position = renderedPosition ?? composerAnchor ?? {
				x: EDGE,
				y: 48
			};
			const wake = (0, react.useCallback)(() => {
				setSleeping(false);
				if (sleepTimer.current !== null) clearTimeout(sleepTimer.current);
				if (activity.state === "idle" && !isDrafting) sleepTimer.current = setTimeout(() => {
					setSleeping(true);
				}, SLEEP_AFTER_MS);
			}, [activity.state, isDrafting]);
			const cancelTeleport = (0, react.useCallback)(() => {
				if (teleportTimer.current !== null) clearTimeout(teleportTimer.current);
				teleportTimer.current = null;
				teleportTarget.current = null;
				teleportPhaseRef.current = "idle";
				frozenTeleportCharacterSrc.current = null;
				setTeleportPhase("idle");
			}, []);
			const beginTeleport = (0, react.useCallback)((target) => {
				teleportTarget.current = target;
				if (teleportPhaseRef.current !== "idle") return;
				const run = () => {
					frozenTeleportCharacterSrc.current = currentCharacterSrc.current;
					teleportPhaseRef.current = "departing";
					setTeleportPhase("departing");
					teleportTimer.current = setTimeout(() => {
						const destination = teleportTarget.current;
						if (destination === null) {
							teleportPhaseRef.current = "idle";
							setTeleportPhase("idle");
							frozenTeleportCharacterSrc.current = null;
							teleportTimer.current = null;
							return;
						}
						setRenderedPosition(destination);
						teleportPhaseRef.current = "arriving";
						setTeleportPhase("arriving");
						teleportTimer.current = setTimeout(() => {
							teleportPhaseRef.current = "idle";
							setTeleportPhase("idle");
							teleportTimer.current = null;
							const latest = teleportTarget.current;
							if (latest !== null && positionDistance(latest, destination) >= .5) {
								run();
								return;
							}
							frozenTeleportCharacterSrc.current = null;
						}, COMPANION_DISSOLVE_PHASE_MS);
					}, COMPANION_DISSOLVE_PHASE_MS);
				};
				run();
			}, []);
			(0, react.useEffect)(() => {
				const resize = () => {
					setViewportResizing(true);
					setViewport(readViewport());
					setLayoutRevision((value) => value + 1);
					if (resizeTimer.current !== null) clearTimeout(resizeTimer.current);
					resizeTimer.current = setTimeout(() => {
						setViewportResizing(false);
						resizeTimer.current = null;
					}, 140);
				};
				window.addEventListener("resize", resize);
				return () => {
					window.removeEventListener("resize", resize);
					if (resizeTimer.current !== null) clearTimeout(resizeTimer.current);
				};
			}, []);
			(0, react.useEffect)(() => {
				let animationFrame = 0;
				let observeUntil = 0;
				let previousGeometry = "";
				const measure = () => {
					animationFrame = 0;
					const composer = visibleRect(document.querySelector("[data-composer-card]"));
					const surfaceState = hasBlockingModal() ? "modal" : "available";
					const geometry = composer === null ? "hidden" : `${surfaceState}:${Math.round(composer.left)}:${Math.round(composer.right)}:${Math.round(composer.top)}`;
					if (geometry !== previousGeometry) {
						previousGeometry = geometry;
						setLayoutRevision((value) => value + 1);
					}
					if (performance.now() < observeUntil) animationFrame = window.requestAnimationFrame(measure);
				};
				const followLayout = () => {
					observeUntil = performance.now() + 1200;
					if (animationFrame === 0) animationFrame = window.requestAnimationFrame(measure);
				};
				const observer = new MutationObserver(followLayout);
				observer.observe(document.body, {
					childList: true,
					subtree: true
				});
				const composer = document.querySelector("[data-composer-card]");
				const resizeObserver = typeof ResizeObserver === "undefined" || composer === null ? null : new ResizeObserver(followLayout);
				if (resizeObserver !== null && composer !== null) resizeObserver.observe(composer);
				window.addEventListener("scroll", followLayout, true);
				followLayout();
				return () => {
					observer.disconnect();
					resizeObserver?.disconnect();
					window.removeEventListener("scroll", followLayout, true);
					if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
				};
			}, []);
			(0, react.useEffect)(() => {
				const isComposerInput = (target) => target instanceof HTMLTextAreaElement && target.closest("[data-composer-card]") !== null;
				const syncDraftState = (target) => {
					if (!isComposerInput(target)) return;
					setIsDrafting(target.value.length > 0);
					setLayoutRevision((value) => value + 1);
				};
				const onDraftEvent = (event) => {
					syncDraftState(event.target);
				};
				const onKeyDown = (event) => {
					if (!isComposerInput(event.target)) return;
					if (event.key === "Enter" && !event.shiftKey && !event.isComposing) setIsDrafting(false);
				};
				const initial = document.querySelector("[data-composer-card] textarea");
				if (initial !== null) setIsDrafting(initial.value.length > 0);
				document.addEventListener("input", onDraftEvent, true);
				document.addEventListener("focusin", onDraftEvent, true);
				document.addEventListener("focusout", onDraftEvent, true);
				document.addEventListener("keydown", onKeyDown, true);
				return () => {
					document.removeEventListener("input", onDraftEvent, true);
					document.removeEventListener("focusin", onDraftEvent, true);
					document.removeEventListener("focusout", onDraftEvent, true);
					document.removeEventListener("keydown", onKeyDown, true);
				};
			}, []);
			(0, react.useEffect)(() => {
				wake();
				const layoutTimer = window.setTimeout(() => {
					setLayoutRevision((value) => value + 1);
				}, 180);
				return () => {
					window.clearTimeout(layoutTimer);
					if (sleepTimer.current !== null) clearTimeout(sleepTimer.current);
				};
			}, [
				activity.latestUpdate,
				isDrafting,
				wake
			]);
			(0, react.useEffect)(() => {
				if (anchorSettleTimer.current !== null) {
					clearTimeout(anchorSettleTimer.current);
					anchorSettleTimer.current = null;
				}
				const sessionChanged = previousSession.current !== sessions.current;
				previousSession.current = sessions.current;
				if (sessionChanged) {
					sessionAnchorSettling.current = true;
					cancelTeleport();
				}
				if (composerAnchor === null) {
					previousAnchor.current = null;
					sessionAnchorSettling.current = false;
					cancelTeleport();
					setRenderedPosition(null);
					return;
				}
				const from = previousAnchor.current;
				previousAnchor.current = composerAnchor;
				if (from === null || viewportResizing) {
					sessionAnchorSettling.current = false;
					cancelTeleport();
					teleportTarget.current = composerAnchor;
					setRenderedPosition(composerAnchor);
					return;
				}
				const origin = renderedPosition ?? from;
				if (!(positionDistance(composerAnchor, from) >= .5) && !sessionChanged) return;
				const settleDelay = sessionAnchorSettling.current ? SESSION_ANCHOR_SETTLE_MS : ANCHOR_SETTLE_MS;
				anchorSettleTimer.current = setTimeout(() => {
					anchorSettleTimer.current = null;
					sessionAnchorSettling.current = false;
					const stableAnchor = previousAnchor.current;
					if (stableAnchor === null) return;
					if (positionDistance(stableAnchor, origin) < MIN_TELEPORT_DISTANCE) return;
					beginTeleport(stableAnchor);
				}, settleDelay);
			}, [
				beginTeleport,
				cancelTeleport,
				composerAnchor?.x,
				composerAnchor?.y,
				renderedPosition?.x,
				renderedPosition?.y,
				sessions.current,
				viewportResizing
			]);
			(0, react.useEffect)(() => {
				const started = previousRunning.current === 0 && activity.running > 0;
				const finished = previousRunning.current > 0 && activity.running === 0;
				if (started) {
					runStartedAt.current = Date.now();
					setElapsedSeconds(0);
					setLastDurationSeconds(null);
					setProgressReady(false);
					if (progressRevealTimer.current !== null) clearTimeout(progressRevealTimer.current);
					progressRevealTimer.current = setTimeout(() => {
						setProgressReady(true);
					}, PROGRESS_REVEAL_MS);
				}
				if (finished) {
					setLastDurationSeconds(runStartedAt.current === null ? null : Math.max(1, Math.floor((Date.now() - runStartedAt.current) / 1e3)));
					setElapsedSeconds(0);
					setProgressReady(false);
					runStartedAt.current = null;
					if (progressRevealTimer.current !== null) clearTimeout(progressRevealTimer.current);
				}
				if (finished && activity.waiting === 0) {
					setCelebrating(true);
					if (successTimer.current !== null) clearTimeout(successTimer.current);
					successTimer.current = setTimeout(() => {
						setCelebrating(false);
					}, SUCCESS_MS);
				}
				previousRunning.current = activity.running;
				return () => {
					if (successTimer.current !== null) clearTimeout(successTimer.current);
				};
			}, [activity.running, activity.waiting]);
			(0, react.useEffect)(() => {
				if (activity.running === 0) return;
				const tick = () => {
					if (runStartedAt.current === null) runStartedAt.current = Date.now();
					setElapsedSeconds(Math.max(0, Math.floor((Date.now() - runStartedAt.current) / 1e3)));
				};
				tick();
				progressTimer.current = setInterval(tick, 1e3);
				return () => {
					if (progressTimer.current !== null) clearInterval(progressTimer.current);
					progressTimer.current = null;
				};
			}, [activity.running]);
			(0, react.useEffect)(() => {
				if (activeTasks.length === 0) closeTasks();
			}, [activeTasks.length, closeTasks]);
			const currentWorkSignature = currentSession?.running === true ? `${currentSession.id}:${currentSession.updatedAt}` : null;
			(0, react.useEffect)(() => {
				const previous = previousWorkPulseSignature.current;
				previousWorkPulseSignature.current = currentWorkSignature;
				if (currentWorkSignature === null || currentWorkSignature === previous) return;
				const now = performance.now();
				if (lastWorkPulseAt.current !== null && now - lastWorkPulseAt.current < WORK_PULSE_COOLDOWN_MS) return;
				lastWorkPulseAt.current = now;
				setWorkPulse((current) => ({
					revision: current.revision + 1,
					active: true
				}));
			}, [currentWorkSignature]);
			(0, react.useEffect)(() => {
				if (!tasksOpen) return;
				const closeFromOutside = (event) => {
					if (rootRef.current?.contains(event.target) === true) return;
					closeTasks();
				};
				const closeFromEscape = (event) => {
					if (event.key === "Escape") closeTasks();
				};
				document.addEventListener("pointerdown", closeFromOutside, true);
				document.addEventListener("keydown", closeFromEscape, true);
				return () => {
					document.removeEventListener("pointerdown", closeFromOutside, true);
					document.removeEventListener("keydown", closeFromEscape, true);
				};
			}, [closeTasks, tasksOpen]);
			(0, react.useEffect)(() => {
				return () => {
					if (teleportTimer.current !== null) clearTimeout(teleportTimer.current);
					if (anchorSettleTimer.current !== null) clearTimeout(anchorSettleTimer.current);
					if (progressTimer.current !== null) clearInterval(progressTimer.current);
					if (progressRevealTimer.current !== null) clearTimeout(progressRevealTimer.current);
					if (clickTimer.current !== null) clearTimeout(clickTimer.current);
					if (clickThroughResetTimer.current !== null) clearTimeout(clickThroughResetTimer.current);
					if (resizeTimer.current !== null) clearTimeout(resizeTimer.current);
					if (taskPanelTimer.current !== null) clearTimeout(taskPanelTimer.current);
				};
			}, []);
			const displayState = activity.state === "waiting" ? "waiting" : activity.state === "working" ? "working" : celebrating ? "success" : sleeping ? "sleep" : "idle";
			const characterState = currentSession?.pendingInteraction !== void 0 ? "waiting" : currentSession?.running === true ? "working" : "idle";
			const poseState = characterState === "waiting" ? "waiting" : characterState === "working" ? "working" : celebrating ? "success" : sleeping ? "sleep" : "idle";
			const semanticTrackName = celebrating ? "success" : characterState === "waiting" ? "waiting" : characterState === "working" ? "focus" : sleeping ? "sleep" : "lounge";
			const trackName = teleportPhase === "idle" ? semanticTrackName : "dissolve";
			const track = COMPANION_TRACKS[semanticTrackName];
			const frame = semanticTrackName === "lounge" || semanticTrackName === "focus" && workPulse.active || semanticTrackName === "waiting" || semanticTrackName === "success" ? animatedFrame : track.frames[0] ?? 0;
			const frameSrc = companionFrameUrl(skin, track.asset, frame);
			if (teleportPhase === "idle") currentCharacterSrc.current = frameSrc;
			const characterSrc = teleportPhase === "idle" ? frameSrc : frozenTeleportCharacterSrc.current ?? currentCharacterSrc.current ?? frameSrc;
			const preloadAsset = (0, react.useCallback)((url) => {
				if (preloadedAssetUrls.current.has(url)) return;
				preloadedAssetUrls.current.add(url);
				const image = new Image();
				image.src = url;
				const decode = Reflect.get(image, "decode");
				if (typeof decode === "function") Promise.resolve(decode.call(image)).catch(() => void 0);
			}, []);
			(0, react.useEffect)(() => {
				const count = COMPANION_ASSET_FRAME_COUNTS[track.asset];
				for (const offset of [1, 2]) preloadAsset(companionFrameUrl(skin, track.asset, (frame + offset) % count));
			}, [
				frame,
				preloadAsset,
				skin,
				track.asset
			]);
			(0, react.useEffect)(() => {
				if (teleportPhase === "idle") return;
				const reverse = teleportPhase === "arriving";
				const initial = reverse ? 47 : 0;
				currentDissolveFrame.current = initial;
				setDissolveFrame((state) => ({
					previous: null,
					current: initial,
					revision: state.revision + 1
				}));
				const startedAt = performance.now();
				let animationFrame = 0;
				const tick = (now) => {
					const next = companionDissolveFrame(now - startedAt, reverse);
					if (next !== currentDissolveFrame.current) {
						const previous = currentDissolveFrame.current;
						currentDissolveFrame.current = next;
						setDissolveFrame((state) => ({
							previous,
							current: next,
							revision: state.revision + 1
						}));
					}
					if (now - startedAt < 1040) animationFrame = window.requestAnimationFrame(tick);
				};
				animationFrame = window.requestAnimationFrame(tick);
				return () => {
					window.cancelAnimationFrame(animationFrame);
				};
			}, [teleportPhase]);
			(0, react.useEffect)(() => {
				if (teleportPhase === "idle") return;
				const direction = teleportPhase === "arriving" ? -1 : 1;
				const next = Math.max(0, Math.min(47, dissolveFrame.current + direction));
				for (const kind of ["body", "fragment"]) preloadAsset(companionDissolveMaskUrl(kind, next));
			}, [
				dissolveFrame.current,
				preloadAsset,
				teleportPhase
			]);
			(0, react.useEffect)(() => {
				setAnimatedFrame(track.frames[0] ?? 0);
				const sequence = semanticTrackName === "lounge" ? COMPANION_LOUNGE_SEQUENCE : semanticTrackName === "focus" && workPulse.active ? COMPANION_FOCUS_SEQUENCE : semanticTrackName === "waiting" ? COMPANION_WAITING_SEQUENCE : semanticTrackName === "success" ? COMPANION_SUCCESS_SEQUENCE : null;
				if (sequence === null) return;
				const startedAt = performance.now();
				const duration = sequence.reduce((total, step) => total + step.durationMs, 0);
				const loop = semanticTrackName === "lounge" || semanticTrackName === "waiting";
				let animationFrame = 0;
				const tick = (now) => {
					const nextFrame = companionSequenceFrame(sequence, now - startedAt, loop);
					setAnimatedFrame((current) => current === nextFrame ? current : nextFrame);
					if (!loop && now - startedAt >= duration) {
						if (semanticTrackName === "focus") setWorkPulse((current) => current.active && current.revision === workPulse.revision ? {
							...current,
							active: false
						} : current);
						return;
					}
					animationFrame = window.requestAnimationFrame(tick);
				};
				tick(startedAt);
				return () => {
					window.cancelAnimationFrame(animationFrame);
				};
			}, [
				semanticTrackName,
				track.frames,
				workPulse
			]);
			const focusComposer = (0, react.useCallback)(() => {
				document.querySelector("[data-composer-card] textarea")?.focus({ preventScroll: true });
			}, []);
			const executeAction = (0, react.useCallback)((action) => {
				setMenuOpen(false);
				closeTasks();
				switch (action) {
					case "none": return;
					case "focusComposer":
						focusComposer();
						return;
					case "voiceInput":
						voice.toggle();
						return;
					case "switchSide":
						focusComposer();
						return;
					case "newSession":
						startSession();
						return;
					case "menu":
						setMenuOpen(true);
						return;
					case "close": actions.setVisible(false);
				}
			}, [
				actions,
				closeTasks,
				focusComposer,
				startSession,
				voice.toggle
			]);
			const openTask = (0, react.useCallback)((id) => {
				openSession(id);
			}, [openSession]);
			const onCharacterClick = (event) => {
				if (suppressCharacterClick.current) {
					suppressCharacterClick.current = false;
					if (clickThroughResetTimer.current !== null) clearTimeout(clickThroughResetTimer.current);
					clickThroughResetTimer.current = null;
					event.preventDefault();
					event.stopPropagation();
					return;
				}
				if (clickTimer.current !== null) clearTimeout(clickTimer.current);
				if (event.detail >= 2) {
					clickTimer.current = null;
					executeAction(doubleClickAction);
					return;
				}
				clickTimer.current = setTimeout(() => {
					clickTimer.current = null;
					executeAction(clickAction);
				}, 240);
			};
			const onCharacterPointerDown = (event) => {
				if (event.button !== 0 || rootRef.current === null) return;
				const target = underlyingInteractiveTarget(rootRef.current, event.clientX, event.clientY);
				if (target === null) return;
				if (clickTimer.current !== null) {
					clearTimeout(clickTimer.current);
					clickTimer.current = null;
				}
				clickThroughPress.current = {
					pointerId: event.pointerId,
					target
				};
				target.focus({ preventScroll: true });
				event.preventDefault();
				event.stopPropagation();
			};
			const onCharacterPointerUp = (event) => {
				const press = clickThroughPress.current;
				clickThroughPress.current = null;
				if (press === null || press.pointerId !== event.pointerId || rootRef.current === null) return;
				const target = underlyingInteractiveTarget(rootRef.current, event.clientX, event.clientY);
				if (target !== press.target) return;
				suppressCharacterClick.current = true;
				if (clickThroughResetTimer.current !== null) clearTimeout(clickThroughResetTimer.current);
				clickThroughResetTimer.current = setTimeout(() => {
					suppressCharacterClick.current = false;
					clickThroughResetTimer.current = null;
				}, 0);
				target.focus({ preventScroll: true });
				target.click();
				event.preventDefault();
				event.stopPropagation();
			};
			const cancelCharacterPointer = () => {
				clickThroughPress.current = null;
			};
			const contextItems = [{
				id: "close",
				label: t("closeAction", { name: displayName })
			}];
			const openContextMenu = (event) => {
				event.preventDefault();
				event.stopPropagation();
				executeAction(contextAction);
			};
			const onCharacterKeyDown = (event) => {
				if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) return;
				event.preventDefault();
				setMenuOpen(true);
			};
			const style = {
				"--companion-x": `${position.x}px`,
				"--companion-y": `${position.y}px`,
				"--companion-width": `${renderedSize.width}px`,
				"--companion-height": `${renderedSize.height}px`,
				"--dissolve-phase-ms": `${COMPANION_DISSOLVE_PHASE_MS}ms`,
				"--dissolve-frame-crossfade-ms": `28ms`
			};
			const activeDuration = elapsedSeconds > 0 ? formatDuration(elapsedSeconds, t) : null;
			const completedDuration = lastDurationSeconds === null ? null : formatDuration(lastDurationSeconds, t);
			const focusTask = activeTasks[0] ?? null;
			const focusTaskBubble = focusTask === null || !showStatus || focusTask.status === "working" && !progressReady ? null : {
				task: focusTask,
				meta: [t(taskStatusKey(focusTask.status)), activeDuration].filter((value) => value !== null).join(" · ")
			};
			const completionBubble = showStatus && celebrating ? [t("bubble.success"), completedDuration].filter((value) => value !== null).join(" · ") : null;
			const voiceBubble = voice.stage === "listening" ? voice.liveText || t("voice.listening") : voice.feedback;
			const accessoriesMoving = teleportPhase !== "idle";
			const bubbleAlign = position.x < 58 ? "left" : position.x > viewport.width - renderedSize.width - 58 ? "right" : "center";
			if (!visible || composerAnchor === null) return null;
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: ProductCompanion_module_css_default.root,
				style,
				"data-product-companion": "",
				"data-scene": isDrafting ? "drafting" : displayState,
				"data-state": displayState,
				"data-pose": poseState,
				"data-track": trackName,
				"data-asset": track.asset,
				"data-frame": frame,
				"data-skin": skin,
				"data-size": sizePreference,
				"data-habitat": "composer",
				"data-side": "right",
				"data-moving": teleportPhase === "idle" ? "false" : "true",
				"data-motion": teleportPhase === "idle" ? "rest" : "dissolve",
				"data-teleport": teleportPhase,
				"data-bubble-align": bubbleAlign,
				children: [
					voiceBubble !== null ? (0, react_jsx_runtime.jsx)("div", {
						className: `${ProductCompanion_module_css_default.bubble} ${ProductCompanion_module_css_default.voiceBubble}`,
						"aria-live": "polite",
						children: (0, react_jsx_runtime.jsx)("span", {
							className: ProductCompanion_module_css_default.taskMeta,
							children: voiceBubble
						})
					}) : tasksMounted ? (0, react_jsx_runtime.jsx)("div", {
						className: ProductCompanion_module_css_default.taskPanel,
						"data-state": tasksOpen ? "open" : "closing",
						"aria-label": t("task.listLabel"),
						"aria-hidden": !tasksOpen,
						children: activeTasks.map((task, index) => (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: ProductCompanion_module_css_default.taskRow,
							"data-current": task.current ? "true" : "false",
							tabIndex: tasksOpen ? 0 : -1,
							style: {
								"--task-enter-delay": `${Math.min(4, activeTasks.length - 1 - index) * 34}ms`,
								"--task-exit-delay": `${Math.min(4, index) * 22}ms`
							},
							onPointerDown: (event) => {
								event.stopPropagation();
							},
							onClick: () => {
								openTask(task.id);
							},
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: ProductCompanion_module_css_default.taskTitle,
								children: task.title
							}), (0, react_jsx_runtime.jsxs)("span", {
								className: ProductCompanion_module_css_default.taskMeta,
								children: [t(taskStatusKey(task.status)), task.current ? ` · ${t("task.current")}` : ""]
							})]
						}, task.id))
					}) : focusTaskBubble !== null ? (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: ProductCompanion_module_css_default.bubble,
						onPointerDown: (event) => {
							event.stopPropagation();
						},
						onClick: () => {
							openTask(focusTaskBubble.task.id);
						},
						"aria-label": t("task.open", { title: focusTaskBubble.task.title }),
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ProductCompanion_module_css_default.taskTitle,
							children: focusTaskBubble.task.title
						}), (0, react_jsx_runtime.jsx)("span", {
							className: ProductCompanion_module_css_default.taskMeta,
							children: focusTaskBubble.meta
						})]
					}) : completionBubble !== null ? (0, react_jsx_runtime.jsx)("div", {
						className: ProductCompanion_module_css_default.bubble,
						"aria-hidden": "true",
						children: (0, react_jsx_runtime.jsx)("span", {
							className: ProductCompanion_module_css_default.taskMeta,
							children: completionBubble
						})
					}) : null,
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
						open: menuOpen,
						onClose: () => {
							setMenuOpen(false);
						},
						items: contextItems,
						onSelect: (id) => {
							executeAction(id);
						},
						align: "end",
						side: "bottom",
						compact: true,
						className: ProductCompanion_module_css_default.contextMenu ?? "",
						anchor: (0, react_jsx_runtime.jsx)("div", {
							className: ProductCompanion_module_css_default.character,
							"data-companion-surface": "",
							role: "img",
							tabIndex: 0,
							"aria-label": t("interact", { name: displayName }),
							onPointerDown: onCharacterPointerDown,
							onPointerUp: onCharacterPointerUp,
							onPointerCancel: cancelCharacterPointer,
							onClick: onCharacterClick,
							onContextMenu: openContextMenu,
							onKeyDown: onCharacterKeyDown,
							children: (0, react_jsx_runtime.jsx)("span", {
								className: ProductCompanion_module_css_default.poseLayer,
								"aria-hidden": "true",
								children: (0, react_jsx_runtime.jsx)("span", {
									className: ProductCompanion_module_css_default.motionLayer,
									children: (0, react_jsx_runtime.jsx)("span", {
										className: ProductCompanion_module_css_default.spriteLayer,
										children: teleportPhase === "idle" ? (0, react_jsx_runtime.jsx)("img", {
											className: ProductCompanion_module_css_default.characterImage,
											src: characterSrc,
											alt: "",
											draggable: false
										}) : (0, react_jsx_runtime.jsxs)("span", {
											className: ProductCompanion_module_css_default.materialDissolveLayer,
											"aria-hidden": "true",
											children: [
												(0, react_jsx_runtime.jsx)("img", {
													className: `${ProductCompanion_module_css_default.characterImage} ${ProductCompanion_module_css_default.materialCurrent}`,
													src: characterSrc,
													style: maskStyle("body", dissolveFrame.current),
													alt: "",
													draggable: false
												}),
												dissolveFrame.previous === null ? null : (0, react_jsx_runtime.jsx)("img", {
													className: `${ProductCompanion_module_css_default.characterImage} ${ProductCompanion_module_css_default.materialPrevious}`,
													src: characterSrc,
													style: maskStyle("body", dissolveFrame.previous),
													alt: "",
													draggable: false
												}, `body-${dissolveFrame.revision}`),
												(0, react_jsx_runtime.jsx)("img", {
													className: `${ProductCompanion_module_css_default.characterImage} ${ProductCompanion_module_css_default.materialFragments}`,
													src: characterSrc,
													style: maskStyle("fragment", dissolveFrame.current),
													alt: "",
													draggable: false
												}, `fragment-${dissolveFrame.revision}`)
											]
										})
									})
								})
							})
						})
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ProductCompanion_module_css_default.quickControls,
						"data-companion-accessories": "",
						"data-phase": teleportPhase,
						"aria-hidden": accessoriesMoving || void 0,
						onPointerDown: (event) => {
							event.stopPropagation();
						},
						children: [voiceEnabled ? (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: ProductCompanion_module_css_default.quickControl,
							"data-control": "voice",
							"data-active": voice.stage === "listening" ? "true" : "false",
							disabled: accessoriesMoving || !voice.supported,
							"aria-pressed": voice.stage === "listening",
							"aria-label": voice.stage === "listening" ? t("voice.stop") : voice.supported ? t("voice.start") : t("voice.unsupported"),
							onClick: voice.toggle,
							children: (0, react_jsx_runtime.jsx)("span", {
								className: ProductCompanion_module_css_default.voiceIcon,
								"aria-hidden": "true"
							})
						}) : null, (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: ProductCompanion_module_css_default.quickControl,
							disabled: accessoriesMoving || !showStatus || activeTasks.length === 0,
							"aria-expanded": tasksOpen,
							"aria-label": tasksOpen ? t("task.collapse", { count: activeTasks.length }) : t("task.expand", { count: activeTasks.length }),
							title: activeTasks.length === 0 ? t("task.none") : t("task.count", { count: activeTasks.length }),
							onClick: toggleTasks,
							children: (0, react_jsx_runtime.jsx)("span", {
								className: ProductCompanion_module_css_default.taskCount,
								children: activeTasks.length
							})
						})]
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: ProductCompanion_module_css_default.srOnly,
						"aria-live": "polite",
						children: t(stateKey(displayState))
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/global-rules.js
		/** Browser transport for the companion-owned user-global AGENTS.md editor. */
		const GLOBAL_RULES_API_ROUTE = "/plugins/ui-product-companion/api/global-rules";
		var GlobalRulesRequestError = class extends Error {
			status;
			constructor(status, message) {
				super(message);
				this.status = status;
			}
		};
		async function responseDocument(response) {
			const body = await response.json();
			if (!response.ok) throw new GlobalRulesRequestError(response.status, typeof body.error === "string" ? body.error : `HTTP ${String(response.status)}`);
			if (typeof body.path !== "string" || typeof body.displayPath !== "string" || typeof body.exists !== "boolean" || typeof body.content !== "string" || typeof body.revision !== "string") throw new GlobalRulesRequestError(502, "invalid global rules response");
			return body;
		}
		/** Load the exact user-global AGENTS.md used by the instruction loader. */
		async function loadGlobalRules(signal) {
			return responseDocument(await fetch(GLOBAL_RULES_API_ROUTE, signal === void 0 ? void 0 : { signal }));
		}
		/** Save only when the revision loaded by the editor is still current. */
		async function saveGlobalRules(document) {
			return responseDocument(await fetch(GLOBAL_RULES_API_ROUTE, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(document)
			}));
		}
		//#endregion
		//#region \0dsh-css:dsh-source/packages/client/ui-product-companion/src/client/ProductCompanionSettings.module.css.mjs
		const css = ".MbMUpq_section{box-sizing:border-box;width:100%;max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;padding-top:4px;display:flex}.MbMUpq_heading{box-sizing:border-box;flex-direction:column;gap:4px;min-height:77px;padding:0 0 20px;display:flex}.MbMUpq_heading h2{margin:0;font-size:20px;font-weight:560;line-height:28px}.MbMUpq_heading p{max-width:620px;color:var(--dsw-alias-label-tertiary);margin:0;font-size:13px;line-height:21px}.MbMUpq_nameTitle,.MbMUpq_nameEditor{align-items:center;gap:6px;min-width:0;display:flex}.MbMUpq_nameEditor{width:100%;max-width:348px}.MbMUpq_nameTitle h2{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.MbMUpq_nameTitle button,.MbMUpq_nameEditor button{width:28px;height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:8px;flex:none;place-items:center;padding:0;display:grid}.MbMUpq_nameTitle button:hover,.MbMUpq_nameEditor button:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.MbMUpq_nameTitle button:focus-visible,.MbMUpq_nameEditor button:focus-visible,.MbMUpq_nameEditor input:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:2px}.MbMUpq_nameEditor input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);width:auto;min-width:0;height:32px;color:var(--dsw-alias-label-primary);font:inherit;border-radius:9px;flex:1;padding:0 10px;font-size:15px;font-weight:560}.MbMUpq_group{padding:0 0 24px}.MbMUpq_group+.MbMUpq_group{padding-top:4px}.MbMUpq_group h3{color:var(--dsw-alias-label-tertiary);margin:0;padding:0 0 8px;font-size:12px;font-weight:500;line-height:18px}.MbMUpq_skinGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0 10px;display:grid}.MbMUpq_rows{margin-top:10px}.MbMUpq_skinOption{border:1px solid var(--dsw-alias-border-l2);min-width:0;min-height:88px;color:inherit;font:inherit;text-align:left;cursor:pointer;background:0 0;border-radius:14px;align-items:center;gap:10px;padding:9px 30px 9px 9px;display:flex;position:relative}.MbMUpq_skinOption:hover{background:var(--dsw-alias-bg-module-platform)}.MbMUpq_skinOption[data-selected=true]{border-color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}.MbMUpq_skinOption:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:2px}.MbMUpq_skinPreview{background:var(--dsw-alias-bg-module-platform);border-radius:12px;flex:none;place-items:center;width:66px;height:66px;display:grid;overflow:hidden}.MbMUpq_skinPreview img{object-fit:contain;pointer-events:none;width:66px;height:66px}.MbMUpq_skinCopy,.MbMUpq_rowCopy{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}.MbMUpq_skinCopy strong,.MbMUpq_rowCopy strong{font-size:13px;font-weight:500;line-height:20px}.MbMUpq_skinCopy span,.MbMUpq_rowCopy span{color:var(--dsw-alias-label-caption);font-size:11px;line-height:18px}.MbMUpq_selectionMark{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);border-radius:50%;width:12px;height:12px;position:absolute;top:14px;right:14px}.MbMUpq_skinOption[data-selected=true] .MbMUpq_selectionMark{border:4px solid var(--dsw-alias-label-primary)}.MbMUpq_row{box-sizing:border-box;border:0;border-bottom:1px solid var(--dsw-alias-border-l2);align-items:center;gap:14px;min-height:62px;margin:0 10px;padding:10px 0;display:flex}.MbMUpq_row:last-child{border-bottom:0}.MbMUpq_selector{background:var(--dsw-alias-bg-module-platform);min-width:112px;height:32px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border:0;border-radius:999px;flex:none;justify-content:space-between;align-items:center;gap:10px;padding:0 11px 0 13px;font-size:12px;line-height:18px;display:inline-flex}.MbMUpq_selector:hover{background:var(--dsw-alias-interactive-bg-hover)}.MbMUpq_selector:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:2px}.MbMUpq_chevron{color:var(--dsw-alias-label-tertiary);flex:none}.MbMUpq_switch{box-sizing:border-box;appearance:none;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);cursor:pointer;border-radius:999px;flex:none;width:36px;height:21px;padding:2px}.MbMUpq_switch:before{background:var(--dsw-alias-bg-base);content:\"\";border-radius:50%;width:15px;height:15px;transition:transform .14s;display:block;box-shadow:0 1px 2px #0000002e}.MbMUpq_switch:checked{border-color:var(--dsw-alias-label-primary);background:var(--dsw-alias-label-primary)}.MbMUpq_switch:checked:before{transform:translate(15px)}.MbMUpq_textButton{color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border:0;flex:none;padding:0;font-size:11px;line-height:18px}.MbMUpq_textButton:hover{color:var(--dsw-alias-label-primary)}.MbMUpq_textButton:disabled{cursor:default;opacity:.45}.MbMUpq_rulesSurface{background:var(--dsw-alias-bg-layer-2);border-radius:14px;margin:0 10px;overflow:hidden}.MbMUpq_rulesHeader{align-items:center;gap:14px;min-height:58px;padding:10px 14px;display:flex}.MbMUpq_rulesHeader .MbMUpq_rowCopy strong{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px}.MbMUpq_rulesNotice,.MbMUpq_rulesError{border-top:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-caption);margin:0;padding:16px 14px;font-size:11px;line-height:18px}.MbMUpq_rulesError{color:var(--dsw-alias-label-primary)}.MbMUpq_rulesError .MbMUpq_textButton{font-size:inherit;margin-left:8px}.MbMUpq_rulesEditor{box-sizing:border-box;resize:vertical;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);width:calc(100% - 28px);min-height:210px;color:var(--dsw-alias-label-primary);tab-size:2;border-radius:10px;margin:0 14px;padding:11px 12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;line-height:19px;display:block}.MbMUpq_rulesEditor:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:1px}.MbMUpq_rulesFooter{min-height:52px;color:var(--dsw-alias-label-caption);justify-content:space-between;align-items:center;gap:12px;padding:0 14px;font-size:10px;line-height:16px;display:flex}.MbMUpq_primaryButton{background:var(--dsw-alias-label-primary);height:30px;color:var(--dsw-alias-bg-base);font:inherit;cursor:pointer;border:0;border-radius:9px;flex:none;padding:0 13px;font-size:12px;font-weight:550}.MbMUpq_primaryButton:disabled{cursor:default;opacity:.35}.MbMUpq_voiceSurface{background:var(--dsw-alias-bg-layer-2);border-radius:14px;margin:0 10px}.MbMUpq_voiceSurface .MbMUpq_row{margin:0 14px}.MbMUpq_voiceSurface[data-enabled=false]{background:0 0}.MbMUpq_voiceSurface[data-enabled=false] .MbMUpq_row{margin:0}.MbMUpq_voiceDetails{animation:MbMUpq_voice-details-in .18s var(--ds-ease-out) both}.MbMUpq_shortcutRecorder:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:2px}.MbMUpq_shortcutRecorder{background:var(--dsw-alias-bg-base);min-width:74px;height:30px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border:0;border-radius:8px;flex:none;padding:0 10px;font-size:12px;font-weight:550}.MbMUpq_shortcutRecorder[data-voice-shortcut-recording=true]{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-base)}.MbMUpq_voicePrivacy{color:var(--dsw-alias-label-caption);margin:0;padding:0 14px 14px;font-size:10px;line-height:16px}.MbMUpq_privacy{color:var(--dsw-alias-label-caption);margin:0 10px;font-size:11px;line-height:18px}@media (width<=680px){.MbMUpq_skinGrid{grid-template-columns:1fr;margin-left:0;margin-right:0}.MbMUpq_row,.MbMUpq_privacy{margin-left:0;margin-right:0}.MbMUpq_selector{min-width:104px}.MbMUpq_voiceSurface,.MbMUpq_rulesSurface{margin-left:0;margin-right:0}}@keyframes MbMUpq_voice-details-in{0%{opacity:0;translate:0 -4px}to{opacity:1;translate:0}}@media (prefers-reduced-motion:reduce){.MbMUpq_switch:before{transition:none}.MbMUpq_voiceDetails{animation:none}}";
		const tagId = "@deepseek-ai/dsh-client-ui-product-companion/ProductCompanionSettings.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-product-companion";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ProductCompanionSettings_module_css_default = {
			"chevron": "MbMUpq_chevron",
			"group": "MbMUpq_group",
			"heading": "MbMUpq_heading",
			"nameEditor": "MbMUpq_nameEditor",
			"nameTitle": "MbMUpq_nameTitle",
			"primaryButton": "MbMUpq_primaryButton",
			"privacy": "MbMUpq_privacy",
			"row": "MbMUpq_row",
			"rowCopy": "MbMUpq_rowCopy",
			"rows": "MbMUpq_rows",
			"rulesEditor": "MbMUpq_rulesEditor",
			"rulesError": "MbMUpq_rulesError",
			"rulesFooter": "MbMUpq_rulesFooter",
			"rulesHeader": "MbMUpq_rulesHeader",
			"rulesNotice": "MbMUpq_rulesNotice",
			"rulesSurface": "MbMUpq_rulesSurface",
			"section": "MbMUpq_section",
			"selectionMark": "MbMUpq_selectionMark",
			"selector": "MbMUpq_selector",
			"shortcutRecorder": "MbMUpq_shortcutRecorder",
			"skinCopy": "MbMUpq_skinCopy",
			"skinGrid": "MbMUpq_skinGrid",
			"skinOption": "MbMUpq_skinOption",
			"skinPreview": "MbMUpq_skinPreview",
			"switch": "MbMUpq_switch",
			"textButton": "MbMUpq_textButton",
			"voice-details-in": "MbMUpq_voice-details-in",
			"voiceDetails": "MbMUpq_voiceDetails",
			"voicePrivacy": "MbMUpq_voicePrivacy",
			"voiceSurface": "MbMUpq_voiceSurface"
		};
		//#endregion
		//#region lib/types/client/ProductCompanionSettings.js
		const SKINS = ["blue", "black"];
		const SIZE_OPTIONS = [{
			id: "standard",
			label: "size.standard"
		}, {
			id: "large",
			label: "size.large"
		}];
		const CLICK_OPTIONS = [
			{
				id: "focusComposer",
				label: "action.focusComposer"
			},
			{
				id: "voiceInput",
				label: "action.voiceInput"
			},
			{
				id: "none",
				label: "action.none"
			}
		];
		const DOUBLE_CLICK_OPTIONS = [
			{
				id: "newSession",
				label: "action.newSession"
			},
			{
				id: "voiceInput",
				label: "action.voiceInput"
			},
			{
				id: "focusComposer",
				label: "action.focusComposer"
			},
			{
				id: "none",
				label: "action.none"
			}
		];
		const CONTEXT_OPTIONS = [
			{
				id: "menu",
				label: "action.menu"
			},
			{
				id: "voiceInput",
				label: "action.voiceInput"
			},
			{
				id: "newSession",
				label: "action.newSession"
			},
			{
				id: "close",
				label: "action.close"
			},
			{
				id: "none",
				label: "action.none"
			}
		];
		function shortcutFromEvent(event) {
			if (event.key === "Escape") return "";
			if ([
				"Meta",
				"Control",
				"Alt",
				"Shift"
			].includes(event.key)) return null;
			const key = event.code === "Space" ? "Space" : event.key.length === 1 ? event.key.toUpperCase() : event.key;
			const pieces = [
				event.metaKey ? "Meta" : "",
				event.ctrlKey ? "Control" : "",
				event.altKey ? "Alt" : "",
				event.shiftKey ? "Shift" : "",
				key
			].filter(Boolean);
			return pieces.length > 1 ? pieces.join("+") : null;
		}
		function displayShortcut(shortcut) {
			return shortcut.replace("Meta", "⌘").replace("Control", "⌃").replace("Alt", "⌥").replace("Shift", "⇧").replaceAll("+", "").replace("Space", "Space");
		}
		function SelectorRow({ label, hint, value, options, onChange, t, params }) {
			const [open, setOpen] = (0, react.useState)(false);
			const selected = options.find((option) => option.id === value) ?? options[0];
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ProductCompanionSettings_module_css_default.row,
				children: [(0, react_jsx_runtime.jsxs)("span", {
					className: ProductCompanionSettings_module_css_default.rowCopy,
					children: [(0, react_jsx_runtime.jsx)("strong", { children: t(label, params) }), (0, react_jsx_runtime.jsx)("span", { children: t(hint, params) })]
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
					open,
					onClose: () => {
						setOpen(false);
					},
					items: options.map((option) => ({
						id: option.id,
						label: t(option.label, params)
					})),
					selectedId: value,
					onSelect: (id) => {
						setOpen(false);
						onChange(id);
					},
					align: "end",
					portal: true,
					compact: true,
					anchor: (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: ProductCompanionSettings_module_css_default.selector,
						"aria-haspopup": "menu",
						"aria-expanded": open,
						onClick: () => {
							setOpen((current) => !current);
						},
						children: [selected === void 0 ? "" : t(selected.label, params), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: ProductCompanionSettings_module_css_default.chevron })]
					})
				})]
			});
		}
		/** Dedicated settings page for the cross-page companion. */
		function ProductCompanionSettings({ useStore, actions, setLabel, t }) {
			const skin = useStore((state) => state.skin);
			const displayName = useStore((state) => state.displayName?.trim() || "鲸少女");
			const visible = useStore((state) => state.visible ?? true);
			const size = useStore((state) => state.size ?? "large");
			const clickAction = useStore((state) => state.clickAction ?? "focusComposer");
			const doubleClickAction = useStore((state) => state.doubleClickAction ?? "newSession");
			const contextAction = useStore((state) => state.contextAction ?? "menu");
			const showStatus = useStore((state) => state.showStatus ?? true);
			const voiceEnabled = useStore((state) => state.voiceEnabled ?? true);
			const voiceShortcut = useStore((state) => state.voiceShortcut ?? "Alt+Space");
			const [editingName, setEditingName] = (0, react.useState)(false);
			const [nameDraft, setNameDraft] = (0, react.useState)(displayName);
			const [recordingShortcut, setRecordingShortcut] = (0, react.useState)(false);
			const shortcutRef = (0, react.useRef)(null);
			const [rulesDocument, setRulesDocument] = (0, react.useState)(null);
			const [rulesDraft, setRulesDraft] = (0, react.useState)("");
			const [rulesStatus, setRulesStatus] = (0, react.useState)("idle");
			const [rulesReload, setRulesReload] = (0, react.useState)(0);
			const rulesDirty = rulesDocument !== null && rulesDraft !== rulesDocument.content;
			const rulesDirtyRef = (0, react.useRef)(rulesDirty);
			const rulesStatusRef = (0, react.useRef)(rulesStatus);
			rulesDirtyRef.current = rulesDirty;
			rulesStatusRef.current = rulesStatus;
			(0, react.useEffect)(() => {
				if (!editingName) setNameDraft(displayName);
			}, [displayName, editingName]);
			(0, react.useEffect)(() => {
				setLabel?.(displayName);
			}, [displayName, setLabel]);
			(0, react.useEffect)(() => {
				if (!recordingShortcut) return;
				shortcutRef.current?.focus();
			}, [recordingShortcut]);
			(0, react.useEffect)(() => {
				const controller = new AbortController();
				setRulesStatus((current) => current === "idle" ? "loading" : current);
				loadGlobalRules(controller.signal).then((document) => {
					if (rulesDirtyRef.current) return;
					setRulesDocument(document);
					setRulesDraft(document.content);
					setRulesStatus("ready");
				}, (error) => {
					if (controller.signal.aborted) return;
					console.warn("[product-companion global rules] load failed:", error);
					setRulesStatus("error");
				});
				return () => {
					controller.abort();
				};
			}, [rulesReload]);
			(0, react.useEffect)(() => {
				const refresh = () => {
					if (document.visibilityState !== "visible" || rulesDirtyRef.current || rulesStatusRef.current === "loading" || rulesStatusRef.current === "saving") return;
					setRulesReload((value) => value + 1);
				};
				window.addEventListener("focus", refresh);
				document.addEventListener("visibilitychange", refresh);
				const interval = window.setInterval(refresh, 5e3);
				return () => {
					window.removeEventListener("focus", refresh);
					document.removeEventListener("visibilitychange", refresh);
					window.clearInterval(interval);
				};
			}, []);
			const saveName = () => {
				actions.setDisplayName(nameDraft);
				setEditingName(false);
			};
			const shortcutOptions = voiceEnabled ? CLICK_OPTIONS : CLICK_OPTIONS.filter((option) => option.id !== "voiceInput");
			const doubleClickOptions = voiceEnabled ? DOUBLE_CLICK_OPTIONS : DOUBLE_CLICK_OPTIONS.filter((option) => option.id !== "voiceInput");
			const contextOptions = voiceEnabled ? CONTEXT_OPTIONS : CONTEXT_OPTIONS.filter((option) => option.id !== "voiceInput");
			const persistGlobalRules = async () => {
				if (rulesDocument === null || !rulesDirty || rulesStatus === "saving" || rulesStatus === "conflict") return;
				setRulesStatus("saving");
				try {
					const saved = await saveGlobalRules({
						content: rulesDraft,
						revision: rulesDocument.revision
					});
					setRulesDocument(saved);
					setRulesDraft(saved.content);
					setRulesStatus("ready");
				} catch (error) {
					console.warn("[product-companion global rules] save failed:", error);
					setRulesStatus(error instanceof GlobalRulesRequestError && error.status === 409 ? "conflict" : "error");
				}
			};
			const loadLatestGlobalRules = () => {
				setRulesDocument(null);
				setRulesDraft("");
				setRulesStatus("loading");
				setRulesReload((value) => value + 1);
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ProductCompanionSettings_module_css_default.section,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: ProductCompanionSettings_module_css_default.heading,
						children: [editingName ? (0, react_jsx_runtime.jsxs)("form", {
							className: ProductCompanionSettings_module_css_default.nameEditor,
							onSubmit: (event) => {
								event.preventDefault();
								saveName();
							},
							children: [
								(0, react_jsx_runtime.jsx)("input", {
									autoFocus: true,
									value: nameDraft,
									"aria-label": t("nameInput"),
									onChange: (event) => {
										setNameDraft(event.currentTarget.value);
									},
									onKeyDown: (event) => {
										if (event.key === "Escape") {
											setNameDraft(displayName);
											setEditingName(false);
										}
									}
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "submit",
									"aria-label": t("saveName"),
									title: t("saveName"),
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, { size: 15 })
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": t("cancelName"),
									title: t("cancelName"),
									onClick: () => {
										setNameDraft(displayName);
										setEditingName(false);
									},
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 15 })
								})
							]
						}) : (0, react_jsx_runtime.jsxs)("div", {
							className: ProductCompanionSettings_module_css_default.nameTitle,
							children: [(0, react_jsx_runtime.jsx)("h2", { children: displayName }), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": t("editName"),
								title: t("editName"),
								onClick: () => {
									setEditingName(true);
								},
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutline16, { size: 15 })
							})]
						}), (0, react_jsx_runtime.jsx)("p", { children: t("intro", { name: displayName }) })]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: ProductCompanionSettings_module_css_default.group,
						"aria-labelledby": "product-companion-appearance",
						children: [
							(0, react_jsx_runtime.jsx)("h3", {
								id: "product-companion-appearance",
								children: t("appearance")
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: ProductCompanionSettings_module_css_default.skinGrid,
								role: "radiogroup",
								"aria-label": t("appearance"),
								children: SKINS.map((candidate) => (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: ProductCompanionSettings_module_css_default.skinOption,
									role: "radio",
									"aria-checked": skin === candidate,
									"data-selected": skin === candidate ? "true" : "false",
									onClick: () => {
										actions.setSkin(candidate);
									},
									children: [
										(0, react_jsx_runtime.jsx)("span", {
											className: ProductCompanionSettings_module_css_default.skinPreview,
											children: (0, react_jsx_runtime.jsx)("img", {
												src: companionFrameUrl(candidate, "lounge"),
												alt: "",
												draggable: false
											})
										}),
										(0, react_jsx_runtime.jsxs)("span", {
											className: ProductCompanionSettings_module_css_default.skinCopy,
											children: [(0, react_jsx_runtime.jsx)("strong", { children: t(`skin.${candidate}`) }), (0, react_jsx_runtime.jsx)("span", { children: t(`skin.${candidate}Hint`) })]
										}),
										(0, react_jsx_runtime.jsx)("span", {
											className: ProductCompanionSettings_module_css_default.selectionMark,
											"aria-hidden": "true"
										})
									]
								}, candidate))
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: ProductCompanionSettings_module_css_default.rows,
								children: (0, react_jsx_runtime.jsx)(SelectorRow, {
									label: "sizeLabel",
									hint: "sizeHint",
									value: size,
									options: SIZE_OPTIONS,
									onChange: (value) => {
										actions.setSize(value);
									},
									t
								})
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: ProductCompanionSettings_module_css_default.group,
						"aria-labelledby": "product-companion-shortcuts",
						children: [(0, react_jsx_runtime.jsx)("h3", {
							id: "product-companion-shortcuts",
							children: t("shortcuts")
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: ProductCompanionSettings_module_css_default.rows,
							children: [
								(0, react_jsx_runtime.jsx)(SelectorRow, {
									label: "clickLabel",
									hint: "clickHint",
									value: clickAction,
									options: shortcutOptions,
									onChange: (value) => {
										actions.setClickAction(value);
									},
									t
								}),
								(0, react_jsx_runtime.jsx)(SelectorRow, {
									label: "doubleClickLabel",
									hint: "doubleClickHint",
									value: doubleClickAction,
									options: doubleClickOptions,
									onChange: (value) => {
										actions.setDoubleClickAction(value);
									},
									t
								}),
								(0, react_jsx_runtime.jsx)(SelectorRow, {
									label: "contextLabel",
									hint: "contextHint",
									value: contextAction,
									options: contextOptions,
									onChange: (value) => {
										actions.setContextAction(value);
									},
									params: { name: displayName },
									t
								})
							]
						})]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: ProductCompanionSettings_module_css_default.group,
						"aria-labelledby": "product-companion-global-rules",
						children: [(0, react_jsx_runtime.jsx)("h3", {
							id: "product-companion-global-rules",
							children: t("rules.title")
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: ProductCompanionSettings_module_css_default.rulesSurface,
							children: [
								(0, react_jsx_runtime.jsx)("div", {
									className: ProductCompanionSettings_module_css_default.rulesHeader,
									children: (0, react_jsx_runtime.jsxs)("span", {
										className: ProductCompanionSettings_module_css_default.rowCopy,
										children: [(0, react_jsx_runtime.jsx)("strong", { children: "AGENTS.md" }), (0, react_jsx_runtime.jsx)("span", { children: t("rules.hint", { path: rulesDocument?.displayPath ?? "~/.dsh/AGENTS.md" }) })]
									})
								}),
								rulesStatus === "loading" ? (0, react_jsx_runtime.jsx)("p", {
									className: ProductCompanionSettings_module_css_default.rulesNotice,
									children: t("rules.loading")
								}) : null,
								rulesStatus === "error" ? (0, react_jsx_runtime.jsxs)("p", {
									className: ProductCompanionSettings_module_css_default.rulesError,
									role: "alert",
									children: [t("rules.error"), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ProductCompanionSettings_module_css_default.textButton,
										onClick: loadLatestGlobalRules,
										children: t("rules.retry")
									})]
								}) : null,
								rulesStatus === "conflict" ? (0, react_jsx_runtime.jsxs)("p", {
									className: ProductCompanionSettings_module_css_default.rulesError,
									role: "alert",
									children: [t("rules.conflict"), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ProductCompanionSettings_module_css_default.textButton,
										onClick: loadLatestGlobalRules,
										children: t("rules.loadLatest")
									})]
								}) : null,
								rulesDocument !== null ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("textarea", {
									className: ProductCompanionSettings_module_css_default.rulesEditor,
									"aria-label": t("rules.editorLabel"),
									value: rulesDraft,
									spellCheck: false,
									placeholder: t("rules.placeholder"),
									onChange: (event) => {
										setRulesDraft(event.currentTarget.value);
										if (rulesStatus === "error") setRulesStatus("ready");
									},
									onKeyDown: (event) => {
										if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
											event.preventDefault();
											persistGlobalRules();
										}
									}
								}), (0, react_jsx_runtime.jsxs)("div", {
									className: ProductCompanionSettings_module_css_default.rulesFooter,
									children: [(0, react_jsx_runtime.jsx)("span", {
										"aria-live": "polite",
										children: rulesStatus === "saving" ? t("rules.saving") : rulesDirty ? t("rules.unsaved") : t("rules.saved")
									}), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ProductCompanionSettings_module_css_default.primaryButton,
										disabled: !rulesDirty || rulesStatus === "saving" || rulesStatus === "conflict",
										onClick: () => {
											persistGlobalRules();
										},
										children: t("rules.save")
									})]
								})] }) : null
							]
						})]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: ProductCompanionSettings_module_css_default.group,
						"aria-labelledby": "product-companion-voice",
						children: [(0, react_jsx_runtime.jsx)("h3", {
							id: "product-companion-voice",
							children: t("voice.title")
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: ProductCompanionSettings_module_css_default.voiceSurface,
							"data-enabled": voiceEnabled ? "true" : "false",
							children: [(0, react_jsx_runtime.jsxs)("label", {
								className: ProductCompanionSettings_module_css_default.row,
								children: [(0, react_jsx_runtime.jsxs)("span", {
									className: ProductCompanionSettings_module_css_default.rowCopy,
									children: [(0, react_jsx_runtime.jsx)("strong", { children: t("voice.enabledLabel") }), (0, react_jsx_runtime.jsx)("span", { children: t("voice.enabledHint", { name: displayName }) })]
								}), (0, react_jsx_runtime.jsx)("input", {
									className: ProductCompanionSettings_module_css_default.switch,
									type: "checkbox",
									"aria-label": t("voice.enabledLabel"),
									checked: voiceEnabled,
									onChange: (event) => {
										actions.setVoiceEnabled(event.currentTarget.checked);
									}
								})]
							}), voiceEnabled ? (0, react_jsx_runtime.jsxs)("div", {
								className: ProductCompanionSettings_module_css_default.voiceDetails,
								children: [(0, react_jsx_runtime.jsxs)("div", {
									className: ProductCompanionSettings_module_css_default.row,
									children: [(0, react_jsx_runtime.jsxs)("span", {
										className: ProductCompanionSettings_module_css_default.rowCopy,
										children: [(0, react_jsx_runtime.jsx)("strong", { children: t("voice.shortcutLabel") }), (0, react_jsx_runtime.jsx)("span", { children: recordingShortcut ? t("voice.shortcutRecording") : t("voice.shortcutHintSetting") })]
									}), (0, react_jsx_runtime.jsx)("button", {
										ref: shortcutRef,
										type: "button",
										className: ProductCompanionSettings_module_css_default.shortcutRecorder,
										"data-voice-shortcut-recording": recordingShortcut ? "true" : void 0,
										onClick: () => {
											setRecordingShortcut(true);
										},
										onBlur: () => {
											setRecordingShortcut(false);
										},
										onKeyDown: (event) => {
											if (!recordingShortcut) return;
											event.preventDefault();
											event.stopPropagation();
											const shortcut = shortcutFromEvent(event);
											if (shortcut === null) return;
											if (shortcut.length > 0) actions.setVoiceShortcut(shortcut);
											setRecordingShortcut(false);
										},
										children: recordingShortcut ? t("voice.shortcutWaiting") : displayShortcut(voiceShortcut)
									})]
								}), (0, react_jsx_runtime.jsx)("p", {
									className: ProductCompanionSettings_module_css_default.voicePrivacy,
									children: t("voice.privacy")
								})]
							}) : null]
						})]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: ProductCompanionSettings_module_css_default.group,
						"aria-labelledby": "product-companion-behavior",
						children: [
							(0, react_jsx_runtime.jsx)("h3", {
								id: "product-companion-behavior",
								children: t("behavior")
							}),
							(0, react_jsx_runtime.jsxs)("label", {
								className: ProductCompanionSettings_module_css_default.row,
								children: [(0, react_jsx_runtime.jsxs)("span", {
									className: ProductCompanionSettings_module_css_default.rowCopy,
									children: [(0, react_jsx_runtime.jsx)("strong", { children: t("visibleLabel", { name: displayName }) }), (0, react_jsx_runtime.jsx)("span", { children: t("visibleHint") })]
								}), (0, react_jsx_runtime.jsx)("input", {
									className: ProductCompanionSettings_module_css_default.switch,
									type: "checkbox",
									"aria-label": t("visibleLabel", { name: displayName }),
									checked: visible,
									onChange: (event) => {
										actions.setVisible(event.currentTarget.checked);
									}
								})]
							}),
							(0, react_jsx_runtime.jsxs)("label", {
								className: ProductCompanionSettings_module_css_default.row,
								children: [(0, react_jsx_runtime.jsxs)("span", {
									className: ProductCompanionSettings_module_css_default.rowCopy,
									children: [(0, react_jsx_runtime.jsx)("strong", { children: t("statusLabel") }), (0, react_jsx_runtime.jsx)("span", { children: t("statusHint") })]
								}), (0, react_jsx_runtime.jsx)("input", {
									className: ProductCompanionSettings_module_css_default.switch,
									type: "checkbox",
									"aria-label": t("statusLabel"),
									checked: showStatus,
									onChange: (event) => {
										actions.setShowStatus(event.currentTarget.checked);
									}
								})]
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: ProductCompanionSettings_module_css_default.privacy,
						children: t("privacy")
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Simplified-Chinese companion dictionary and key source of truth. */
		const zh = {
			name: "鲸少女",
			"state.idle": "在旁边陪你",
			"state.working": "正在生成回复",
			"state.waiting": "有任务等你确认",
			"state.success": "刚刚完成了一项任务",
			"state.sleep": "休息中",
			"bubble.working": "正在回应",
			"bubble.waiting": "等待你确认",
			"bubble.success": "已完成",
			"task.working": "正在处理",
			"task.approval": "等待你批准",
			"task.planReview": "等待你审阅方案",
			"task.question": "等待你回答",
			"task.current": "当前对话",
			"task.listLabel": "进行中的任务",
			"task.open": "打开对话：{title}",
			"task.expand": "展开 {count} 个进行中的任务",
			"task.collapse": "收起 {count} 个进行中的任务",
			"task.count": "{count} 个任务正在进行",
			"task.none": "暂无进行中的任务",
			"voice.title": "麦克风听写",
			"voice.enabledLabel": "启用麦克风听写",
			"voice.enabledHint": "把浏览器识别出的原文直接放进当前输入框，不调用模型。",
			"voice.shortcutLabel": "应用内快捷键",
			"voice.shortcutHintSetting": "DSH 窗口处于前台时，按快捷键即可开始或结束听写。",
			"voice.shortcutRecording": "请直接按下新的组合键；按 Esc 取消。",
			"voice.shortcutWaiting": "等待按键",
			"voice.privacy": "音频由浏览器的语音识别能力处理；插件不保存录音或听写正文，也不会把识别文字发送给模型。",
			"voice.start": "开始语音输入",
			"voice.stop": "结束听写",
			"voice.listening": "正在听…再次点击即可结束",
			"voice.inserted": "已放入输入框",
			"voice.noSpeech": "没有听清，请再试一次",
			"voice.permissionDenied": "麦克风未授权，请在浏览器或系统设置中允许",
			"voice.recognitionFailed": "语音识别暂时不可用，请重试",
			"voice.composerMissing": "当前没有可用的输入框",
			"voice.unsupported": "当前浏览器不支持语音识别",
			"duration.seconds": "{seconds}秒",
			"duration.minutes": "{minutes}分{seconds}秒",
			interact: "{name}；快捷动作可在设置中修改",
			closeAction: "关闭{name}",
			newSessionAction: "新建对话",
			focusComposerAction: "聚焦输入框",
			intro: "{name}常驻输入框上方，跟随 Agent 状态陪伴你。",
			editName: "修改名字",
			nameInput: "精灵名字",
			saveName: "保存名字",
			cancelName: "取消修改",
			appearance: "外观",
			"skin.blue": "深海蓝",
			"skin.blueHint": "明亮、轻快的 DeepSeek 蓝色皮肤",
			"skin.black": "夜航黑",
			"skin.blackHint": "更安静的深色皮肤",
			sizeLabel: "角色大小",
			sizeHint: "放大后仍会用身体轮廓贴住输入框上沿。",
			"size.standard": "标准",
			"size.large": "放大",
			shortcuts: "快捷操作",
			"rules.title": "全局规则",
			"rules.hint": "实时编辑 {path}；保存后作为 DSH 内部最高规则，从所有对话的下一轮起生效。",
			"rules.loading": "正在读取最新规则…",
			"rules.error": "暂时无法读取全局规则。",
			"rules.conflict": "文件已在其他地方更新，为避免覆盖请载入最新内容。",
			"rules.editorLabel": "编辑全局 AGENTS.md",
			"rules.placeholder": "# 全局规则\n\n写下希望 Agent 在所有对话中遵循的规则。",
			"rules.loadLatest": "载入最新内容",
			"rules.retry": "重试",
			"rules.save": "保存修改",
			"rules.saving": "正在保存…",
			"rules.unsaved": "有未保存修改",
			"rules.saved": "已全局生效",
			clickLabel: "单击",
			clickHint: "默认把光标放回输入框，不打断当前任务。",
			doubleClickLabel: "双击",
			doubleClickHint: "默认继承当前工作区并新建对话。",
			contextLabel: "右键",
			contextHint: "默认打开关闭菜单，也可以改成直接执行快捷动作。",
			"action.none": "无操作",
			"action.focusComposer": "聚焦输入框",
			"action.voiceInput": "开始语音输入",
			"action.newSession": "新建对话",
			"action.menu": "打开操作菜单",
			"action.close": "关闭{name}",
			interaction: "行为",
			behavior: "显示与反馈",
			visibleLabel: "显示{name}",
			visibleHint: "固定在输入框右上方；关闭后可随时在这里重新开启。",
			statusLabel: "显示任务状态",
			statusHint: "生成、等待确认和完成时，显示真实阶段与已用时间。",
			travelLabel: "跟随当前任务",
			travelHint: "只在输入框真实换位时消散并重组；位置不变时保持趴姿。",
			resetLabel: "默认位置",
			resetHint: "恢复{name}首次出现时的位置。",
			resetAction: "恢复默认位置",
			privacy: "数字伙伴不保存消息内容；麦克风听写只使用浏览器语音识别，不调用模型。"
		};
		/** English dictionary checked against the Chinese key set. */
		const en = {
			name: "Whale Girl",
			"state.idle": "Keeping you company",
			"state.working": "Generating a response",
			"state.waiting": "A task needs your attention",
			"state.success": "A task just finished",
			"state.sleep": "Resting",
			"bubble.working": "Responding",
			"bubble.waiting": "Waiting for you",
			"bubble.success": "Completed",
			"task.working": "Working",
			"task.approval": "Waiting for approval",
			"task.planReview": "Waiting for plan review",
			"task.question": "Waiting for your answer",
			"task.current": "Current conversation",
			"task.listLabel": "Active tasks",
			"task.open": "Open conversation: {title}",
			"task.expand": "Expand {count} active tasks",
			"task.collapse": "Collapse {count} active tasks",
			"task.count": "{count} active tasks",
			"task.none": "No active tasks",
			"voice.title": "Microphone dictation",
			"voice.enabledLabel": "Enable microphone dictation",
			"voice.enabledHint": "Insert the browser-recognized transcript directly into the current composer without calling a model.",
			"voice.shortcutLabel": "In-app shortcut",
			"voice.shortcutHintSetting": "Start or stop dictation while the DSH window is in front.",
			"voice.shortcutRecording": "Press a new key combination now; press Esc to cancel.",
			"voice.shortcutWaiting": "Press keys",
			"voice.privacy": "Audio is handled by the browser speech-recognition service. The plugin stores neither recordings nor transcripts and never sends recognized text to a model.",
			"voice.start": "Start voice input",
			"voice.stop": "Stop dictation",
			"voice.listening": "Listening… click again to finish",
			"voice.inserted": "Added to the composer",
			"voice.noSpeech": "Nothing was heard. Please try again.",
			"voice.permissionDenied": "Microphone access is blocked. Allow it in your browser or system settings.",
			"voice.recognitionFailed": "Speech recognition is temporarily unavailable.",
			"voice.composerMissing": "There is no active composer.",
			"voice.unsupported": "This browser does not support speech recognition.",
			"duration.seconds": "{seconds}s",
			"duration.minutes": "{minutes}m {seconds}s",
			interact: "{name}; customize shortcuts in Settings",
			closeAction: "Close {name}",
			newSessionAction: "New conversation",
			focusComposerAction: "Focus composer",
			intro: "{name} stays above the composer and follows the Agent’s current state.",
			editName: "Edit name",
			nameInput: "Character name",
			saveName: "Save name",
			cancelName: "Cancel editing",
			appearance: "Appearance",
			"skin.blue": "Deep Sea Blue",
			"skin.blueHint": "A bright, lively DeepSeek-blue skin",
			"skin.black": "Night Black",
			"skin.blackHint": "A quieter dark skin",
			sizeLabel: "Character size",
			sizeHint: "The visible silhouette still touches the composer edge when enlarged.",
			"size.standard": "Standard",
			"size.large": "Large",
			shortcuts: "Quick actions",
			"rules.title": "Global instructions",
			"rules.hint": "Edit {path} live; saves become DSH's highest internal instructions on every conversation's next turn.",
			"rules.loading": "Loading the latest instructions…",
			"rules.error": "Global instructions could not be loaded.",
			"rules.conflict": "The file changed elsewhere. Load the latest content to avoid overwriting it.",
			"rules.editorLabel": "Edit the global AGENTS.md",
			"rules.placeholder": "# Global guidance\n\nWrite the rules the Agent should follow in every conversation.",
			"rules.loadLatest": "Load latest content",
			"rules.retry": "Retry",
			"rules.save": "Save changes",
			"rules.saving": "Saving…",
			"rules.unsaved": "Unsaved changes",
			"rules.saved": "Active globally",
			clickLabel: "Single click",
			clickHint: "Focus the composer by default without interrupting the current task.",
			doubleClickLabel: "Double click",
			doubleClickHint: "Start a new conversation in the current workspace by default.",
			contextLabel: "Right click",
			contextHint: "Open the close menu by default, or run one shortcut directly.",
			"action.none": "Do nothing",
			"action.focusComposer": "Focus composer",
			"action.voiceInput": "Start voice input",
			"action.newSession": "New conversation",
			"action.menu": "Open action menu",
			"action.close": "Close {name}",
			interaction: "Behavior",
			behavior: "Visibility and feedback",
			visibleLabel: "Show {name}",
			visibleHint: "Keep it above the composer’s right edge; reopen it here after closing.",
			statusLabel: "Show task status",
			statusHint: "Show the real phase and elapsed time while responding, waiting, and completing.",
			travelLabel: "Follow the current task",
			travelHint: "Dissolve and reform only when the composer truly moves; remain prone when it stays put.",
			resetLabel: "Default position",
			resetHint: "Restore the position where {name} first appears.",
			resetAction: "Restore default position",
			privacy: "The companion never stores message contents. Microphone dictation uses browser speech recognition and never calls a model."
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Browser half of the native cross-page product companion plugin. */
		const NS = "productCompanion";
		/** Runtime, locale and layout slot services required by the companion. */
		const inject = [
			"slots",
			"sessions",
			"workspaces",
			"locale"
		];
		/** Register one additive, root-scoped companion above every product page. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-product-companion: dictionaries");
			const store = createCompanionStore();
			if (!(0, _deepseek_ai_dsh_client_runtime_client.isAuxiliaryDshWindow)()) ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "product-companion",
				order: 40,
				locale: NS,
				store,
				inject: () => ({
					startSession: () => {
						ctx.workspaces.startSession();
					},
					openSession: (id) => {
						ctx.sessions.open(id);
					}
				})
			}, ProductCompanion));
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "product-companion",
				order: 60,
				label: persistedCompanionName,
				locale: NS,
				store
			}, ProductCompanionSettings));
		}
		//#endregion
		exports.DEFAULT_COMPANION_NAME = DEFAULT_COMPANION_NAME;
		exports.DEFAULT_VOICE_SHORTCUT = DEFAULT_VOICE_SHORTCUT;
		exports.ProductCompanion = ProductCompanion;
		exports.ProductCompanionSettings = ProductCompanionSettings;
		exports.apply = apply;
		exports.companionDissolveMaskUrl = companionDissolveMaskUrl;
		exports.companionFrameUrl = companionFrameUrl;
		exports.deriveCompanionActivity = deriveCompanionActivity;
		exports.deriveCompanionTasks = deriveCompanionTasks;
		exports.inject = inject;
		exports.insertVoiceText = insertVoiceText;
		exports.matchesVoiceShortcut = matchesVoiceShortcut;
		exports.persistedCompanionName = persistedCompanionName;
		exports.useVoiceInput = useVoiceInput;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map