// @flow
import * as React from "react";
import {StyleSheet, css} from "aphrodite";

import Package from "./package.js";

const data = require("../../data/data.json");

// eslint-disable-next-line no-console
console.log(data);

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
