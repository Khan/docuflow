// @flow
import * as React from "react";

import TypeAnnotation from "./type-annotation.js";

import type {GenericTypeAnnotationT} from "../../types/types.js";

type Props = {
    node: GenericTypeAnnotationT
}

export default class GenericTypeAnnotation extends React.Component<Props> {
    render() {
        const {node} = this.props;
        return <span>
            {node.id &&
                // TODO(kevinb): check all possible types
                // TODO(kevinb): handle more than one "."
                node.id.type === "QualifiedTypeIdentifier"
                    ? node.id.qualification.name + "." + node.id.id.name
                    : node.id.name}
            {node.typeParameters &&
                <React.Fragment>
                    {"<"}
                    {node.typeParameters.params.map(param => <TypeAnnotation node={param}/>)}
                    {">"}
                </React.Fragment>
            }
        </span>;
    }
}
