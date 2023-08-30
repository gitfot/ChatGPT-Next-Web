import {
	DEFAULT_API_HOST,
	DEFAULT_MODELS,
	OpenaiPath,
	REQUEST_TIMEOUT_MS,
} from "@/app/constant";
import { useAccessStore, useAppConfig, useChatStore } from "@/app/store";

import { ChatOptions, getHeaders, LLMApi, LLMModel, LLMUsage } from "../api";
import Locale from "../../locales";
import {
	EventStreamContentType,
	fetchEventSource,
} from "@fortaine/fetch-event-source";
import { prettyObject } from "@/app/utils/format";
import { getClientConfig } from "@/app/config/client";

export interface OpenAIListModelResponse {
	object: string;
	data: Array<{
		id: string;
		object: string;
		root: string;
	}>;
}

/**
 * openai接口请求类
 */
export class ChatGPTApi implements LLMApi {
	private disableListModels = true;

	/**
	 * 拼接完整的http路径
	 * @param path
	 */
	path(path: string): string {
		let openaiUrl = useAccessStore.getState().openaiUrl;
		const apiPath = "/api/openai";

		if (openaiUrl.length === 0) {
			const isApp = !!getClientConfig()?.isApp;
			openaiUrl = isApp ? DEFAULT_API_HOST : apiPath;
		}
		if (openaiUrl.endsWith("/")) {
			openaiUrl = openaiUrl.slice(0, openaiUrl.length - 1);
		}
		if (!openaiUrl.startsWith("http") && !openaiUrl.startsWith(apiPath)) {
			openaiUrl = "https://" + openaiUrl;
		}
		return [openaiUrl, path].join("/");
	}


	/**
	 * 获取响应的对话内容
	 * @param res
	 */
	extractMessage(res: any) {
		return res.choices?.at(0)?.message?.content ?? "";
	}

	/**
	 * 发送对话请求
	 * @param options
	 */
	async chat(options: ChatOptions) {
		//待发送消息列表
		const messages = options.messages.map((v) => ({
			role: v.role,
			content: v.content,
		}));
		//模型列表
		const modelConfig = {
			...useAppConfig.getState().modelConfig,
			...useChatStore.getState().currentSession().mask.modelConfig,
			...{
				model: options.config.model,
			},
		};

		//消息体
		const requestPayload = {
			messages,
			stream: options.config.stream,
			model: modelConfig.model,
			temperature: modelConfig.temperature,
			presence_penalty: modelConfig.presence_penalty,
			frequency_penalty: modelConfig.frequency_penalty,
			top_p: modelConfig.top_p,
		};

		console.log("[Request] openai payload: ", requestPayload);
		//是否使用event-stream请求响应类型
		const shouldStream = !!options.config.stream;
		//创建一个消息信号控制器
		const controller = new AbortController();
		options.onController?.(controller);

		try {
			const chatPath = this.path(OpenaiPath.ChatPath);
			//封装消息体
			const chatPayload = {
				method: "POST",
				body: JSON.stringify(requestPayload),
				signal: controller.signal,
				headers: getHeaders(),
			};

			//设置请求超时时间
			const requestTimeoutId = setTimeout(
				() => controller.abort(),
				REQUEST_TIMEOUT_MS,
			);
			// 使用EventSource 与服务器进行通信
			if (shouldStream) {
				let responseText = "";
				let finished = false;

				//对话结束时调用。作用是将对话内容更新到store中
				const finish = () => {
					if (!finished) {
						//onFinish方法会将responseText设置到store-[onNewMessage]
						options.onFinish(responseText);
						finished = true;
					}
				};

				controller.signal.onabort = finish;

				//发起事件流请求
				fetchEventSource(chatPath, {
					...chatPayload,
					//请求打开时
					async onopen(res) {
						clearTimeout(requestTimeoutId); //清楚超时
						const contentType = res.headers.get("content-type");
						console.log(
							"[OpenAI] request response content type: ",
							contentType,
						);
						// 如果是文本内容直接结束
						if (contentType?.startsWith("text/plain")) {
							responseText = await res.clone().text();
							return finish();
						}
						//如果响应状态不正常，进入异常处理块
						if (
							!res.ok ||
							!res.headers
								.get("content-type")
								?.startsWith(EventStreamContentType) ||
							res.status !== 200
						) {
							const responseTexts = [responseText];
							let extraInfo = await res.clone().text();
							try {
								const resJson = await res.clone().json();
								extraInfo = prettyObject(resJson);
							} catch {}

							if (res.status === 401) {
								responseTexts.push(Locale.Error.Unauthorized);
							}

							if (extraInfo) {
								responseTexts.push(extraInfo);
							}

							responseText = responseTexts.join("\n\n");

							return finish();
						}
					},
					//接收到消息时
					onmessage(msg) {
						// 如果结束标志已置或收到结束消息,结束
						if (msg.data === "[DONE]" || finished) {
							return finish();
						}
						const text = msg.data;
						try {
							const json = JSON.parse(text);
							const delta = json.choices[0].delta.content;
							/**
							 * Chat API在streaming模式下,会通过消息流的方式返回对话内容，结构如下：
							 *   "choices": [
							 *     {
							 *       "delta": {
							 *         "content": "Hello there!"
							 *       }
							 *     },...
							 * 其中choices数组第一项包含当前响应。delta属性表示本次响应相对上次的变化内容。
							 *
							 */
							if (delta) {
								responseText += delta;
								options.onUpdate?.(responseText, delta);
							}
						} catch (e) {
							console.error("[Request] parse error", text, msg);
						}
					},
					onclose() {
						finish();
					},
					onerror(e) {
						options.onError?.(e);
						throw e;
					},
					openWhenHidden: true,
				});
			} else {
				const res = await fetch(chatPath, chatPayload);
				clearTimeout(requestTimeoutId);

				const resJson = await res.json();
				const message = this.extractMessage(resJson);
				//将对话内容更新会store
				options.onFinish(message);
			}
		} catch (e) {
			console.log("[Request] failed to make a chat request", e);
			options.onError?.(e as Error);
		}
	}

	/**
	 * 查询额度用量请求
	 */
	async usage() {
		const formatDate = (d: Date) =>
			`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
				.getDate()
				.toString()
				.padStart(2, "0")}`;
		const ONE_DAY = 1 * 24 * 60 * 60 * 1000;
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startDate = formatDate(startOfMonth);
		const endDate = formatDate(new Date(Date.now() + ONE_DAY));

		const [used, subs] = await Promise.all([
			fetch(
				this.path(
					`${OpenaiPath.UsagePath}?start_date=${startDate}&end_date=${endDate}`,
				),
				{
					method: "GET",
					headers: getHeaders(),
				},
			),
			fetch(this.path(OpenaiPath.SubsPath), {
				method: "GET",
				headers: getHeaders(),
			}),
		]);

		if (used.status === 401) {
			throw new Error(Locale.Error.Unauthorized);
		}

		if (!used.ok || !subs.ok) {
			throw new Error("Failed to query usage from openai");
		}

		const response = (await used.json()) as {
			total_usage?: number;
			error?: {
				type: string;
				message: string;
			};
		};

		const total = (await subs.json()) as {
			hard_limit_usd?: number;
		};

		if (response.error && response.error.type) {
			throw Error(response.error.message);
		}

		if (response.total_usage) {
			response.total_usage = Math.round(response.total_usage) / 100;
		}

		if (total.hard_limit_usd) {
			total.hard_limit_usd = Math.round(total.hard_limit_usd * 100) / 100;
		}

		return {
			used: response.total_usage,
			total: total.hard_limit_usd,
		} as LLMUsage;
	}

	async models(): Promise<LLMModel[]> {
		if (this.disableListModels) {
			return DEFAULT_MODELS.slice();
		}

		const res = await fetch(this.path(OpenaiPath.ListModelPath), {
			method: "GET",
			headers: {
				...getHeaders(),
			},
		});

		const resJson = (await res.json()) as OpenAIListModelResponse;
		const chatModels = resJson.data?.filter((m) => m.id.startsWith("gpt-"));
		console.log("[Models]", chatModels);

		if (!chatModels) {
			return [];
		}

		return chatModels.map((m) => ({
			name: m.id,
			available: true,
		}));
	}
}

export { OpenaiPath };
