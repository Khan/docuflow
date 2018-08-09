// @flow

export const isClassDeclaration = (node: any) => node && node.type === "ClassDeclaration";
export const isFunctionDeclaration = (node: any) => node && node.type === "FunctionDeclaration";
export const isComponent = (node: any) => {
    if (!isClassDeclaration(node)) {
        return false;
    }

    if (node.superClass) {
        if (node.superClass.type === "MemberExpression") {
            const {object, property} = node.superClass;
            return (
                object.type === "Identifier" && object.name === "React" && 
                property.type === "Identifier" && (property.name === "Component" || property.name === "PureComponent")
            );
        } else if (node.superClass.type === "Identifier") {
            // TODO(kevinb): check that 'Component' was imported from "react"
            return (node.superClass.name === "Component" || node.superClass.name === "PureComponent");
        }
    }

    return false;
};
export const isVariableDeclarator = (node: any) => node && node.type === "VariableDeclarator";
export const isObjectExpression = (node: any) => node && node.type === "ObjectExpression";
export const isArrowFunctionExpression = (node: any) => node && node.type === "ArrowFunctionExpression";
