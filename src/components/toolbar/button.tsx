import React, { HTMLAttributes, FunctionComponent } from "react";
import classnames from "classnames";
import styled from "styled-components";

type ButtonProps = HTMLAttributes<HTMLButtonElement> & {
  isToggled?: boolean;
  disabled?: boolean;
};

const Root = styled.button`
  border-radius: 0;
  border: none;
  outline: none;

  & img {
    width: 90%;
  }

  &.isToggled {
    background-color: rgb(50, 240, 10);
  }
`;

export const Button: FunctionComponent<ButtonProps> = ({
  isToggled,
  className,
  disabled,
  ...rest
}) => {
  const finalClassName = classnames(className, { isToggled });

  return <Root {...rest} className={finalClassName} disabled={disabled} />;
};
