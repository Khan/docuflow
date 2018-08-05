// @flow
import * as React from "react";
import {StyleSheet, css} from "aphrodite";
import Markdown from "react-markdown";

import TypeAnnotation from "./annotations/type-annotation.js";

import type {
    ObjectTypeAnnotationT, 
    GenericTypeAnnotationT, 
    FunctionDeclaration, 
    ClassDeclaration,
} from "../types/types.js";

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
                            return <Markdown 
                                className={css(styles.markdown)}
                                source={lines.join("\n")}
                            />;
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
                    <th className={css(styles.th)}>prop</th>
                    <th className={css(styles.th)}>type</th>
                    <th className={css(styles.th)}>description</th>
                </tr>
                {this.renderNode(node)}
            </tbody>
        </table>
    }
}

function intersperse(items: Array<React.Node>, sep: React.Element<*>) {
    const output = [];
    items.forEach((item, index) => {
        if (index > 0) {
            output.push(React.cloneElement(sep));
        }
        output.push(item);
    });
    return output;
}
class FunctionDecl extends React.Component<{node: FunctionDeclaration}> {
    render() {
        const {node} = this.props;

        const params = node.params.map(param => {
            if (param.typeAnnotation) {
                return <React.Fragment>
                    {param.name}
                    {": "}
                    <TypeAnnotation node={param.typeAnnotation.typeAnnotation}/>
                </React.Fragment>;
            } else {
                return param.name;
            }
        });

        const {leadingComments} = node;

        return <div>
            <code className={css(styles.funcDecl)}>
                {"function"}
                {" "}
                {node.id && node.id.name}
                {node.typeParameters && <span>
                    {"<"}
                    {node.typeParameters.params.map(param => {
                        if (param.bound) {
                            return <React.Fragment>
                                {param.name}
                                {": "}
                                <TypeAnnotation node={param.bound.typeAnnotation} />
                            </React.Fragment>;
                        } else {
                            return param.name;
                        }
                    })}
                    {">"}
                </span>}
                {"("}
                {intersperse(params, <span>, </span>)}
                {")"}
            </code>
            {leadingComments && leadingComments.map(comment => {
                const lines = comment.value.split("\n")
                    .map(line => line.replace(/^\s*\*/, ""));
                if (lines[0].trim() === "") {
                    lines.shift();
                }
                if (lines[lines.length - 1].trim() === "") {
                    lines.pop();
                }
                return <Markdown 
                    source={lines.join("\n")}
                />;
            })}
            <table className={css(styles.table)}>
                <tbody>
                    <tr>
                        <th className={css(styles.th)}>param</th>
                        <th className={css(styles.th)}>type</th>
                        <th className={css(styles.th)}>description</th>
                    </tr>
                    {node.params.map((param, index) => {
                        const {leadingComments} = param;
                        console.log(param);
                        return <tr className={css(styles.row)}>
                            <td className={css(styles.cell, styles.code)}>{param.name}</td>
                            <td className={css(styles.cell, styles.code)}>
                                {param.typeAnnotation &&
                                    <TypeAnnotation node={param.typeAnnotation.typeAnnotation} />}
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
                                    return <Markdown 
                                        className={css(styles.markdown)}
                                        source={lines.join("\n")}
                                    />;
                                })}
                            </td>
                        </tr>;
                    })}
                </tbody>
            </table>
        </div>
    }
}

type Declaration = {
    name: string,
    source: string,
    declaration: ClassDeclaration | FunctionDeclaration,
};

class Package extends React.Component<Props> {
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
    th: {
        textAlign: "left",
    },
    code: {
        fontFamily: "monospace",
        fontSize: 16,
    },
    markdown: {
        marginTop: -16,
        marginBottom: -16,
    },
    funcDecl: {
        display: "inline-block",
        border: `solid 1px gray`,
        padding: 16,
    },
});
