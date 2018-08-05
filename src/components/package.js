// @flow
import * as React from "react";
import {StyleSheet, css} from "aphrodite";

import PropsTable from "./props-table.js";
import FunctionDecl from "./function-decl.js";

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

        console.log(funcDecls);

        return <div>
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
                    propTypes = file.privateTypes[name];
                    
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

                return <div key={decl.name} className={css(styles.decl)}>
                    <h3>{decl.name}</h3>
                    <div>{decl.source}</div>
                    {propTypes && <PropsTable node={propTypes}/>}
                </div>;
            })}
            {classDecls.length > 0 && <h2>Classes</h2>}
            {classDecls.map((decl: Declaration) => <div key={decl.name}>
                <h3>{decl.name}</h3>
                <div>{decl.source}</div>
            </div>)}
            {funcDecls.length > 0 && <h2>Functions</h2>}
            {funcDecls.map((decl: Declaration) => <div key={decl.name}>
                <h3>{decl.name}</h3>
                <div>{decl.source}</div>
                {/* $FlowFixMe */}
                <FunctionDecl node={decl.declaration} />
            </div>)}
        </div>;
    }
}

const styles = StyleSheet.create({
    decl: {
        marginBottom: 32,
    },
});
