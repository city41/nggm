import React from "react";
import Helmet from "react-helmet";
import Modal from "react-modal";

import "./src/index.css";

export function onClientEntry() {
  Modal.setAppElement(document.getElementById("___gatsby"));
}

export function wrapPageElement({ element, props }) {
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>neo geo gif maker - NGGM</title>
        <link rel="canonical" href="https://city41.github.io/ngbg" />
      </Helmet>
      {element}
    </>
  );
}
