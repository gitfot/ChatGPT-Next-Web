import {Popover as AntPopover} from "antd";
import React from "react";

/**
 * 气泡弹框
 * @param props
 * @constructor
 */
export function LightPopover(props:{
	title?:string;
	children?: JSX.Element;
	content: JSX.Element;
}) {
	const text = <span>{props.title}</span>;
	return (
		<AntPopover placement="topLeft" title={text} content={props.content} trigger="click">
			{props.children}
		</AntPopover>
	);
}
