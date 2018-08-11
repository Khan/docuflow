// @flow
import * as React from "react";
import {StyleSheet, css} from "aphrodite";
import generate from "@babel/generator";

import TypeAnnotation from "./annotations/type-annotation.js";
import Comments from "./comments.js";

import type {
    ObjectTypeAnnotationT, 
    Type,
    ObjectExpression,
    ObjectProperty,
} from "../types/types.js";

type Props = {
    propTypes: Type,
    defaultProps?: ObjectExpression,
};

const convertDefaultProps = (defaultProps?: ObjectExpression) => {
    if (!defaultProps) {
        return null;
    }
    // TODO: figure out how to handle computed properties
    return defaultProps.properties.reduce((accum, prop: ObjectProperty) => {
        if (!prop.computed) {
            return {
                ...accum,
                [prop.key.name]: generate(prop.value).code,
            };
        } else {
            return accum;
        }
    }, {});
};

export default class PropsTable extends React.Component<Props> {
    renderObjectType(node: ObjectTypeAnnotationT) {
        const defaultProps = convertDefaultProps(this.props.defaultProps);

        return node.properties.map((prop, index) => {
            const {leadingComments} = prop;
            if (prop.type === "ObjectTypeProperty") {
                return <tr key={index}>
                    <td className={css(styles.cell, styles.code)}>
                        {`${prop.key.name}${prop.optional ? "?" : ""}`}
                    </td>
                    <td className={css(styles.cell, styles.code)}>
                        {defaultProps && defaultProps[prop.key.name]}
                    </td>
                    <td className={css(styles.cell, styles.code)}>
                        <TypeAnnotation node={prop.value} />
                    </td>
                    <td className={css(styles.cell)}>
                        {leadingComments && 
                            <Comments style={styles.markdown} comments={leadingComments}/>}
                    </td>
                </tr>
            } else if (prop.type === "ObjectTypeSpreadProperty") {
                // TODO(kevinb): write some code to test this path
                return <tr key={index} className={styles.row}>
                    <td className={css(styles.cell, styles.code)}>
                        {"..."}
                        <TypeAnnotation node={prop.argument}/>
                    </td>
                    <td className={css(styles.cell, styles.code)} />
                    <td className={css(styles.cell, styles.code)} />
                    <td className={css(styles.cell, styles.description)} />
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
                <td className={css(styles.cell)} colSpan={4}>{node.id.name}</td>
            </tr>];
        } else {
            return [];
        }
    }

    render() {
        // TODO(kevinb): handle IntersectionTypeAnnotation and UnionTypeAnnotation
        const {propTypes} = this.props;
        if (propTypes.type !== "ObjectTypeAnnotation" && propTypes.type !== "IntersectionTypeAnnotation") {
            return null;
        }
        return <table className={css(styles.table)}>
            <tbody>
                <tr>
                    <th className={css(styles.th)}>name</th>
                    <th className={css(styles.th)}>default</th>
                    <th className={css(styles.th)}>type</th>
                    <th className={css(styles.th, styles.description)}>description</th>
                </tr>
                {this.renderNode(propTypes)}
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
        border: `solid 1px lightgray`,
    },
    description: {
        minWidth: 200,
    },
    th: {
        paddingLeft: 8,
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
