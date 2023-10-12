import {create} from "zustand";
import {persist} from "zustand/middleware";
import {BUILTIN_MASKS} from "../masks";
import {getLang, Lang} from "../locales";
import {DEFAULT_TOPIC, ChatMessage} from "./chat";
import {ModelConfig, useAppConfig} from "./config";
import {StoreKey} from "../constant";
import {nanoid} from "nanoid";
import {request} from "@/app/requests";
import {CommonResponse, PageResponse} from "@/app/client/api";

export type Mask = {
	id: string;
	name: string;
	remark: string;
	tag: string;
	context: ChatMessage[];
	syncGlobalConfig?: boolean;
	modelConfig: ModelConfig;
	hideContext?: boolean;
	lang: Lang;
	builtin: boolean;
};

export const DEFAULT_MASK_STATE = {
	masks: {} as Record<string, Mask>,
};

export type MaskState = typeof DEFAULT_MASK_STATE;
type MaskStore = MaskState & {
	create: (mask?: Partial<Mask>) => Mask;
	update: (id: string, updater: (mask: Mask) => void) => void;
	delete: (id: string) => void;
	search: (text: string) => Mask[];
	get: (id?: string) => Mask;
	getAll: () => Promise<Mask[]>;
};

export const DEFAULT_MASK_AVATAR = "gpt-bot";
export const createEmptyMask = () =>
	({
		id: nanoid(),
		name: DEFAULT_TOPIC,
		context: [],
		remark: "",
		tag: "",
		syncGlobalConfig: true, // use global config as default
		modelConfig: {...useAppConfig.getState().modelConfig},
		lang: getLang(),
		builtin: false,
	} as Mask);

export async function requestGetMaskList(): Promise<PageResponse<Mask>> {
    return request.get("/chat/prompt/list");
}

export async function requestAddMask(mask: Partial<Mask>): Promise<CommonResponse<any>> {
	return request.post("/chat/prompt/add", mask);
}

export async function requestUpdateMask(mask: Partial<Mask>): Promise<CommonResponse<any>> {
    return request.post("/chat/prompt/update", mask);
}

/**
 * 面具Store操作类
 */
export const useMaskStore = create<MaskStore>()(
	persist(
		(set, get) => ({
			...DEFAULT_MASK_STATE,

			create(mask) {
				const masks = get().masks;
				const id = nanoid();
				masks[id] = {
					...createEmptyMask(),
					...mask,
					id,
					builtin: false,
				};

				set(() => ({masks}));

				return masks[id];
			},
			update(id, updater) {
				const masks = get().masks;
				const mask = masks[id];
				if (!mask) return;
				const updateMask = {...mask};
				updater(updateMask);
				masks[id] = updateMask;
				set(() => ({masks}));
			},
			delete(id) {
				const masks = get().masks;
				delete masks[id];
				set(() => ({masks}));
			},

			get(id) {
				return get().masks[id ?? 1145141919810];
			},
			async getAll() {
				let masks = {} as Record<string, Mask>;
				return await requestGetMaskList().then( res => {
					res.rows.map( m => {
						masks[m.id] = m;
					})
					set(() => ({masks}))
					return res.rows;
				})
			},
			search(text) {
				return Object.values(get().masks);
			},
		}),
		{
			name: StoreKey.Mask,
			version: 3.1,

			migrate(state, version) {
				const newState = JSON.parse(JSON.stringify(state)) as MaskState;

				// migrate mask id to nanoid
				if (version < 3) {
					Object.values(newState.masks).forEach((m) => (m.id = nanoid()));
				}

				if (version < 3.1) {
					const updatedMasks: Record<string, Mask> = {};
					Object.values(newState.masks).forEach((m) => {
						updatedMasks[m.id] = m;
					});
					newState.masks = updatedMasks;
				}

				return newState as any;
			},
		},
	),
);
