// @flow
import * as React from "react";
import {StyleSheet} from "aphrodite";
import {View} from "@khanacademy/wonder-blocks-core";
import Color from "@khanacademy/wonder-blocks-color";

import PropsTable from "./props-table.js";
import FunctionDecl from "./function-decl.js";
import Comments from "./comments.js";
import TypeAnnotation from "./annotations/type-annotation.js";

import {
    isClassDeclaration,
    isFunctionDeclaration,
    isComponent,
    isVariableDeclarator,
    isObjectExpression,
    isArrowFunctionExpression,
    isType,
} from "../util/ast-helpers.js";

import type {
    ObjectTypeAnnotationT,
    GenericTypeAnnotationT,
    FunctionDeclaration, 
    ClassDeclaration,
    ObjectExpression,
} from "../types/types.js";

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
    declaration: ClassDeclaration | FunctionDeclaration | ObjectExpression,
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

        // $FlowFixMe
        const varDecls: Array<Declaration> = declarations
            .filter(decl => isVariableDeclarator(decl.declaration))
            .sort();

        // TODO(kevinb): more robust handling of type casts and their inner expressions
        declarations.filter(decl => decl.declaration && decl.declaration.type === "TypeCastExpression").map(decl => {
            // $FlowFixMe
            varDecls.push(Object.assign(
                {},
                decl,
                {declaration: {
                    type: "VariableDeclarator",
                    // $FlowFixMe: pretend to be a variable declarator
                    init: decl.declaration.expression,
                }},
            ));
        });

        const typeDecls: Array<Declaration> = declarations
            .filter(decl => isType(decl.declaration))
            .sort();

        return <View style={styles.package}>
            <h1>{this.props.name}</h1>

            {componentDecls.length > 0 && 
                <h2 id="Components" style={{marginBottom:0}}>Components</h2>}
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
                    <h3 id={decl.name}>{decl.name}</h3>
                    <View style={styles.source}>{decl.source}</View>
                    {leadingComments && <Comments comments={leadingComments}/>}
                    <h4>Props</h4>
                    {propTypes && <PropsTable node={propTypes}/>}
                </View>;
            })}

            {classDecls.length > 0 && 
                <h2 id="Classes" style={{marginBottom:0}}>Classes</h2>}
            {classDecls.map((decl: Declaration) => <View key={decl.name}>
                <View style={styles.source}>{decl.source}</View>
                <View>{decl.source}</View>
            </View>)}

            {funcDecls.length > 0 && 
                <h2 id="Functions" style={{marginBottom:0}}>Functions</h2>}
            {funcDecls.map((decl: Declaration) => {
                const {leadingComments} = decl.declaration;
                return <View key={decl.name}>
                    <h3 id={decl.name}>{decl.name}</h3>
                    <View style={styles.source}>{decl.source}</View>
                    {leadingComments && <Comments comments={leadingComments}/>}
                    {/* $FlowFixMe */}
                    <FunctionDecl node={decl.declaration} />
                </View>;
            })}

            {/* TODO: split variables up based on type */}
            {varDecls.length > 0 && 
                <h2 id="Variables" style={{marginBottom:0}}>Variables</h2>}
            {varDecls.map((decl: Declaration) => {
                // $FlowFixMe
                const {leadingComments} = decl.declaration;
                return <View key={decl.name}>
                    <h3 id={decl.name}>{decl.name}</h3>
                    <View style={styles.source}>{decl.source}</View>
                    {leadingComments && <Comments comments={leadingComments}/>}
                    {isObjectExpression(decl.declaration.init) &&
                        <View style={styles.obj}>
                            <View>{"{"}</View>
                                {decl.declaration.init.properties.map((objProp, i) => 
                                    <View key={i} style={styles.prop}>{objProp.key.name}{","}</View>)}
                            <View>{"}"}</View>
                        </View>}
                    {isArrowFunctionExpression(decl.declaration.init) &&
                        <View style={styles.func}>
                            <FunctionDecl node={decl.declaration.init} name={decl.declaration.id.name} />
                        </View>}
                </View>;
            })}

            {typeDecls.length > 0 && 
                <h2 id="Types" style={{marginBottom:0}}>Functions</h2>}
            {typeDecls.map((decl: Declaration) => {
                const {leadingComments} = decl.declaration;
                return <View key={decl.name}>
                    <h3 id={decl.name}>{decl.name}</h3>
                    <View style={styles.source}>{decl.source}</View>
                    {leadingComments && <Comments comments={leadingComments}/>}
                    {/* $FlowFixMe */}
                    <TypeAnnotation node={decl.declaration} />
                </View>;
            })}
        </View>;
    }
}

const styles = StyleSheet.create({
    package: {
        flexShrink: 0,
    },
    decl: {
        marginBottom: 32,
    },
    source: {
        fontSize: 14,
        color: Color.offBlack50,
        marginTop: -16,
        marginBottom: 16,
    },
    section: {
        marginBottom: 0,
    },
    prop: {
        marginLeft: 32,
    },
    obj: {
        fontFamily: "monospace",
        fontSize: 16,
    },
    func: {

    },
});
