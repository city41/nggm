import Modal from "react-modal";

import "./src/index.css";

export function onClientEntry() {
  Modal.setAppElement(document.getElementById("___gatsby"));
}
