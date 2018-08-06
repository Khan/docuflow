// @flow
import * as React from "react";
import {StyleSheet} from "aphrodite";
import {View} from "@khanacademy/wonder-blocks-core";
import Color from "@khanacademy/wonder-blocks-color";

import PropsTable from "./props-table.js";
import FunctionDecl from "./function-decl.js";
import Comments from "./comments.js";

import type {
    ObjectTypeAnnotationT,
    GenericTypeAnnotationT,
    FunctionDeclaration, 
    ClassDeclaration,
} from "../types/types.js";

const isClassDeclaration = (node: any) => node && node.type === "ClassDeclaration";
const isFunctionDeclaration = (node: any) => node && node.type === "FunctionDeclaration";
const isComponent = (node: any) => {
    if (!isClassDeclaration(node)) {
        return false;
    }

    if (node.superClass) {
        if (node.superClass.type === "MemberExpression") {
            const {object, property} = node.superClass;
            return (
                object.type === "Identifier" && object.name === "React" && 
                property.type === "Identifier" && property.name === "Component");
        } else if (node.superClass.type === "Identifier") {
            // TODO(kevinb): check that 'Component' was imported from "react"
            return node.superClass.name === "Component";
        }
    }

    return false;
};

const getProps = (node: any): ?(ObjectTypeAnnotationT | GenericTypeAnnotationT) => {
    if (!isComponent(node)) {
        return null;
    }

    if (node.superTypeParameters) {
        const {params} = node.superTypeParameters;
        if (Array.isArray(params)) {
            return params[0];
        }
    }

    return null;
}

type Props = {
    name: string,
    declarations: Array<{
        declaration: {
            declaration: any,
            source: string,
        },
        source: string,
    }>,
    files: any,
};

type Declaration = {
    name: string,
    source: string,
    declaration: ClassDeclaration | FunctionDeclaration,
};
export default class Package extends React.Component<Props> {
    render() {
        const {declarations, files} = this.props;

        // $FlowFixMe
        const componentDecls: Array<Declaration> = declarations
            .filter(decl => isComponent(decl.declaration))
            .sort();
            
        // $FlowFixMe
        const classDecls: Array<Declaration> = declarations
            .filter(decl => isClassDeclaration(decl.declaration) && !componentDecls.includes(decl))
            .sort();

        // $FlowFixMe
        const funcDecls: Array<Declaration> = declarations
            .filter(decl => isFunctionDeclaration(decl.declaration))
            .sort();

        return <View>
            <h1>{this.props.name}</h1>
            {componentDecls.length > 0 && <h2>Components</h2>}
            {componentDecls.map((decl: Declaration) => {
                const props = getProps(decl.declaration);
                if (!props) {
                    return null;
                }

                let propTypes = null;
                if (props.type === "GenericTypeAnnotation") {
                    const name = props.id.name;
                    const file = files[decl.source];
                    propTypes = file.privateTypes[name] || file.exportedTypes[name];
                    
                    // TODO(kevinb): make this recursive so that we can traverse
                    // multiple files to fine definitions
                    if (!propTypes) {
                        if (name in file.importedTypes) {
                            const importedFile = files[file.importedTypes[name].source];
                            if (name in importedFile.exportedTypes) {
                                propTypes = importedFile.exportedTypes[name];
                            }
                        }
                    }
                }

                const {leadingComments} = decl.declaration;

                return <View key={decl.name} style={styles.decl}>
                    <h3>{decl.name}</h3>
                    <View style={styles.source}>{decl.source}</View>
                    {leadingComments && <Comments comments={leadingComments}/>}
                    <h4>Props</h4>
                    {propTypes && <PropsTable node={propTypes}/>}
                </View>;
            })}
            {classDecls.length > 0 && <h2>Classes</h2>}
            {classDecls.map((decl: Declaration) => <View key={decl.name}>
                <View style={styles.source}>{decl.source}</View>
                <View>{decl.source}</View>
            </View>)}
            {funcDecls.length > 0 && <h2>Functions</h2>}
            {funcDecls.map((decl: Declaration) => {
                const {leadingComments} = decl.declaration;
                return <View key={decl.name}>
                    <h3>{decl.name}</h3>
                    <View style={styles.source}>{decl.source}</View>
                    {leadingComments && <Comments comments={leadingComments}/>}
                    {/* $FlowFixMe */}
                    <FunctionDecl node={decl.declaration} />
                </View>;
            })}
        </View>;
    }
}

const styles = StyleSheet.create({
    decl: {
        marginBottom: 32,
    },
    source: {
        fontSize: 14,
        color: Color.offBlack50,
        marginTop: -16,
        marginBottom: 16,
    },
});
