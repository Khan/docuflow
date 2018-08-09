// @flow
import * as React from "react";

import TypeAnnotation from "./type-annotation.js";

import type {TypeofTypeAnnotationT} from "../../types/types.js";

type Props = {
    node: TypeofTypeAnnotationT
}

export default class TypeofTypeAnnotation extends React.Component<Props> {
    render() {
        const {node} = this.props;
        return <span>
            typeof <TypeAnnotation node={node.argument} />
        </span>;
    }
}
