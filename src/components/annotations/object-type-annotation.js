// @flow
import * as React from "react";
import {StyleSheet, css} from "aphrodite";

import TypeAnnotation from "./type-annotation.js";

import type {ObjectTypeAnnotationT} from "../../types/types.js";

type Props = {
    node: ObjectTypeAnnotationT,
}

export default class UnionTypeAnnotation extends React.Component<Props> {
    render() {
        const {node} = this.props;
        return <React.Fragment>
            {"{"}
            <ul className={css(styles.list)}>
                {node.properties.map((prop, index) => {
                    const {leadingComments} = prop;
                    if (prop.type === "ObjectTypeProperty") {
                        let key = "";
                        if (prop.key.type === "StringLiteral") {
                            key = `"${prop.key.value}"`;
                        } else if (prop.key.type === "Identifier") {
                            key = prop.key.name;
                        }
                        return <li>
                            {leadingComments && leadingComments.map(comment => <div>// {comment.value}</div>)}
                            {`${key}${prop.optional ? "?" : ""}: `}
                            <TypeAnnotation node={prop.value} />
                            {","}
                        </li>
                    } else if (prop.type === "ObjectTypeSpreadProperty") {
                        return <li>
                            {"..."}
                            <TypeAnnotation node={prop.argument}/>
                            {","}
                        </li>;
                    }
                })}
            </ul>
            {"}"}
        </React.Fragment>
    }
}

const styles = StyleSheet.create({
    list: {
        margin: 0,
        padding: "0 0 0 40px",
        listStyleType: "none",
    },
});
