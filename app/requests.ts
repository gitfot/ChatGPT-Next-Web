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

export interface userAll {
    authorities: any;
    dataScopes: any;
    roles: any;
    user: userInfo;
}

export interface LoginResult {
    user: userAll;
    token: string;
}

export interface RegisterResult {
    code: number;
    message: string;
    data?: any;
}

export async function request(
    url: string,
    method: string,
    body: any,
    options?: {
        onError: (error: Error, statusCode?: number) => void;
    },
): Promise<any> {
    try {
        // 获取环境变量中的基础URL和构建模式
        const BASE_URL = process.env.BASE_URL;
        const mode = process.env.BUILD_MODE;
        // 根据构建模式拼接实际的请求URL
        let requestUrl = mode === "export" ? BASE_URL + url : "/api" + url;
        const res = await fetch(requestUrl, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        let json: any;
        try {
            json = (await res.json());
        } catch (e) {
            return {
                code: -1,
                message: "json formatting failure",
            };
        }
        // console.info("json-" + JSON.parse(json));
        if (res.status == 200) {
            return json;
        }
        else {
            //
        }
    } catch (err) {
        console.error("NetWork Error(3)", err);
        options?.onError(err as Error);
        return {
            code: -1,
            message: "NetWork Error(3)",
        };
    }
}

export async function requestLogin(
    username: string,
    password: string,
): Promise<LoginResult> {
    return request("/auth/login", "POST", {username, password});
}

export async function requestRegister(
    username: string,
    password: string,
    captchaId: string,
    captchaInput: string,
    email: string,
    code: string,
): Promise<RegisterResult> {
    return request(
        "/register",
        "POST",
        {username, password, captchaId, captcha: captchaInput, email, code},
    );
}

export async function requestSendEmailCode(
    email: string,
    resetPassword: boolean,
    options?: {
        onError: (error: Error, statusCode?: number) => void;
    },
): Promise<RegisterResult> {
    return request(
        "/sendRegisterEmailCode",
        "POST",
        {
            email,
            type: resetPassword ? "resetPassword" : "register",
        },
        options,
    );
}

export function requestResetPassword(
    password: string,
    email: string,
    code: string,
    options?: {
        onError: (error: Error, statusCode?: number) => void;
    },
): Promise<RegisterResult> {
    return request("/resetPassword", "POST", {password, code, email}, options);
}


