// @flow
import * as React from "react";

import type {NumberLiteralTypeAnnotationT} from "../../types/types.js";

type Props = {
    node: NumberLiteralTypeAnnotationT
}

export default class NumberLiteralTypeAnnotation extends React.Component<Props> {
    render() {
        const {node} = this.props;
        return <span>{node.value}</span>;
    }
}
