// @flow
import * as React from "react";
import {StyleSheet} from "aphrodite";
import {View} from "@khanacademy/wonder-blocks-core";
import Color from "@khanacademy/wonder-blocks-color";

import Package from "./package.js";

const data = require("../../data/data.json");

// eslint-disable-next-line no-console
console.log(data);

type Props = {};
type State = {
    package: string,
}

export default class Docs extends React.Component<Props, State> {
    state = {
        package: "wonder-blocks-core",
    }

    render() {
        const names = Object.keys(data).map(name => name.replace("@khanacademy/", ""));
        const {declarations, files} = data[`@khanacademy/${this.state.package}`];

        return <View style={styles.container}>
            <View style={styles.nav}>
                <h3>Packages</h3>
                {names.map(name => 
                    <View 
                        // TODO: use a router instead
                        onClick={() => this.setState({package: name})}
                        style={[
                            styles.item,
                            name === this.state.package && styles.selectedItem,
                        ]}
                    >
                        {name}
                    </View>
                )}
            </View>
            <View style={styles.content}>
                <Package 
                    name={`@khanacademy/${this.state.package}`}
                    declarations={declarations}
                    files={files}
                />
            </View>
        </View>;
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        fontFamily: "sans-serif",
    },
    nav: {
        height: "100%",
        flexShrink: 0,
        paddingRight: 32,
        position: "sticky",
        top: 8,
    },
    content: {
        flexGrow: 1,
    },
    item: {
        fontSize: 16,
        color: Color.offBlack50,
        lineHeight: 1.3,
        cursor: "pointer",
    },
    selectedItem: {
        color: Color.offBlack,
    },
});
