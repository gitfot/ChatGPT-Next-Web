export async function requestHandler<T>(
    method: string,
    url: string,
    body: any
): Promise<T> {
    const BASE_URL = process.env.BASE_URL;
    const mode = process.env.BUILD_MODE;
    let requestUrl = mode === "export" ? BASE_URL + url : '/api' + url;
    const response = await fetch(requestUrl, {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    if (response.status === 401) {
        //todo 导航到登录页
    } else if (response.status !== 200) {
        throw new Error(response.statusText)
    }
    return (await response.json());
}

// 使用 request 统一调用，包括封装的get、post、put、delete等方法
const request = {
    get: <T>(url: string, params?: object) => requestHandler<T>('get', url, params),
    post: <T>(url: string, params?: object) => requestHandler<T>('post', url, params),
    put: <T>(url: string, params?: object) => requestHandler<T>('put', url, params),
    delete: <T>(url: string, params?: object) => requestHandler<T>('delete', url, params)
};

export { request };



