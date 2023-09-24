import styles from "./auth.module.scss";
// import {IconButton} from "./button";
//
// import {useNavigate} from "react-router-dom";
// import {Path} from "../constant";
// import {useAccessStore} from "../store";
// import Locale from "../locales";
//
// import BotIcon from "../icons/bot.svg";
// import {useEffect, useState} from "react";
// import {getClientConfig} from "../config/client";
// import {showToast} from "@/app/components/ui-lib";
// import {useAuthStore} from "@/app/store/api/auth";
//
// export function AuthPage() {
// 	const navigate = useNavigate();
// 	const access = useAccessStore();
//
// 	const goHome = () => navigate(Path.Home);
//
// 	const [username, setUsername] = useState("");
// 	const [password, setPassword] = useState("");
// 	const [loadingUsage, setLoadingUsage] = useState(false);
// 	const authStore = useAuthStore();
//
// 	useEffect(() => {
// 		if (getClientConfig()?.isApp) {
// 			navigate(Path.Settings);
// 		}
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 	}, []);
//
// 	function loginHandler() {
// 		if (username === "") {
// 			showToast(Locale.LoginPage.Toast.EmptyUserName);
// 			return;
// 		}
// 		if (password === "") {
// 			showToast(Locale.LoginPage.Toast.EmptyPassword);
// 			return;
// 		}
// 		setLoadingUsage(true);
// 		showToast(Locale.LoginPage.Toast.Logging);
//
// 		authStore
// 			.login(username, password)
// 			.then((result) => {
// 				console.log("result", result);
// 				if (result && result.code == 200) {
// 					showToast(Locale.LoginPage.Toast.Success);
// 					// todo 获取用户信息
//
// 					navigate(Path.Chat);
// 				} else if (result && result.message) {
// 					showToast(result.message);
// 				}
// 			})
// 			.finally(() => {
// 				setLoadingUsage(false);
// 			});
// 	}
//
// 	return (
// 		<div className={styles["auth-page"]}>
// 			<div className={styles["auth-border"]}>
// 				<div className={`no-dark ${styles["auth-logo"]}`}>
// 					<BotIcon/>
// 				</div>
//
// 				<div className={styles["auth-title"]}>{Locale.Auth.Title}</div>
//
// 				<div className={styles["login-input"]}>
// 					<input
// 						className={styles["auth-input"]}
// 						type="email"
// 						placeholder={Locale.Auth.Name}
// 						value={username}
// 						onChange={(e) => {
// 							setUsername(e.currentTarget.value)
// 						}}
// 					/>
// 					<input
// 						className={styles["auth-input"]}
// 						type="password"
// 						placeholder={Locale.Auth.Password}
// 						value={password}
// 						onChange={(e) => {
// 							setPassword(e.currentTarget.value)
// 						}}
// 					/>
// 				</div>
//
// 				<div className={styles["auth-actions"]}>
// 					<IconButton
// 						text={Locale.Auth.Confirm}
// 						type="primary"
// 						onClick={loginHandler}
// 					/>
// 					<IconButton text={Locale.Auth.Later}/>
// 				</div>
// 			</div>
//
// 		</div>
// 	);
// }
