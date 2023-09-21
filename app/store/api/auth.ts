import {create} from "zustand";
import {persist} from "zustand/middleware";
import {StoreKey} from "../../constant";
import {requestLogin, requestRegister, requestResetPassword, requestSendEmailCode} from "../../requests";

export interface AuthStore {
	token: string;
	username: string;
	email: string;
	avatar:string;
	userId:string
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
			avatar:"",
			email: "",
			token: "",

			async login(username, password) {
				let {user:{user:userinfo},token} = await requestLogin(username, password);
				set(() => ({
					avatar:userinfo.avatarPath,
					username: userinfo.username,
					email: userinfo.email,
					token: token,
					userId: userinfo.id,
				}));
			},
			logout() {
				set(() => ({
					avatar:"",
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
				return await requestSendEmailCode(email, true, {
					onError: (err) => {
						console.error(err);
					},
				});
			},
			async sendEmailCode(email) {
				return await requestSendEmailCode(email, false, {
					onError: (err) => {
						console.error(err);
					},
				});
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
					code
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
