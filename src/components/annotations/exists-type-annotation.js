// @flow
import * as React from "react";


import type {ExistsTypeAnnotationT} from "../../types/types.js";

type Props = {
    node: ExistsTypeAnnotationT
}

export default class ExistsLiteralTypeAnnotation extends React.Component<Props> {
    render() {
        return <span>{`*`}</span>;
    }
}
