// @flow
// TODO: split this up into separate files
// TODO: use exact object types

export type CommentLine = {
    type: "CommentLine",
    value: string,
}

export type CommentBlock = {
    type: "CommentBlock",
    value: string,
}

type CommonProps = {
    leadingComments?: Array<CommentLine | CommentBlock>,
}

export type Identifier = CommonProps & {
    type: "Identifier",
    name: string,
    typeAnnotation?: TypeAnnotation,
}

type QualifiedTypeIdentifier = {
    type: "QualifiedTypeIdentifier",
    qualification: Identifier | QualifiedTypeIdentifier,
    id: Identifier,
}

export type UnionTypeAnnotationT = CommonProps & {
    type: "UnionTypeAnnotation",
    types: Array<Type>,
}

type ObjectTypeProperty = CommonProps & {
    type: "ObjectTypeProperty",
    key: Identifier,
    value: Type,
    optional: boolean,
    method: boolean,
}

type ObjectTypeSpreadProperty = CommonProps & {
    type: "ObjectTypeSpreadProperty",
    argument: Type,
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
    params: Array<Type>,
}

export type GenericTypeAnnotationT = CommonProps & {
    type: "GenericTypeAnnotation",
    id: Identifier,
    typeParameters: ?TypeParameterInstantiation,
}

export type NullableTypeAnnotationT = CommonProps & {
    type: "NullableTypeAnnotation",
    typeAnnotation: Type,
}

type FunctionTypeParam = {
    type: "FunctionTypeParam",
    name: Identifier,
    optional: boolean,
    typeAnnotation: Type,
}

export type FunctionTypeAnnotationT = CommonProps & {
    type: "FunctionTypeAnnotation",
    params: Array<FunctionTypeParam>,
    returnType: Type,
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
    bound: TypeAnnotation,
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

export type VariableDeclarator = CommonProps & {
    type: "VariableDeclarator",
    id: Identifier,
    init: ObjectExpression, // TODO: handle other values
}

type ObjectProperty = CommonProps & {
    type: "ObjectProperty",
    method: boolean,
    key: Identifier,  // TODO: handle computed properties
    computed: false,  // TODO: handle computed properties
    shorthand: boolean,
    value: any,  // TODO: compute the values by having gen-data.js import the component
};

export type ObjectExpression = CommonProps & {
    type: "ObjectExpression",
    properties: Array<ObjectProperty>,
}

type MemberExpression = {
    type: "MemberExpression",
    object: MemberExpression | Identifier,
    property: Identifier,
}

type ClassProperty = {
    type: "ClassProperty",
    key: Identifier,
    computed: boolean,
    value: any
}

type Pattern = any; // TODO

type Function = {
    id: ?Identifier,
    params: Array<Pattern>,
    body: BlockStatement,
    generate: boolean,
    async: boolean,
};

type Expression = any; // TODO

type Decorator = any;

type ClassMethod = Function & {
    type: "ClassMethod",
    key: Expression,
    kind: "constructor" | "method" | "get" | "set",
    computed: boolean,
    static: boolean,
    decorators: Array<Decorator>,
}

type ClassBody = {
    type: "ClassBody",
    body: Array<ClassMethod /*| ClassPrivateMethod*/ | ClassProperty /*| ClassPrivateProperty*/>;
}

export type ClassDeclaration = CommonProps & {
    type: "ClassDeclaration",
    body: ClassBody,
    superClass: Identifier | MemberExpression,
    superTypeParameters: TypeParameterInstantiation,
}

export type TypeAnnotation = {
    typeAnnotation: Type,
}

export type IntersectionTypeAnnotationT = {
    type: "IntersectionTypeAnnotation",
    types: Array<Type>,
}

export type Type =
    | UnionTypeAnnotationT
    | ObjectTypeAnnotationT
    | StringLiteralTypeAnnotationT
    | GenericTypeAnnotationT
    | NullableTypeAnnotationT
    | FunctionTypeAnnotationT
    | ExistsTypeAnnotationT
    | IntersectionTypeAnnotationT
