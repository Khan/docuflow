// @flow
import * as React from "react";

import TypeAnnotation from "./type-annotation.js";

import type {UnionTypeAnnotationT} from "../../types/types.js";

type Props = {
    node: UnionTypeAnnotationT,
};

function intersperse(items: Array<React.Node>, sep: React.Element<*>) {
    const output = [];
    items.forEach((item, index) => {
        if (index > 0) {
            output.push(React.cloneElement(sep));
        }
        output.push(item);
    });
    return output;
}

export default class UnionTypeAnnotation extends React.Component<Props> {
    render() {
        const {node} = this.props;
        const types = node.types.map(t => <TypeAnnotation node={t} />);
        return <React.Fragment>
            {intersperse(types, <span> | </span>)}
        </React.Fragment>
    }
}
