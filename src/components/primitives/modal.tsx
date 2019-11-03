import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import ReactModal, { Props as ReactModalProps } from "react-modal";

const GlobalModalStyle = createGlobalStyle`
  .modalOverlay {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    overflow-y: auto;
    z-index: 10;

    opacity: 0;
    transition: opacity 800ms ease-in-out;

    &.ReactModal__Overlay--after-open {
      opacity: 1;
    }

    &.ReactModal__Overlay--before-close {
      opacity: 0;
    }

    @media (max-width: 700px), (max-height:  500px) {
      display: none;
    }
  }
`;

const StyledModal = styled(ReactModal)`
  width: 600px;
  padding: 16px;
  margin: auto;
  background-color: white;

  display: grid;
  grid-template-rows: repeat(3, auto);
  row-gap: 16px;

  background-color: #eee;
  color: black;
  box-shadow: 0px 24px 20px 0px rgba(0, 0, 0, 0.7);
`;

export const Modal: React.FunctionComponent<ReactModalProps> = props => (
  <>
    <GlobalModalStyle />
    <StyledModal
      {...props}
      overlayClassName="modalOverlay"
      closeTimeoutMS={900}
    />
  </>
);
