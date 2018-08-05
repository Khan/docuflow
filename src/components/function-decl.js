// @flow
import * as React from "react";
import {StyleSheet, css} from "aphrodite";
import Markdown from "react-markdown";

import TypeAnnotation from "./annotations/type-annotation.js";
import intersperse from "../util/intersperse.js";

import type {
    FunctionDeclaration, 
} from "../types/types.js";

export default class FunctionDecl extends React.Component<{node: FunctionDeclaration}> {
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

const styles = StyleSheet.create({
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
