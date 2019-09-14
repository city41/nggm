import React from "react";
import classnames from "classnames";

import styles from "./iconButton.module.css";

interface IconButtonProps {
    className?: string;
    title?: string;
    icon: React.ComponentType<any>;
    onClick?: (e: React.MouseEvent) => void;
}

export const IconButton: React.FunctionComponent<IconButtonProps> = ({
    className,
    title,
    icon,
    onClick
}) => {
    const Icon = icon;

    const classes = classnames(styles.root, className);

    return (
        <Icon
            className={classes}
            onClick={onClick}
            title={title}
            aria-role="button"
            aria-label={title}
        />
    );
};
