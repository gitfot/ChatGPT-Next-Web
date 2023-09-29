import { Button, Popover, Typography } from "@mui/material";
import React, { useState } from "react";
import { IconButton } from "@/app/components/button";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import styles from "./profile-config.module.scss";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Divider from "@mui/material/Divider";
import { Path } from "@/app/constant";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/api/auth";

export default function ProfileConfig(props: any) {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const navigate = useNavigate();
    const authStore = useAuthStore();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

    return (
        <div>
            <IconButton
                aria-describedby={id}
                maxIcon={<ManageAccountsOutlinedIcon fontSize={"medium"} />}
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
                        <ListItemButton
                            className={styles["profile-list-item"]}
                            onClick={() => {
                                handleClose();
                                navigate(Path.Settings);
                            }}
                        >
                            <ListItemIcon>
                                <SettingsOutlinedIcon fontSize={"small"} />
                            </ListItemIcon>
                            <ListItemText primary="Settings" />
                        </ListItemButton>
                    </ListItem>
                    <Divider />
                    <ListItem disablePadding>
                        <ListItemButton
                            className={styles["profile-list-item"]}
                            onClick={() => authStore.logout()}
                        >
                            <ListItemIcon>
                                <LogoutOutlinedIcon fontSize={"small"} />
                            </ListItemIcon>
                            <ListItemText primary="Log out" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Popover>
        </div>
    );
}
