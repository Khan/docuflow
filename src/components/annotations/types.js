// @flow

type CommentLine = {
    type: "CommentLine",
    value: string,
}

type Identifier = {
    type: "Identifier",
    name: string,
    typeAnnotation?: TypeAnnotationT,
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

type BlockStatement = {
    type: "BlockStatement",
    body: Array<any>,  // TODO
    directives: Array<any>,  // TODO
}

type TypeParameter = {
    type: "TypeParameter",
    name: string,
    bound: TypeAnnotationT,
}

type TypeParameterDeclaration = CommonProps & {
    type: "TypeParameterDeclaration",
    params: Array<TypeParameter>,
}

export type FunctionDeclaration = CommonProps & {
    type: "FunctionDeclaration",
    async: boolean,
    body: BlockStatement,
    id: Identifier,
    params: Array<Identifier>,
    typeParameters: TypeParameterDeclaration,
}

export type TypeAnnotationT =
    | UnionTypeAnnotationT
    | ObjectTypeAnnotationT
    | StringLiteralTypeAnnotationT
    | GenericTypeAnnotationT
    | NullableTypeAnnotationT
    | FunctionTypeAnnotationT
    | ExistsTypeAnnotationT
