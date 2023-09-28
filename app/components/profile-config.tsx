import { Button, Popover, Typography } from "@mui/material";
import React, { useState } from "react";
import { IconButton } from "@/app/components/button";
import AvatarIcon from "../icons/avatar-30.svg";
import styles from "./profile-config.module.scss";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

export default function ProfileConfig(props: any) {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		//
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? "simple-popover" : undefined;

	return (
		<div>
			<IconButton
				aria-describedby={id}
				maxIcon={<AvatarIcon />}
				onClick={(e) => e && handleClick(e)}
				shadow
			/>
			{props.children}
			<Popover
				className={styles["mui-popover"]}
				id={id}
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: "top",
					horizontal: "left",
				}}
				transformOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
			>
				<List>
					<ListItem disablePadding>
						<ListItemButton className={styles["profile-list-item"]}>
							<ListItemIcon>
								<AccountCircleOutlinedIcon className={styles["item-button"]} />
							</ListItemIcon>
							<ListItemText primary="Account" />
						</ListItemButton>
					</ListItem>
					<ListItem disablePadding>
						<ListItemButton className={styles["profile-list-item"]}>
							<ListItemIcon>
								<SettingsOutlinedIcon />
							</ListItemIcon>
							<ListItemText primary="Settings" />
						</ListItemButton>
					</ListItem>
					<ListItem disablePadding>
						<ListItemButton className={styles["profile-list-item"]}>
							<ListItemIcon>
								<KeyOutlinedIcon />
							</ListItemIcon>
							<ListItemText primary="Api Key" />
						</ListItemButton>
					</ListItem>
				</List>
			</Popover>
		</div>
	);
}
