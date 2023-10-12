import {getHeaders} from "@/app/client/api";

export async function requestHandler<T>(
  method: string,
  url: string,
  body: any,
): Promise<T> {
  const BASE_URL = process.env.BASE_URL;
  const mode = process.env.BUILD_MODE;
  let requestUrl = mode === "export" ? BASE_URL + url : "/api" + url;
  const response = await fetch(requestUrl, {
    method: method,
    headers: {
      ...getHeaders(),
    },
    body: JSON.stringify(body),
  });
  if (response.status !== 200) {
    if (response.status === 401) {
      localStorage.clear();
      location.reload();
      throw new Error("登录已过期，请重新登录！");
    }
    throw new Error((await response.json()).message);
  }
  let json = await response.json();
  if (json.code != 200) {
    throw new Error(json.msg)
  }
  return json;
}

// 使用 request 统一调用，包括封装的get、post、put、delete等方法
const request = {
  get: <T>(url: string, params?: object) =>
    requestHandler<T>("get", url, params),
  post: <T>(url: string, params?: object) =>
    requestHandler<T>("post", url, params),
  put: <T>(url: string, params?: object) =>
    requestHandler<T>("put", url, params),
  delete: <T>(url: string, params?: object) =>
    requestHandler<T>("delete", url, params),
};

export { request };
