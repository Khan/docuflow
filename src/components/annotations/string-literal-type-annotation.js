// @flow
import * as React from "react";

import TypeAnnotation from "./type-annotation.js";

import type {StringLiteralTypeAnnotationT} from "./types.js";

type Props = {
    node: StringLiteralTypeAnnotationT
}

export default class StringLiteralTypeAnnotation extends React.Component<Props> {
    render() {
        const {node} = this.props;
        return <span>{`"${node.value}"`}</span>;
    }
}
