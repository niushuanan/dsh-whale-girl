window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-product-companion",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		//#region lib/types/client/activity.js
		/**
		* Project every live or attention-blocked conversation into one compact switcher row.
		* Attention comes first, followed by the open conversation and then the freshest work.
		*/
		function interactionStatus(interactions, id) {
			const kind = interactions?.get(id)?.kind;
			return kind === "approval" || kind === "plan-review" || kind === "question" ? kind : void 0;
		}
		function deriveCompanionTasks(sessions, interactions) {
			return sessions.ids.map((id) => sessions.byId[id]).filter((row) => row !== void 0 && (row.running || interactionStatus(interactions, row.id) !== void 0)).map((row) => ({
				id: row.id,
				title: row.displayTitle,
				current: row.id === sessions.current,
				status: interactionStatus(interactions, row.id) ?? "working",
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
		function deriveCompanionActivity(sessions, interactions) {
			const rows = sessions.ids.map((id) => sessions.byId[id]).filter((row) => row !== void 0);
			const waitingRows = rows.filter((row) => interactionStatus(interactions, row.id) !== void 0);
			const runningRows = rows.filter((row) => row.running);
			const current = sessions.current === void 0 ? void 0 : sessions.byId[sessions.current];
			const focus = current !== void 0 && interactionStatus(interactions, current.id) !== void 0 ? current : waitingRows[0] ?? (current?.running === true ? current : runningRows[0]);
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
			return (0, _deepseek_ai_dsh_client_store.defineStore)({
				init: () => ({
					skin: "blue",
					displayName: DEFAULT_COMPANION_NAME,
					visible: true,
					size: "large",
					clickAction: "focusComposer",
					doubleClickAction: "newSession",
					contextAction: "menu",
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
					setComposerOffsetRatio: (draft, ratio) => {
						draft.composerOffsetRatio = Math.max(0, Math.min(1, ratio));
					},
					setShowStatus: (draft, enabled) => {
						draft.showStatus = enabled;
					},
					setAutoTravel: (draft, enabled) => {
						draft.autoTravel = enabled;
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
		/**
		* Map a persisted 0–1 offset ratio to the companion's left edge: 0 hugs the
		* composer's left inset, 1 the right inset (the historical default berth).
		* A card narrower than the character parks at the left inset.
		*
		* @param ratio - Persisted horizontal offset as a 0–1 fraction of usable width.
		* @param composer - Visible composer card rectangle.
		* @param petWidth - Rendered companion width in pixels.
		* @returns The companion's left edge in viewport pixels.
		*/
		function composerXForRatio(ratio, composer, petWidth) {
			const usable = composer.width - 6 - 14 - petWidth;
			if (usable <= 0) return composer.left + 6;
			const bounded = Math.max(0, Math.min(1, ratio));
			return composer.left + 6 + bounded * usable;
		}
		/**
		* Inverse of {@link composerXForRatio}: derive the persisted ratio from a left
		* edge the user dragged to, clamped into the usable span.
		*
		* @param x - Proposed companion left edge in viewport pixels.
		* @param composer - Visible composer card rectangle.
		* @param petWidth - Rendered companion width in pixels.
		* @returns The clamped 0–1 offset ratio to persist.
		*/
		function composerRatioForX(x, composer, petWidth) {
			const usable = composer.width - 6 - 14 - petWidth;
			if (usable <= 0) return 1;
			return (Math.max(composer.left + 6, Math.min(x, composer.left + 6 + usable)) - composer.left - 6) / usable;
		}
		/**
		* Keep the authored lounge silhouette touching the composer's top border
		* without covering its text.
		*
		* @param top - Composer card top edge in viewport pixels.
		* @param petHeight - Rendered companion height in pixels.
		* @param bottomInset - Authored overlap of the transparent canvas edge.
		* @returns The companion's top edge in viewport pixels.
		*/
		function composerYForTop(top, petHeight, bottomInset) {
			return top - petHeight + bottomInset;
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
		//#region \0dsh-css:/private/tmp/dsh-companion-check.GtPND2/packages/client/ui-product-companion/src/client/ProductCompanion.module.css.mjs
		const css$1 = ".O59ykq_root{--habitat-rotate:0deg;--habitat-scale:1;--habitat-x:0px;--companion-x:0px;--companion-y:0px;--pose-x:0px;--pose-y:10px;--pose-rotate:0deg;--pose-scale:1;--companion-width:132px;--companion-height:118px;--dissolve-phase-ms:.92s;--dissolve-frame-crossfade-ms:36ms;z-index:28;width:var(--companion-width);height:var(--companion-height);pointer-events:auto;user-select:none;transform:translate3d(var(--companion-x), var(--companion-y), 0);will-change:transform;contain:layout style;position:fixed;top:0;left:0}.O59ykq_root[data-habitat=composer]{--habitat-rotate:0deg;--habitat-scale:1}.O59ykq_character{width:var(--companion-width);height:var(--companion-height);touch-action:none;cursor:grab;background:0 0;border:0;outline:none;padding:0;display:block;position:relative}.O59ykq_root[data-dragging=true] .O59ykq_character{cursor:grabbing}.O59ykq_contextMenu{width:var(--companion-width);height:var(--companion-height)}.O59ykq_contextMenu>[role=menu]{min-width:116px}.O59ykq_poseLayer,.O59ykq_motionLayer,.O59ykq_spriteLayer{pointer-events:none;transform-origin:bottom;display:block;position:absolute;inset:0}.O59ykq_poseLayer{transform:translate3d(var(--pose-x), var(--pose-y), 0) rotate(var(--pose-rotate)) scale(var(--pose-scale));will-change:transform;transition:transform .38s cubic-bezier(.2,.82,.24,1)}.O59ykq_motionLayer{will-change:translate, rotate, scale}.O59ykq_spriteLayer{transform:translate(var(--habitat-x), 0) rotate(var(--habitat-rotate)) scale(var(--habitat-scale));transition:transform .16s var(--ds-ease-out);backface-visibility:hidden}.O59ykq_characterImage{width:var(--companion-width);height:var(--companion-height);object-fit:contain;object-position:center bottom;pointer-events:none;backface-visibility:hidden;image-rendering:auto;will-change:contents;display:block;position:absolute;inset:0;transform:translateZ(0)}.O59ykq_materialDissolveLayer{pointer-events:none;backface-visibility:hidden;display:block;position:absolute;inset:0;transform:translateZ(0)}.O59ykq_materialCurrent,.O59ykq_materialPrevious,.O59ykq_materialFragments{-webkit-mask-image:var(--companion-material-mask);mask-image:var(--companion-material-mask);-webkit-mask-position:bottom;mask-position:bottom;-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}.O59ykq_materialCurrent{z-index:0}.O59ykq_materialPrevious{z-index:1;animation:O59ykq_material-mask-out var(--dissolve-frame-crossfade-ms) linear both}.O59ykq_materialFragments{z-index:2;opacity:var(--companion-fragment-opacity,.78);filter:saturate(1.12)brightness(1.06);transform:translate3d(var(--companion-fragment-x,1px), var(--companion-fragment-y,-2px), 0)}.O59ykq_root[data-track=lounge][data-motion=rest]{--pose-x:-2px;--pose-rotate:0deg;--pose-scale:1}.O59ykq_root[data-track=lounge][data-motion=rest] .O59ykq_motionLayer{animation:1.833s ease-in-out 80ms infinite O59ykq_lounge-breathe}.O59ykq_root[data-pose=sleep][data-motion=rest] .O59ykq_motionLayer{animation:4.2s ease-in-out .2s infinite O59ykq_sleep}.O59ykq_root[data-track=waiting][data-motion=rest] .O59ykq_motionLayer{animation:2.35s ease-in-out .1s infinite O59ykq_waiting}.O59ykq_root[data-track=success][data-motion=rest] .O59ykq_motionLayer{animation:1.05s cubic-bezier(.18,.82,.2,1) both O59ykq_respond}@keyframes O59ykq_material-mask-out{0%{opacity:1}to{opacity:0}}.O59ykq_bubble,.O59ykq_taskPanel{left:50%;bottom:calc(var(--companion-height) - 8px);width:min(248px,100vw - 24px);position:absolute;transform:translate(-50%)}.O59ykq_bubble{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-3);box-shadow:var(--dsw-shadow-lv1);animation:O59ykq_bubble-in .18s var(--ds-ease-out) both;color:inherit;text-align:left;cursor:pointer;border-radius:13px;padding:8px 11px;display:block}div.O59ykq_bubble{cursor:default;width:auto;max-width:180px}.O59ykq_voiceBubble{cursor:default;width:auto;min-width:92px;max-width:min(240px,100vw - 24px)}.O59ykq_voiceBubble .O59ykq_taskMeta{white-space:normal}.O59ykq_bubble:focus-visible,.O59ykq_taskRow:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.O59ykq_bubble:hover{background:var(--dsw-alias-bg-layer-2)}.O59ykq_taskTitle,.O59ykq_taskMeta{text-overflow:ellipsis;white-space:nowrap;display:block;overflow:hidden}.O59ykq_taskTitle{color:var(--dsw-alias-label-primary);font-size:12px;font-weight:600;line-height:17px}.O59ykq_taskMeta{color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:400;line-height:16px}.O59ykq_taskPanel{--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);overscroll-behavior:contain;scrollbar-width:thin;gap:6px;max-height:216px;padding:4px;display:grid;overflow:hidden auto}.O59ykq_taskPanel[data-state=closing]{pointer-events:none}.O59ykq_taskRow{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-3);width:100%;min-width:0;box-shadow:var(--dsw-shadow-lv1);text-align:left;cursor:pointer;transform-origin:bottom;transition:background-color .14s var(--ds-ease-out), border-color .14s var(--ds-ease-out);will-change:opacity, transform;border-radius:11px;padding:8px 10px;position:relative}.O59ykq_taskPanel[data-state=open] .O59ykq_taskRow{animation:O59ykq_task-bubble-in .28s cubic-bezier(.2, .9, .24, 1.08) var(--task-enter-delay) both}.O59ykq_taskPanel[data-state=closing] .O59ykq_taskRow{animation:O59ykq_task-bubble-out .17s cubic-bezier(.55, 0, .72, .35) var(--task-exit-delay) both}.O59ykq_taskRow:hover,.O59ykq_taskRow[data-current=true]{background:var(--dsw-alias-bg-module-platform)}.O59ykq_taskRow[data-current=true] .O59ykq_taskTitle{color:var(--dsw-alias-label-primary)}.O59ykq_bubble:after{border-right:1px solid var(--dsw-alias-border-l1);border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-3);content:\"\";width:7px;height:7px;position:absolute;bottom:-4px;left:50%;transform:translate(-50%)rotate(45deg)}.O59ykq_root[data-bubble-align=left] .O59ykq_bubble,.O59ykq_root[data-bubble-align=left] .O59ykq_taskPanel{left:4px;transform:none}.O59ykq_root[data-bubble-align=left] .O59ykq_bubble:after{left:30px}.O59ykq_root[data-bubble-align=right] .O59ykq_bubble,.O59ykq_root[data-bubble-align=right] .O59ykq_taskPanel{left:auto;right:4px;transform:none}.O59ykq_root[data-bubble-align=right] .O59ykq_bubble:after{left:auto;right:30px;transform:rotate(45deg)}.O59ykq_quickControls{z-index:4;transform-origin:top;will-change:opacity, transform;gap:5px;display:flex;position:absolute;bottom:-14px;left:50%;transform:translate(-50%)}.O59ykq_root[data-teleport=departing] .O59ykq_quickControls{pointer-events:none;animation:O59ykq_companion-accessories-depart var(--dissolve-phase-ms) cubic-bezier(.42, 0, .58, 1) both}.O59ykq_root[data-teleport=arriving] .O59ykq_quickControls{pointer-events:none;animation:O59ykq_companion-accessories-arrive var(--dissolve-phase-ms) cubic-bezier(.42, 0, .58, 1) both}.O59ykq_quickControl{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-3);width:30px;height:30px;box-shadow:var(--dsw-shadow-lv1);color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border-radius:50%;place-items:center;padding:0;transition:border-color .12s,background-color .12s,box-shadow .12s;display:grid}.O59ykq_quickControl:not(:disabled):hover{background:var(--dsw-alias-bg-module-platform);box-shadow:0 1px 4px #00000014}.O59ykq_quickControl[data-control=side],.O59ykq_quickControl[data-control=side]:not(:disabled):hover{border-color:var(--dsw-alias-label-primary);background:var(--dsw-alias-label-primary);box-shadow:var(--dsw-shadow-lv1);color:var(--dsw-alias-bg-base)}.O59ykq_quickControl:focus-visible{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 3px color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent);outline:0}.O59ykq_quickControl:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}.O59ykq_taskCount{text-align:center;min-width:1ch;font-size:12px;font-weight:600;line-height:1}.O59ykq_sideIcon{width:16px;height:12px;transition:transform .16s var(--ds-ease-out);display:block;position:relative}.O59ykq_sideIcon:before{content:\"\";background:currentColor;border-radius:999px;width:14px;height:2px;position:absolute;top:5px;left:1px}.O59ykq_sideIcon:after{content:\"\";border-bottom:2px solid;border-left:2px solid;width:6px;height:6px;position:absolute;top:2px;left:1px;transform:rotate(45deg)}.O59ykq_quickControl[data-direction=right] .O59ykq_sideIcon{transform:rotate(180deg)}.O59ykq_srOnly{clip:rect(0, 0, 0, 0);white-space:nowrap;clip-path:inset(50%);width:1px;height:1px;position:absolute;overflow:hidden}@keyframes O59ykq_bubble-in{0%{opacity:0;translate:0 3px}to{opacity:1;translate:0}}@keyframes O59ykq_task-bubble-in{0%{opacity:0;transform:translateY(12px)scale(.94)}72%{opacity:1;transform:translateY(-1px)scale(1.008)}to{opacity:1;transform:translateY(0)scale(1)}}@keyframes O59ykq_task-bubble-out{0%{opacity:1;transform:translateY(0)scale(1)}to{opacity:0;transform:translateY(10px)scale(.95)}}@keyframes O59ykq_companion-accessories-depart{0%,8%{opacity:1;transform:translate(-50%)translateY(0)scale(1)}40%,to{opacity:0;transform:translate(-50%)translateY(-5px)scale(.88)}}@keyframes O59ykq_companion-accessories-arrive{0%,38%{opacity:0;transform:translate(-50%)translateY(-5px)scale(.88)}88%,to{opacity:1;transform:translate(-50%)translateY(0)scale(1)}}@keyframes O59ykq_sleep{0%,to{translate:0;rotate:0deg}50%{translate:-1px 1.5px;rotate:-.45deg}}@keyframes O59ykq_waiting{0%,to{translate:0;rotate:0deg}38%{translate:0 -1px;rotate:-.25deg}66%{translate:1px -2px;rotate:.35deg}84%{translate:0 -1px;rotate:.1deg}}@keyframes O59ykq_lounge-breathe{0%,to{translate:0;rotate:0deg}32%{translate:-1px -1px;rotate:-.25deg}58%{translate:1px -2px;rotate:.2deg}78%{translate:0 -1px;rotate:0deg}}@keyframes O59ykq_respond{0%,to{translate:0;rotate:0deg}34%{translate:1px -2px;rotate:-.45deg}68%{translate:2px -3px;rotate:.7deg}88%{translate:1px -1px;rotate:.2deg}}@media (prefers-reduced-motion:reduce){.O59ykq_characterImage,.O59ykq_poseLayer,.O59ykq_motionLayer,.O59ykq_materialPrevious,.O59ykq_bubble,.O59ykq_taskRow{animation:none}.O59ykq_taskPanel[data-state=closing]{visibility:hidden}.O59ykq_poseLayer,.O59ykq_spriteLayer{transition-duration:1ms}}";
		const tagId$1 = "@deepseek-ai/dsh-client-ui-product-companion/ProductCompanion.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-product-companion";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var ProductCompanion_module_css_default = {
			"bubble": "O59ykq_bubble",
			"bubble-in": "O59ykq_bubble-in",
			"character": "O59ykq_character",
			"characterImage": "O59ykq_characterImage",
			"companion-accessories-arrive": "O59ykq_companion-accessories-arrive",
			"companion-accessories-depart": "O59ykq_companion-accessories-depart",
			"contextMenu": "O59ykq_contextMenu",
			"lounge-breathe": "O59ykq_lounge-breathe",
			"material-mask-out": "O59ykq_material-mask-out",
			"materialCurrent": "O59ykq_materialCurrent",
			"materialDissolveLayer": "O59ykq_materialDissolveLayer",
			"materialFragments": "O59ykq_materialFragments",
			"materialPrevious": "O59ykq_materialPrevious",
			"motionLayer": "O59ykq_motionLayer",
			"poseLayer": "O59ykq_poseLayer",
			"quickControl": "O59ykq_quickControl",
			"quickControls": "O59ykq_quickControls",
			"respond": "O59ykq_respond",
			"root": "O59ykq_root",
			"sideIcon": "O59ykq_sideIcon",
			"sleep": "O59ykq_sleep",
			"spriteLayer": "O59ykq_spriteLayer",
			"srOnly": "O59ykq_srOnly",
			"task-bubble-in": "O59ykq_task-bubble-in",
			"task-bubble-out": "O59ykq_task-bubble-out",
			"taskCount": "O59ykq_taskCount",
			"taskMeta": "O59ykq_taskMeta",
			"taskPanel": "O59ykq_taskPanel",
			"taskRow": "O59ykq_taskRow",
			"taskTitle": "O59ykq_taskTitle",
			"voiceBubble": "O59ykq_voiceBubble",
			"waiting": "O59ykq_waiting"
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
		const SESSION_ANCHOR_SETTLE_MS = 360;
		const MIN_TELEPORT_DISTANCE = 6;
		/** Horizontal pointer travel (px) that turns a press into a drag. */
		const DRAG_START_PX = 5;
		const LEFT_BERTH_RATIO = .1;
		const RIGHT_BERTH_RATIO = .9;
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
		/**
		* Measure the composer card and place the companion at the user's persisted
		* horizontal offset ratio (1 = the historical right berth, 0 = the left inset),
		* so any later composer move or resize keeps the same relative berth.
		*/
		function measureComposerAnchor(viewport, preference, offsetRatio) {
			const composer = visibleRect(document.querySelector("[data-composer-card]"));
			if (hasBlockingModal() || composer === null) return null;
			const size = companionSize(viewport, preference);
			return clampPosition({
				x: composerXForRatio(offsetRatio, composer, size.width),
				y: composerYForTop(composer.top, size.height, size.bottomInset)
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
			return "task.working";
		}
		const EMPTY_INTERACTIONS = /* @__PURE__ */ new Map();
		const useNoPendingInteractions = (selector) => selector(EMPTY_INTERACTIONS);
		/** Global product companion, mounted once above all app columns. */
		function ProductCompanion({ useSessions, useSessionPendingInteraction = useNoPendingInteractions, useStore, actions, startSession = () => void 0, openSession = () => void 0, t }) {
			const sessions = useSessions((snapshot) => snapshot);
			const interactions = useSessionPendingInteraction((snapshot) => snapshot);
			const activity = (0, react.useMemo)(() => deriveCompanionActivity(sessions, interactions), [interactions, sessions]);
			const activeTasks = (0, react.useMemo)(() => deriveCompanionTasks(sessions, interactions), [interactions, sessions]);
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
			const composerOffsetRatio = useStore((state) => state.composerOffsetRatio ?? 1);
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
			const dragState = (0, react.useRef)(null);
			const [dragging, setDragging] = (0, react.useState)(false);
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
			const composerAnchor = (0, react.useMemo)(() => measureComposerAnchor(viewport, sizePreference, composerOffsetRatio), [
				viewport,
				layoutRevision,
				sizePreference,
				composerOffsetRatio
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
			const moveToOppositeBerth = (0, react.useCallback)(() => {
				const targetRatio = composerOffsetRatio > .5 ? LEFT_BERTH_RATIO : RIGHT_BERTH_RATIO;
				const target = measureComposerAnchor(viewport, sizePreference, targetRatio);
				if (target === null) return;
				closeTasks();
				beginTeleport(target);
				actions.setComposerOffsetRatio(targetRatio);
			}, [
				actions,
				beginTeleport,
				closeTasks,
				composerOffsetRatio,
				sizePreference,
				viewport
			]);
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
				if (dragState.current?.moved === true) return;
				if (anchorSettleTimer.current !== null) {
					clearTimeout(anchorSettleTimer.current);
					anchorSettleTimer.current = null;
				}
				const sessionChanged = previousSession.current !== sessions.current;
				const interruptedAnchor = sessionChanged && sessionAnchorSettling.current ? previousAnchor.current : null;
				previousSession.current = sessions.current;
				if (sessionChanged) {
					sessionAnchorSettling.current = true;
					cancelTeleport();
					if (interruptedAnchor !== null) setRenderedPosition(interruptedAnchor);
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
				if (teleportPhaseRef.current !== "idle") {
					teleportTarget.current = composerAnchor;
					return;
				}
				if (!sessionAnchorSettling.current) {
					teleportTarget.current = composerAnchor;
					setRenderedPosition(composerAnchor);
					return;
				}
				const origin = interruptedAnchor ?? renderedPosition ?? from;
				if (!(positionDistance(composerAnchor, from) >= .5) && !sessionChanged) return;
				anchorSettleTimer.current = setTimeout(() => {
					anchorSettleTimer.current = null;
					sessionAnchorSettling.current = false;
					const stableAnchor = previousAnchor.current;
					if (stableAnchor === null) return;
					if (positionDistance(stableAnchor, origin) < MIN_TELEPORT_DISTANCE) {
						teleportTarget.current = stableAnchor;
						setRenderedPosition(stableAnchor);
						return;
					}
					beginTeleport(stableAnchor);
				}, SESSION_ANCHOR_SETTLE_MS);
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
			const characterState = currentSession !== void 0 && interactions.get(currentSession.id) !== void 0 ? "waiting" : currentSession?.running === true ? "working" : "idle";
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
						moveToOppositeBerth();
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
				moveToOppositeBerth,
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
			/**
			* Track a horizontal drag along the composer card: window-level listeners
			* keep the gesture alive outside the sprite, the 5px threshold separates a
			* drag from a click, and the final ratio commits through the store so every
			* later composer geometry reuses the same relative berth.
			*/
			const beginDragTracking = (0, react.useCallback)((down) => {
				const state = {
					pointerId: down.pointerId,
					pressX: down.clientX,
					grabOffsetX: down.clientX - position.x,
					moved: false,
					ratio: composerOffsetRatio
				};
				dragState.current = state;
				const detach = () => {
					window.removeEventListener("pointermove", onMove);
					window.removeEventListener("pointerup", onUp);
					window.removeEventListener("pointercancel", onCancel);
				};
				const onMove = (event) => {
					if (event.pointerId !== state.pointerId || dragState.current !== state) return;
					if (event.buttons === 0) {
						finish(true);
						return;
					}
					if (!state.moved) {
						if (Math.abs(event.clientX - state.pressX) < DRAG_START_PX) return;
						state.moved = true;
						setDragging(true);
						cancelTeleport();
					}
					const composer = visibleRect(document.querySelector("[data-composer-card]"));
					if (composer === null) return;
					const x = composerXForRatio(composerRatioForX(event.clientX - state.grabOffsetX, composer, renderedSize.width), composer, renderedSize.width);
					state.ratio = composerRatioForX(x, composer, renderedSize.width);
					setRenderedPosition({
						x,
						y: composerYForTop(composer.top, renderedSize.height, renderedSize.bottomInset)
					});
					event.preventDefault();
				};
				const finish = (committed) => {
					detach();
					if (dragState.current !== state) return;
					dragState.current = null;
					if (!state.moved) return;
					setDragging(false);
					suppressCharacterClick.current = true;
					clickThroughPress.current = null;
					if (committed) actions.setComposerOffsetRatio(state.ratio);
					setLayoutRevision((value) => value + 1);
				};
				const onUp = (event) => {
					if (event.pointerId !== state.pointerId) return;
					finish(true);
				};
				const onCancel = (event) => {
					if (event.pointerId !== state.pointerId) return;
					finish(false);
				};
				window.addEventListener("pointermove", onMove);
				window.addEventListener("pointerup", onUp);
				window.addEventListener("pointercancel", onCancel);
			}, [
				actions,
				cancelTeleport,
				composerOffsetRatio,
				position.x,
				renderedSize
			]);
			const onCharacterPointerDown = (event) => {
				if (event.button !== 0 || rootRef.current === null) return;
				beginDragTracking(event);
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
				if (dragState.current?.moved === true && dragState.current.pointerId === event.pointerId) return;
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
			const liveRatio = dragState.current?.moved === true ? dragState.current.ratio : composerOffsetRatio;
			const sideDirection = liveRatio > .5 ? "left" : "right";
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
				"data-side": liveRatio > .5 ? "right" : "left",
				"data-dragging": dragging ? "true" : "false",
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
						children: [(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: ProductCompanion_module_css_default.quickControl,
							"data-control": "side",
							"data-direction": sideDirection,
							disabled: accessoriesMoving,
							"aria-label": sideDirection === "left" ? t("side.moveLeft") : t("side.moveRight"),
							onClick: moveToOppositeBerth,
							children: (0, react_jsx_runtime.jsx)("span", {
								className: ProductCompanion_module_css_default.sideIcon,
								"aria-hidden": "true"
							})
						}), (0, react_jsx_runtime.jsx)("button", {
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
		//#region \0dsh-css:/private/tmp/dsh-companion-check.GtPND2/packages/client/ui-product-companion/src/client/ProductCompanionSettings.module.css.mjs
		const css = "._7HX8da_section{box-sizing:border-box;width:100%;max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}._7HX8da_pageHeader{margin-bottom:20px}._7HX8da_nameEditor{align-items:center;gap:6px;width:100%;min-width:0;max-width:348px;display:flex}._7HX8da_editNameButton,._7HX8da_nameEditor button{width:28px;height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:8px;flex:none;place-items:center;padding:0;display:grid}._7HX8da_editNameButton:hover,._7HX8da_nameEditor button:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}._7HX8da_editNameButton:focus-visible,._7HX8da_nameEditor button:focus-visible,._7HX8da_nameEditor input:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:2px}._7HX8da_nameEditor input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);width:auto;min-width:0;height:32px;color:var(--dsw-alias-label-primary);font:inherit;border-radius:9px;flex:1;padding:0 10px;font-size:15px;font-weight:560}._7HX8da_group{padding:0 0 24px}._7HX8da_group+._7HX8da_group{padding-top:4px}._7HX8da_group h3{color:var(--dsw-alias-label-tertiary);margin:0;padding:0 0 8px;font-size:12px;font-weight:500;line-height:18px}._7HX8da_skinGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0 10px;display:grid}._7HX8da_rows{margin-top:10px}._7HX8da_skinOption{border:1px solid var(--dsw-alias-border-l2);min-width:0;min-height:88px;color:inherit;font:inherit;text-align:left;cursor:pointer;background:0 0;border-radius:14px;align-items:center;gap:10px;padding:9px 30px 9px 9px;display:flex;position:relative}._7HX8da_skinOption:hover{background:var(--dsw-alias-bg-module-platform)}._7HX8da_skinOption[data-selected=true]{border-color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}._7HX8da_skinOption:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:2px}._7HX8da_skinPreview{background:var(--dsw-alias-bg-module-platform);border-radius:12px;flex:none;place-items:center;width:66px;height:66px;display:grid;overflow:hidden}._7HX8da_skinPreview img{object-fit:contain;pointer-events:none;width:66px;height:66px}._7HX8da_skinCopy,._7HX8da_rowCopy{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}._7HX8da_skinCopy strong,._7HX8da_rowCopy strong{font-size:13px;font-weight:500;line-height:20px}._7HX8da_skinCopy span,._7HX8da_rowCopy span{color:var(--dsw-alias-label-caption);font-size:11px;line-height:18px}._7HX8da_selectionMark{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);border-radius:50%;width:12px;height:12px;position:absolute;top:14px;right:14px}._7HX8da_skinOption[data-selected=true] ._7HX8da_selectionMark{border:4px solid var(--dsw-alias-label-primary)}._7HX8da_row{box-sizing:border-box;border:0;border-bottom:1px solid var(--dsw-alias-border-l2);align-items:center;gap:14px;min-height:62px;margin:0 10px;padding:10px 0;display:flex}._7HX8da_row:last-child{border-bottom:0}._7HX8da_selector{background:var(--dsw-alias-bg-module-platform);min-width:112px;height:32px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border:0;border-radius:999px;flex:none;justify-content:space-between;align-items:center;gap:10px;padding:0 11px 0 13px;font-size:12px;line-height:18px;display:inline-flex}._7HX8da_selector:hover{background:var(--dsw-alias-interactive-bg-hover)}._7HX8da_selector:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:2px}._7HX8da_chevron{color:var(--dsw-alias-label-tertiary);flex:none}._7HX8da_switch{box-sizing:border-box;appearance:none;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);cursor:pointer;border-radius:999px;flex:none;width:36px;height:21px;padding:2px}._7HX8da_switch:before{background:var(--dsw-alias-bg-base);content:\"\";border-radius:50%;width:15px;height:15px;transition:transform .14s;display:block;box-shadow:0 1px 2px #0000002e}._7HX8da_switch:checked{border-color:var(--dsw-alias-label-primary);background:var(--dsw-alias-label-primary)}._7HX8da_switch:checked:before{transform:translate(15px)}._7HX8da_textButton{color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border:0;flex:none;padding:0;font-size:11px;line-height:18px}._7HX8da_textButton:hover{color:var(--dsw-alias-label-primary)}._7HX8da_textButton:disabled{cursor:default;opacity:.45}._7HX8da_rulesSurface{background:var(--dsw-alias-bg-layer-2);border-radius:14px;margin:0 10px;overflow:hidden}._7HX8da_rulesHeader{align-items:center;gap:14px;min-height:58px;padding:10px 14px;display:flex}._7HX8da_rulesHeader ._7HX8da_rowCopy strong{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px}._7HX8da_rulesNotice,._7HX8da_rulesError{border-top:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-caption);margin:0;padding:16px 14px;font-size:11px;line-height:18px}._7HX8da_rulesError{color:var(--dsw-alias-label-primary)}._7HX8da_rulesError ._7HX8da_textButton{font-size:inherit;margin-left:8px}._7HX8da_rulesEditor{box-sizing:border-box;resize:vertical;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);width:calc(100% - 28px);min-height:210px;color:var(--dsw-alias-label-primary);tab-size:2;border-radius:10px;margin:0 14px;padding:11px 12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;line-height:19px;display:block}._7HX8da_rulesEditor:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:1px}._7HX8da_rulesFooter{min-height:52px;color:var(--dsw-alias-label-caption);justify-content:space-between;align-items:center;gap:12px;padding:0 14px;font-size:10px;line-height:16px;display:flex}._7HX8da_primaryButton{background:var(--dsw-alias-label-primary);height:30px;color:var(--dsw-alias-bg-base);font:inherit;cursor:pointer;border:0;border-radius:9px;flex:none;padding:0 13px;font-size:12px;font-weight:550}._7HX8da_primaryButton:disabled{cursor:default;opacity:.35}._7HX8da_voiceSurface{background:var(--dsw-alias-bg-layer-2);border-radius:14px;margin:0 10px}._7HX8da_voiceSurface ._7HX8da_row{margin:0 14px}._7HX8da_voiceSurface[data-enabled=false]{background:0 0}._7HX8da_voiceSurface[data-enabled=false] ._7HX8da_row{margin:0}._7HX8da_voiceDetails{animation:_7HX8da_voice-details-in .18s var(--ds-ease-out) both}._7HX8da_shortcutRecorder:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:2px}._7HX8da_shortcutRecorder{background:var(--dsw-alias-bg-base);min-width:74px;height:30px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border:0;border-radius:8px;flex:none;padding:0 10px;font-size:12px;font-weight:550}._7HX8da_shortcutRecorder[data-voice-shortcut-recording=true]{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-base)}._7HX8da_voicePrivacy{color:var(--dsw-alias-label-caption);margin:0;padding:0 14px 14px;font-size:10px;line-height:16px}._7HX8da_privacy{color:var(--dsw-alias-label-caption);margin:0 10px;font-size:11px;line-height:18px}@media (width<=680px){._7HX8da_skinGrid{grid-template-columns:1fr;margin-left:0;margin-right:0}._7HX8da_row,._7HX8da_privacy{margin-left:0;margin-right:0}._7HX8da_selector{min-width:104px}._7HX8da_voiceSurface,._7HX8da_rulesSurface{margin-left:0;margin-right:0}}@keyframes _7HX8da_voice-details-in{0%{opacity:0;translate:0 -4px}to{opacity:1;translate:0}}@media (prefers-reduced-motion:reduce){._7HX8da_switch:before{transition:none}._7HX8da_voiceDetails{animation:none}}";
		const tagId = "@deepseek-ai/dsh-client-ui-product-companion/ProductCompanionSettings.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-product-companion";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ProductCompanionSettings_module_css_default = {
			"chevron": "_7HX8da_chevron",
			"editNameButton": "_7HX8da_editNameButton",
			"group": "_7HX8da_group",
			"nameEditor": "_7HX8da_nameEditor",
			"pageHeader": "_7HX8da_pageHeader",
			"primaryButton": "_7HX8da_primaryButton",
			"privacy": "_7HX8da_privacy",
			"row": "_7HX8da_row",
			"rowCopy": "_7HX8da_rowCopy",
			"rows": "_7HX8da_rows",
			"rulesEditor": "_7HX8da_rulesEditor",
			"rulesError": "_7HX8da_rulesError",
			"rulesFooter": "_7HX8da_rulesFooter",
			"rulesHeader": "_7HX8da_rulesHeader",
			"rulesNotice": "_7HX8da_rulesNotice",
			"rulesSurface": "_7HX8da_rulesSurface",
			"section": "_7HX8da_section",
			"selectionMark": "_7HX8da_selectionMark",
			"selector": "_7HX8da_selector",
			"shortcutRecorder": "_7HX8da_shortcutRecorder",
			"skinCopy": "_7HX8da_skinCopy",
			"skinGrid": "_7HX8da_skinGrid",
			"skinOption": "_7HX8da_skinOption",
			"skinPreview": "_7HX8da_skinPreview",
			"switch": "_7HX8da_switch",
			"textButton": "_7HX8da_textButton",
			"voice-details-in": "_7HX8da_voice-details-in",
			"voiceDetails": "_7HX8da_voiceDetails",
			"voicePrivacy": "_7HX8da_voicePrivacy",
			"voiceSurface": "_7HX8da_voiceSurface"
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
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SettingsSectionHeader, {
						className: ProductCompanionSettings_module_css_default.pageHeader,
						title: displayName,
						description: t("intro", { name: displayName }),
						titleAdornment: editingName ? (0, react_jsx_runtime.jsxs)("form", {
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
						}) : (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: ProductCompanionSettings_module_css_default.editNameButton,
							"aria-label": t("editName"),
							title: t("editName"),
							onClick: () => {
								setEditingName(true);
							},
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutline16, { size: 15 })
						})
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
			"side.moveLeft": "移到输入框左侧",
			"side.moveRight": "移到输入框右侧",
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
			"voice.listening": "正在听…再次按快捷键即可结束",
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
			travelHint: "同一对话内始终贴住输入框上沿；切换对话页面时才消散并重组。",
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
			"side.moveLeft": "Move to the left side of the composer",
			"side.moveRight": "Move to the right side of the composer",
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
			"voice.listening": "Listening… use the shortcut again to finish",
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
			travelHint: "Stay attached to the composer edge within one conversation; dissolve only across conversation pages.",
			resetLabel: "Default position",
			resetHint: "Restore the position where {name} first appears.",
			resetAction: "Restore default position",
			privacy: "The companion never stores message contents. Microphone dictation uses browser speech recognition and never calls a model."
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Browser half of the native cross-page product companion plugin. */
		const NS = "productCompanion";
		function isAuxiliaryWindow() {
			if (typeof location === "undefined") return false;
			const params = new URLSearchParams(location.search);
			return params.get("dsh-window") === "auxiliary" && (params.get("dsh-window-id")?.trim().length ?? 0) > 0;
		}
		/** Runtime, locale and layout slot services required by the companion. */
		const inject = [
			"slots",
			"sessions",
			"uiWorkspace",
			"locale"
		];
		/** Register one additive, root-scoped companion above every product page. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-product-companion: dictionaries");
			const store = createCompanionStore();
			if (!isAuxiliaryWindow()) ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "product-companion",
				order: 40,
				locale: NS,
				store,
				inject: () => ({
					startSession: () => {
						ctx.uiWorkspace.startSession();
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