// @flow
import * as React from "react";
import {StyleSheet} from "aphrodite";
import {View, addStyle} from "@khanacademy/wonder-blocks-core";
import Color from "@khanacademy/wonder-blocks-color";

import Package from "./package.js";

import {
    isClassDeclaration,
    isFunctionDeclaration,
    isComponent,
    isVariableDeclarator,
    isType,
} from "../util/ast-helpers.js";

import type {
    FunctionDeclaration, 
    ClassDeclaration,
    ObjectExpression,
} from "../types/types.js";

const StyledAnchor = addStyle("a");

import data from "../../data/data.json";

// eslint-disable-next-line no-console
console.log(data);

type Props = {};
type State = {
    package: string,
}

type Declaration = {
    name: string,
    source: string,
    declaration: ClassDeclaration | FunctionDeclaration | ObjectExpression,
};

export default class Docs extends React.Component<Props, State> {
    state = {
        package: "wonder-blocks-core",
    }

    renderExports(declarations: Array<Declaration>, files: any) {
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

        // $FlowFixMe
        const varDecls: Array<Declaration> = declarations
            .filter(decl => isVariableDeclarator(decl.declaration))
            .sort();
        
        // TODO(kevinb): more robust handling of type casts and their inner expressions
        declarations.filter(decl => decl.declaration && decl.declaration.type === "TypeCastExpression").map(decl => {
            varDecls.push(Object.assign(
                {},
                decl,
                // $FlowFixMe
                {declaration: decl.declaration.expression},
            ));
        });

        const typeDecls: Array<Declaration> = declarations
            .filter(decl => isType(decl.declaration))
            .sort();

        return <React.Fragment>
            {componentDecls.length > 0 &&
                <View style={{fontWeight: "bold", paddingLeft: 16}}>
                    <StyledAnchor style={styles.section} href="#Components">Components</StyledAnchor>
                </View>}
            {componentDecls.map(decl => 
                <View style={{paddingLeft: 32}}>
                    <StyledAnchor style={styles.anchor} href={`#${decl.name}`}>{decl.name}</StyledAnchor>
                </View>)}
            {componentDecls.length > 0 && <View style={{height: 8}}/>}

            {classDecls.length > 0 &&
                <View style={{fontWeight: "bold", paddingLeft: 16}}>
                    <StyledAnchor style={styles.section} href="#Classes">Classes</StyledAnchor>
                </View>}
            {classDecls.map(decl => 
                <View style={{paddingLeft: 32}}>
                    <StyledAnchor style={styles.anchor} href={`#${decl.name}`}>{decl.name}</StyledAnchor>
                </View>)}
            {classDecls.length > 0 && <View style={{height: 8}}/>}

            {funcDecls.length > 0 &&
                <View style={{fontWeight: "bold", paddingLeft: 16}}>
                    <StyledAnchor style={styles.section} href="#Functions">Functions</StyledAnchor>
                </View>}
            {funcDecls.map(decl => 
                <View style={{paddingLeft: 32}}>
                    <StyledAnchor style={styles.anchor} href={`#${decl.name}`}>{decl.name}</StyledAnchor>
                </View>)}
            {funcDecls.length > 0 && <View style={{height: 8}}/>}

            {varDecls.length > 0 &&
                <View style={{fontWeight: "bold", paddingLeft: 16}}>
                    <StyledAnchor style={styles.section} href="#Variables">Variables</StyledAnchor>
                </View>}
            {varDecls.map(decl => 
                <View style={{paddingLeft: 32}}>
                    <StyledAnchor style={styles.anchor} href={`#${decl.name}`}>{decl.name}</StyledAnchor>
                </View>)}
            {varDecls.length > 0 && <View style={{height: 8}}/>}

            {typeDecls.length > 0 &&
                <View style={{fontWeight: "bold", paddingLeft: 16}}>
                    <StyledAnchor style={styles.section} href="#Types">Types</StyledAnchor>
                </View>}
            {typeDecls.map(decl => 
                <View style={{paddingLeft: 32}}>
                    <StyledAnchor style={styles.anchor} href={`#${decl.name}`}>{decl.name}</StyledAnchor>
                </View>)}
            {typeDecls.length > 0 && <View style={{height: 8}}/>}
        </React.Fragment>
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
                        {name === this.state.package &&
                            this.renderExports(declarations, files)}
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
        height: "100%",
        flexDirection: "row",
        fontFamily: "sans-serif",
        paddingLeft: 8,
    },
    nav: {
        height: "100%",
        flexShrink: 0,
        paddingRight: 32,
        overflow: "auto",
    },
    content: {
        height: "100%",
        overflow: "auto",
        paddingRight: 8,
        flexGrow: 1,
    },
    item: {
        flexShrink: 0,
        fontSize: 16,
        color: Color.offBlack50,
        lineHeight: 1.3,
        cursor: "pointer",
    },
    selectedItem: {
        color: Color.offBlack,
    },
    anchor: {
        flexShrink: 0,
        color: Color.offBlack50,
        textDecoration: "none",
    },
    section: {
        flexShrink: 0,
        color: Color.offBlack,
        textDecoration: "none",
    },
});
