// @flow
import * as React from "react";

import TypeAnnotation from "./type-annotation.js";

import type {UnionTypeAnnotationT} from "../../types/types.js";
import intersperse from "../../util/intersperse.js";

type Props = {
    node: UnionTypeAnnotationT,
};

export default class UnionTypeAnnotation extends React.Component<Props> {
    render() {
        const {node} = this.props;
        const types = node.types.map(t => <TypeAnnotation node={t} />);
        return <span>
            {intersperse(types, <span> | </span>)}
        </span>
    }
}
