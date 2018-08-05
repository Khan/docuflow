// @flow
import * as React from "react";
import * as ReactDOM from "react-dom";

import Docs from "./components/docs.js";
// import type {TypeAnnotation} from "./types.js";

const container = document.createElement("div");
if (document.body) {
    document.body.appendChild(container);
    ReactDOM.render(<Docs/>, container);
}
