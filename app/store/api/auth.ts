import {create} from "zustand";
import {persist} from "zustand/middleware";
import {StoreKey} from "../../constant";
import {requestLogin} from "../../requests";
import {
	requestRegister,
	requestSendEmailCode,
	requestResetPassword,
} from "../../requests";

export interface AuthStore {
	token: string;
	username: string;
	email: string;
	login: (username: string, password: string) => Promise<any>;
	logout: () => void;
	sendEmailCode: (email: string) => Promise<any>;
	sendEmailCodeForResetPassword: (email: string) => Promise<any>;
	register: (
		username: string,
		password: string,
		captchaId: string,
		captchaInput: string,
		email: string,
		code: string,
	) => Promise<any>;
	resetPassword: (
		password: string,
		email: string,
		code: string,
	) => Promise<any>;
	removeToken: () => void;
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set, get) => ({
			userId: "",
			username: "",
			email: "",
			token: "",

			async login(username, password) {
				let result = await requestLogin(username, password, {
					onError: (err) => {
						console.error(err);
					},
				});
				console.log("result", result);
				if (result && result.code == 200) {
					set(() => ({
						username,
						email: "",
						token: result.data?.token || "",
						userId: result.data?.baseUserId || "",
					}));
				}

				return result;
			},
			logout() {
				set(() => ({
					username: "",
					email: "",
					token: "",
					userId: "",
				}));
			},
			removeToken() {
				set(() => ({token: ""}));
			},
			async sendEmailCodeForResetPassword(email) {
				let result = await requestSendEmailCode(email, true, {
					onError: (err) => {
						console.error(err);
					},
				});
				return result;
			},
			async sendEmailCode(email) {
				let result = await requestSendEmailCode(email, false, {
					onError: (err) => {
						console.error(err);
					},
				});
				return result;
			},
			async register(
				username,
				password,
				captchaId,
				captchaInput,
				email,
				code,
			) {
				let result = await requestRegister(
					username,
					password,
					captchaId,
					captchaInput,
					email,
					code,
					{
						onError: (err) => {
							console.error(err);
						},
					},
				);
				console.log("result", result);
				if (result && result.code == 0) {
					set(() => ({
						username,
						email: result.data?.userEntity?.email || "",
						token: result.data?.token || "",
					}));
				}

				return result;
			},
			async resetPassword(password, email, code) {
				let result = await requestResetPassword(password, email, code, {
					onError: (err) => {
						console.error(err);
					},
				});
				//console.log("result", result);
				if (result && result.code == 0 && result.data) {
					const data = result.data;
					const user = data.userEntity;
					set(() => ({
						name: user.name || "",
						username: user.username || "",
						email: user.email || "",
						token: data.token || "",
					}));
				}
				return result;
			},
		}),
		{
			name: StoreKey.Auth,
			version: 1,
		},
	),
);
