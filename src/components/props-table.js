// @flow
import * as React from "react";
import {StyleSheet, css} from "aphrodite";
import Markdown from "react-markdown";

import TypeAnnotation from "./annotations/type-annotation.js";

import type {
    ObjectTypeAnnotationT, 
    Type,
} from "../types/types.js";

export default class PropsTable extends React.Component<{node: Type}> {
    renderObjectType(node: ObjectTypeAnnotationT) {
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
                    <td className={css(styles.cell, styles.code)} />
                    <td className={css(styles.cell)} />
                </tr>;
            }
        });
    }

    renderNode(node: Type) {
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
});
