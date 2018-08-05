// @flow
import * as React from "react";

import TypeAnnotation from "./type-annotation.js";

import type {NullableTypeAnnotationT} from "./types.js";

type Props = {
    node: NullableTypeAnnotationT
}

export default class NullableTypeAnnotation extends React.Component<Props> {
    render() {
        const {node} = this.props;
        return <span>?<TypeAnnotation node={node.typeAnnotation}/></span>;
    }
}
