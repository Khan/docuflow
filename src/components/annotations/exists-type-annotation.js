// @flow
import * as React from "react";

import TypeAnnotation from "./type-annotation.js";

import type {ExistsTypeAnnotationT} from "./types.js";

type Props = {
    node: ExistsTypeAnnotationT
}

export default class ExistsLiteralTypeAnnotation extends React.Component<Props> {
    render() {
        const {node} = this.props;
        return <span>{`*`}</span>;
    }
}
