// import axios, {AxiosError, AxiosRequestConfig} from 'axios';
// import {useAccessStore} from "@/app/store";
import { showToast } from "../components/ui-lib";
//
// //基础URL，axios将会自动拼接在url前
// //process.env.NODE_ENV 判断是否为开发环境 根据不同环境使用不同的baseURL 方便调试
// const baseURL = process.env.BASE_URL;
// // 根据构建模式拼接实际的请求URL
//
// //默认请求超时时间
// const timeout = 30000;
// const {token} = useAccessStore.getState()
//
// //创建axios实例
// const service = axios.create({
// 	timeout,
// 	baseURL,
// 	//如需要携带cookie 该值需设为true
// 	withCredentials: true
// });
//
// //统一请求拦截 可配置自定义headers 例如 language、token等
// /* 请求拦截器 */
// axios.interceptors.request.use((config) => {
// 	  config.headers.Authorization = `Bearer ${token}`;
// 	  return config
// 	}, (error: AxiosError) => {
// 	return Promise.reject(error)
// })
//
// //axios返回格式
// interface axiosTypes<T>{
// 	data: T;
// 	status: number;
// 	statusText: string;
// }
//
// //后台响应数据格式
// //###该接口用于规定后台返回的数据格式，意为必须携带code、msg以及result
// //###而result的数据格式 由外部提供。如此即可根据不同需求，定制不同的数据格式
// interface responseTypes<T>{
// 	code: number,
// 	msg: string,
// 	result: T
// }
//
// //核心处理代码 将返回一个promise 调用then将可获取响应的业务数据
// const requestHandler = <T>(method: 'get' | 'post' | 'put' | 'delete', url: string, params: object = {}, config: AxiosRequestConfig = {}): Promise<T> => {
// 	let response: Promise<axiosTypes<any>>;
// 	switch(method){
// 		case 'get':
// 			response = service.get(url, {params: { ...params }, ...config});
// 			break;
// 		case 'post':
// 			response = service.post(url, {...params}, {...config});
// 			break;
// 		case 'put':
// 			response = service.put(url, {...params}, {...config});
// 			break;
// 		case 'delete':
// 			response = service.delete(url, {params: { ...params }, ...config});
// 			break;
// 	}
//
// 	return new Promise<T>((resolve, reject) => {
// 		response.then(res => {
// 			//业务代码 可根据需求自行处理
// 			const data = res.data;
// 			if(data.status !== 200){
// 				//特定状态码 处理特定的需求
// 				if(data.status == 401){
// 					showToast('您的账号已登出或超时，即将登出...')
// 				}
// 				let e = JSON.stringify(data);
// 				showToast(`请求错误：${e}`)
// 				reject(data);
// 			}else{
// 				resolve(data.result);
// 			}
// 		}).catch(error => {
// 			let e = JSON.stringify(error);
// 			showToast(`网络错误：${e}`)
// 			reject(error);
// 		})
// 	})
// }
//
// // 使用 request 统一调用，包括封装的get、post、put、delete等方法
// const request = {
// 	get: <T>(url: string, params?: object, config?: AxiosRequestConfig) => requestHandler<T>('get', url, params, config),
// 	post: <T>(url: string, params?: object, config?: AxiosRequestConfig) => requestHandler<T>('post', url, params, config),
// 	put: <T>(url: string, params?: object, config?: AxiosRequestConfig) => requestHandler<T>('put', url, params, config),
// 	delete: <T>(url: string, params?: object, config?: AxiosRequestConfig) => requestHandler<T>('delete', url, params, config)
// };
//
// // 导出至外层，方便统一使用
// export { request };
