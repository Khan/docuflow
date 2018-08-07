// @flow
import * as React from "react";
import {StyleSheet, css} from "aphrodite";

import TypeAnnotation from "./annotations/type-annotation.js";
import Comments from "./comments.js"
import intersperse from "../util/intersperse.js";

import type {
    FunctionDeclaration, 
} from "../types/types.js";

export default class FunctionDecl extends React.Component<{node: FunctionDeclaration, name?: string}> {
    render() {
        const {node, name} = this.props;

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

        return <div>
            <code className={css(styles.funcDecl)}>
                {"function"}
                {" "}
                {node.id && node.id.name}
                {name}
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
            <table className={css(styles.table)}>
                <tbody>
                    <tr>
                        <th className={css(styles.th)}>param</th>
                        <th className={css(styles.th)}>type</th>
                        <th className={css(styles.th)}>description</th>
                    </tr>
                    {node.params.map((param, index) => {
                        const {leadingComments} = param;
                        return <tr key={index} className={css(styles.row)}>
                            <td className={css(styles.cell, styles.code)}>{param.name}</td>
                            <td className={css(styles.cell, styles.code)}>
                                {param.typeAnnotation &&
                                    <TypeAnnotation node={param.typeAnnotation.typeAnnotation} />}
                            </td>
                            <td className={css(styles.cell)}>
                                {leadingComments && <Comments style={styles.markdown} comments={leadingComments}/>}
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
        border: `solid 1px lightgray`,
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
        paddingTop: 16,
        paddingBottom: 16,
    },
});
