// @flow

type CommentLine = {
    type: "CommentLine",
    value: string,
}

type Identifier = {
    type: "Identifier",
    name: string,
}

type QualifiedTypeIdentifier = {
    type: "QualifiedTypeIdentifier",
    qualification: Identifier | QualifiedTypeIdentifier,
    id: Identifier,
}

type CommonProps = {
    leadingComments?: Array<CommentLine>,
}

export type UnionTypeAnnotationT = CommonProps & {
    type: "UnionTypeAnnotation",
    types: Array<TypeAnnotationT>,
}

type ObjectTypeProperty = CommonProps & {
    type: "ObjectTypeProperty",
    key: Identifier,
    value: TypeAnnotationT,
    optional: boolean,
    method: boolean,
}

type ObjectTypeSpreadProperty = CommonProps & {
    type: "ObjectTypeSpreadProperty",
    argument: TypeAnnotationT,
}

export type ObjectTypeAnnotationT = CommonProps & {
    type: "ObjectTypeAnnotation",
    properties: Array<ObjectTypeProperty | ObjectTypeSpreadProperty>,
    exact: boolean,
}

export type StringLiteralTypeAnnotationT = CommonProps & {
    type: "StringLiteralTypeAnnotation",
    value: string,
}

type TypeParameterInstantiation = {
    type: "TypeParameterInstantiation",
    params: Array<TypeAnnotationT>,
}

export type GenericTypeAnnotationT = CommonProps & {
    type: "GenericTypeAnnotation",
    id: Identifier,
    typeParameters: ?TypeParameterInstantiation,
}

export type NullableTypeAnnotationT = CommonProps & {
    type: "NullableTypeAnnotation",
    typeAnnotation: TypeAnnotationT,
}

type FunctionTypeParam = {
    type: "FunctionTypeParam",
    name: Identifier,
    optional: boolean,
    typeAnnotation: TypeAnnotationT,
}

export type FunctionTypeAnnotationT = CommonProps & {
    type: "FunctionTypeAnnotation",
    params: Array<FunctionTypeParam>,
    returnType: TypeAnnotationT,
}

export type ExistsTypeAnnotationT = CommonProps & {
    type: "ExistsTypeAnnotation",
}

export type TypeAnnotationT =
    | UnionTypeAnnotationT
    | ObjectTypeAnnotationT
    | StringLiteralTypeAnnotationT
    | GenericTypeAnnotationT
    | NullableTypeAnnotationT
    | FunctionTypeAnnotationT
    | ExistsTypeAnnotationT
