// @flow
import * as React from "react";

import TypeAnnotation from "./type-annotation.js";

import type {FunctionTypeAnnotationT} from "./types.js";

type Props = {
    node: FunctionTypeAnnotationT
}

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

export default class FunctionTypeAnnotation extends React.Component<Props> {
    render() {
        const {node} = this.props;
        const params = node.params.map(param => {
            if (param.name) {
                return <React.Fragment>
                    {param.name && param.name.name}
                    {": "}
                    <TypeAnnotation node={param.typeAnnotation} />
                </React.Fragment>;
            } else {
                return <TypeAnnotation node={param.typeAnnotation} />
            }
        });

        return <span>
            {"("}
            <React.Fragment>
                {intersperse(params, <span>, </span>)}
            </React.Fragment>
            {")"}
            {" => "}
            <TypeAnnotation node={node.returnType}/>
        </span>;
    }
}
