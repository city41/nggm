import React from "react";
import classnames from "classnames";
import { getSpriteData } from "./spriteData";

import styles from "./singleSpriteDetail.module.css";

interface SingleSpriteDetailProps {
    className?: string;
    spriteIndex: number;
}

export const SingleSpriteDetail: React.FunctionComponent<
    SingleSpriteDetailProps
> = ({ className, spriteIndex }) => {
    const classes = classnames(styles.root, className);
    const data = getSpriteData(spriteIndex, true);

    return (
        <div className={classes}>
            <h2>sprite {spriteIndex}</h2>
            <table>
                <tbody>
                    <tr>
                        <td>pos</td>
                        <td>
                            {data.x},{data.y}
                        </td>
                    </tr>
                    <tr>
                        <td>sticky</td>
                        <td>{data.sticky ? "yes" : "no"}</td>
                    </tr>
                    <tr>
                        <td>size</td>
                        <td>{data.spriteSize}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
