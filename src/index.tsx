import React from "react";
import Modal from "react-modal";
import ReactDOM from "react-dom";
import { App } from "./App";

import "./index.css";

Modal.setAppElement("#root");

ReactDOM.render(<App />, document.getElementById("root"));
