// @flow
import * as React from "react";

import UnionTypeAnnotation from "./union-type-annotation.js";
import ObjectTypeAnnotation from "./object-type-annotation.js";
import StringLiteralAnnotation from "./string-literal-type-annotation.js";
import NumberLiteralAnnotation from "./number-literal-type-annotation.js";
import GenericTypeAnnotation from "./generic-type-annotation.js";
import NullableTypeAnnotation from "./nullable-type-annotation.js";
import FunctionTypeAnnotation from "./function-type-annotation.js";
import ExistsTypeAnnotation from "./exists-type-annotation.js";
import TypeofTypeAnnotation from "./typeof-type-annotation.js";

import type {Type} from "../../types/types.js";

type Props = {
    node: Type,
}

export default class TypeAnnotation extends React.Component<Props> {
    render() {
        const {node} = this.props;

        switch (node.type) {
            case "UnionTypeAnnotation":
                return <UnionTypeAnnotation node={node} />;
            case "ObjectTypeAnnotation":
                return <ObjectTypeAnnotation node={node} />;
            case "StringLiteralTypeAnnotation":
                return <StringLiteralAnnotation node={node} />;
            case "NumberLiteralTypeAnnotation":
                return <NumberLiteralAnnotation node={node} />;
            case "GenericTypeAnnotation":
                return <GenericTypeAnnotation node={node} />;
            case "NullableTypeAnnotation":
                return <NullableTypeAnnotation node={node} />;
            case "FunctionTypeAnnotation":
                return <FunctionTypeAnnotation node={node} />;
            case "ExistsTypeAnnotation":
                return <ExistsTypeAnnotation node={node} />;
            case "TypeofTypeAnnotation":
                return <TypeofTypeAnnotation node={node} />;

            case "AnyTypeAnnotation":
                return "any";
            case "VoidTypeAnnotation":
                return "void";
            case "BooleanTypeAnnotation":
                return "boolean";
            case "MixedTypeAnnotation":
                return "mixed";
            case "EmptyTypeAnnotation":
                return "empty";
            case "NumberTypeAnnotation":
                return "number";
            case "StringTypeAnnotation":
                return "string";

            default:
                return <span>{node.type}: not handled</span>;
        }
    }
}
