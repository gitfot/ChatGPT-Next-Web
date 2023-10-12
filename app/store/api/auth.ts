import {create} from "zustand";
import {persist} from "zustand/middleware";
import {StoreKey} from "../../constant";
// import {request} from "../../utils/request"
import {request} from "../../requests"
import {CommonResponse} from "@/app/client/api";

export interface AuthStore {
	token: string;
	username: string;
	email: string;
	avatar:string;
	userId:string;
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

export interface userInfo {
	avatarName:string;
	avatarPath:string;
	email:string;
	enabled:string;
	gender:string;
	id:string;
	nickName:string;
	phone:string;
	username:string;
}

export interface LoginResult {
	token: string;
	user: {
		authorities: any;
		dataScopes: any;
		roles: any;
		user: userInfo;
	}
}

export async function requestLogin(username: string, password: string): Promise<LoginResult> {
	return request.post("/login", {username, password});
}

export async function requestRegister(
	username: string,
	password: string,
	captchaId: string,
	captchaInput: string,
	email: string,
	code: string,
): Promise<CommonResponse<any>> {
	return request.post(
		"/register",
		{username, password, captchaId, captcha: captchaInput, email, code},
	);
}

export async function requestSendEmailCode(
	email: string,
	resetPassword: boolean,
): Promise<CommonResponse<any>> {
	return request.post(
		"/sendRegisterEmailCode",
		{
			email,
			type: resetPassword ? "resetPassword" : "register",
		}
	);
}

export async function requestResetPassword(
    password: string,
    email: string,
    code: string,
): Promise<CommonResponse<any>> {
    return request.post("/resetPassword", {password, code, email});
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
				await requestLogin(username, password).then(res => {
					set(() => ({
						token: res.token,
					}));
				})
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
				return await requestSendEmailCode(email, true);
			},
			async sendEmailCode(email) {
				return await requestSendEmailCode(email, false);
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
				await requestResetPassword(password, email, code)
					.then(res => {
						const data = res.data;
						const user = data.userEntity;
						set(() => ({
							name: user.name || "",
							username: user.username || "",
							email: user.email || "",
							token: data.token || "",
						}));
					});
			},
		}),
		{
			name: StoreKey.Auth,
			version: 1,
		},
	),
);
