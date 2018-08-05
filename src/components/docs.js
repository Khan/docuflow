// @flow
import * as React from "react";
import {StyleSheet, css} from "aphrodite";

import TypeAnnotation from "./annotations/type-annotation.js";
import { ObjectTypeAnnotation } from "../../node_modules/@babel/types";

import type {ObjectTypeAnnotationT} from "./annotations/types.js";

const data = require("../../data/data.json");

console.log(data);

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

type File = {
    exportedSymbols: any,
    importedSymbols: any,
};

const isClassDeclaration = node => node && node.type === "ClassDeclaration";
const isFunctionDeclaration = node => node && node.type === "FunctionDeclaration";
const isComponent = node => {
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

const getProps = node => {
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

class PropsTable extends React.Component<{node: ObjectTypeAnnotationT}> {
    renderObjectType(node) {
        return node.properties.map((prop, index) => {
            const {leadingComments} = prop;
            if (prop.type === "ObjectTypeProperty") {
                return <tr key={index}>
                    <td className={css(styles.cell, styles.code)}>
                        {`${prop.key.name}${prop.optional ? "?" : ""}`}
                    </td>
                    <td className={css(styles.cell, styles.code)}>
                        <TypeAnnotation node={prop.value} />
                    </td>
                    <td className={css(styles.cell)}>
                        {leadingComments && leadingComments.map(comment => {
                            const lines = comment.value.split("\n")
                                .map(line => line.replace(/^\s*\*/, ""));
                            if (lines[0].trim() === "") {
                                lines.shift();
                            }
                            if (lines[lines.length - 1].trim() === "") {
                                lines.pop();
                            }

                            const paragraphs = [""];
                            for (const line of lines) {
                                if (line === "") {
                                    paragraphs.push(line);
                                } else {
                                    paragraphs[paragraphs.length - 1] += " " + line;
                                }
                            }

                            // TODO(kevinb): render this as markdown

                            if (paragraphs.length > 1) {
                                return paragraphs.map((p, index) => 
                                    <div key={index} className={css(styles.paragraph)}>{p}</div>);
                            } else {
                                return paragraphs[0];
                            }
                        })}
                    </td>
                </tr>
            } else if (prop.type === "ObjectTypeSpreadProperty") {
                return <tr key={index} className={styles.row}>
                    <td className={css(styles.cell, styles.code)}>
                        {"..."}
                        <TypeAnnotation node={prop.argument}/>
                    </td>
                    <td className={css(styles.cell, styles.code)}></td>
                    <td className={css(styles.cell)}></td>
                </tr>;
            }
        });
    }

    renderNode(node) {
        if (node.type === "ObjectTypeAnnotation") {
            return this.renderObjectType(node);
        } else if (node.type === "IntersectionTypeAnnotation") {
            let rows = [];
            for (const type of node.types) {
                rows = rows.concat(this.renderNode(type));
            }
            return rows;
        } else if (node.type === "GenericTypeAnnotation") {
            return [<tr className={css(styles.row)}>
                <td className={css(styles.cell)} colSpan={3}>{node.id.name}</td>
            </tr>];
        } else {
            return [];
        }
    }

    render() {
        // TODO(kevinb): handle IntersectionTypeAnnotation and UnionTypeAnnotation
        const {node} = this.props;
        if (node.type !== "ObjectTypeAnnotation" && node.type !== "IntersectionTypeAnnotation") {
            return null;
        }
        return <table className={css(styles.table)}>
            <tbody>
                <tr>
                    <th>prop</th>
                    <th>type</th>
                    <th>description</th>
                </tr>
                {this.renderNode(node)}
            </tbody>
        </table>
    }
}

class Package extends React.Component<Props> {
    render() {
        const {declarations, files} = this.props;

        const componentDecls = declarations
            .filter(decl => isComponent(decl.declaration))
            .sort();
            
        const classDecls = declarations
            .filter(decl => isClassDeclaration(decl.declaration) && !componentDecls.includes(decl))
            .sort();

        const funcDecls = declarations
            .filter(decl => isFunctionDeclaration(decl.declaration))
            .sort();

        return <div>
            <h1>{this.props.name}</h1>
            {componentDecls.length > 0 && <h2>Components</h2>}
            {componentDecls.map(decl => {
                const props = getProps(decl.declaration);

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
            {classDecls.map(decl => <div key={decl.name}>
                <h3>{decl.name}</h3>
                <div>{decl.source}</div>
            </div>)}
            {funcDecls.length > 0 && <h2>Functions</h2>}
            {funcDecls.map(decl => <div key={decl.name}>
                <h3>{decl.name}</h3>
                <div>{decl.source}</div>
            </div>)}
        </div>;
    }
}


export default class Docs extends React.Component<{}> {
    render() {
        const names = Object.keys(data);
        // const names = ["@khanacademy/wonder-blocks-core"];

        return <div className={css(styles.container)}>
            {names.map(name => {
                const {declarations, files} = data[name];
                return <Package 
                    name={name}
                    declarations={declarations}
                    files={files}
                />;
            })}
        </div>;
    }
}

const styles = StyleSheet.create({
    container: {
        fontFamily: "sans-serif",
        // fontSize: 18,
    },
    decl: {
        marginBottom: 32,
    },
    paragraph: {
        marginBottom: 16,
    },
    table: {
        borderSpacing: 0,
        borderCollapse: "collapse",
    },
    cell: {
        verticalAlign: 'top',
        maxWidth: 500,
        padding: 8,
        border: `solid 1px gray`,
    },
    code: {
        fontFamily: "monospace",
        fontSize: 14,
    },
});
