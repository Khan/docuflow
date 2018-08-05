// @flow
import * as React from "react";

export default function intersperse(items: Array<React.Node>, sep: React.Element<*>) {
    const output = [];
    items.forEach((item, index) => {
        if (index > 0) {
            output.push(React.cloneElement(sep));
        }
        output.push(item);
    });
    return output;
}
