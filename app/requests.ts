export interface CallResult<T> {
    code: number;
    message: string;
    data?: T;
}

export interface LoginResult {
    code: number;
    message: string;
    data?: any;
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
): Promise<CallResult<any>> {
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
        if (res.status == 200) {
            let json: CallResult<any>;
            try {
                json = (await res.json()) as CallResult<any>;
            } catch (e) {
                console.error("json formatting failure", e);
                options?.onError({
                    name: "json formatting failure",
                    message: "json formatting failure",
                });
                return {
                    code: -1,
                    message: "json formatting failure",
                };
            }
            if (json.code != 200) {
                options?.onError({
                    name: json.message,
                    message: json.message,
                });
            }
            return json;
        }
        console.error("register result error(1)", res);
        options?.onError({
            name: "unknown error(1)",
            message: "unknown error(1)",
        });
        return {
            code: -1,
            message: "unknown error(2)",
        };
    } catch (err) {
        console.error("NetWork Error(3)", err);
        options?.onError(err as Error);
        return {
            code: -1,
            message: "NetWork Error(3)",
        };
    }
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

export async function requestLogin(
    username: string,
    password: string,
    options?: {
        onError: (error: Error, statusCode?: number) => void;
    },
): Promise<LoginResult> {
    return request("/user/login/email", "POST", {username, password}, options);
}

export async function requestRegister(
    name: string,
    username: string,
    password: string,
    captchaId: string,
    captchaInput: string,
    email: string,
    code: string,
    options?: {
        onError: (error: Error, statusCode?: number) => void;
    },
): Promise<RegisterResult> {
    return request(
        "/register",
        "POST",
        {name, username, password, captchaId, captcha: captchaInput, email, code},
        options,
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


