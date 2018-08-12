// @flow
import * as React from "react";
import {StyleSheet} from "aphrodite";
import {parse} from "@babel/parser";
import {transform} from "sucrase";
import SyntaxHighlighter, {registerLanguage} from "react-syntax-highlighter/prism-light";
import jsx from 'react-syntax-highlighter/languages/prism/jsx';
import prism from 'react-syntax-highlighter/styles/prism/prism'; 
 
import {View} from "@khanacademy/wonder-blocks-core";

registerLanguage('jsx', jsx);

const processCode = (code: string, id: string): string => {
    const codeWithUpdateImported = code.replace(
        /\s+from\s+['"]([^'"]+)['"]+/g, 
        (match, group) => ` from "/node_modules/${group}.js"`,
    );

    const options = {
        sourceType: "module",
        plugins: [
            // enable jsx and flow syntax
            "jsx",
            "flow",
            "classProperties",
            "objectRestSpread",
            "dynamicImport"
        ],
    };

    const ast = parse(codeWithUpdateImported, options);

    const lastStatement = ast.program.body[ast.program.body.length - 1];

    if (lastStatement.type !== "ExpressionStatement") {
        throw new Error("last line should be an expression");
    }

    if (lastStatement.expression.type !== "JSXElement") {
        throw new Error("last line should be a JSX Element");
    }

    const lines = [
        'import * as React from "/node_modules/react.js";',
        'import * as ReactDOM from "/node_modules/react-dom.js";',
        'import Button from "/node_modules/@khanacademy/wonder-blocks-button.js";',
    ];

    lines.push(
        ...codeWithUpdateImported
            .split("\n")
            .map(
                (line, index) =>
                    index + 1 === lastStatement.loc.start.line
                        ? `const example = ${line}`
                        : `${line}`,
            ),
    );

    lines.push(`const container = document.getElementById("${id}");`);
    lines.push(`ReactDOM.render(example, container);`);
    
    return transform(lines.join("\n"), {
        transforms: ["flow", "jsx"],
    }).code;
};

let id = 0;
const getId = () => {
    return `example-${id++}`;
}

type Props = {
    value: string,
    language: string,
}

type State = {
    showCode: boolean,
}

export default class CodeBlock extends React.PureComponent<Props, State> {
    codeEl: HTMLElement;
    id: string;

    static defaultProps = {
        language: "",
    };
    
    constructor(props: Props) {
        super(props);
        this.id = getId();
    }
    
    state = {
        showCode: false,
    };

    componentDidMount() {
        if (!document.body) {
            return;
        }
        const {body} = document;

        const code = processCode(this.props.value, this.id);
        
        const script = document.createElement("script");
        script.type = "module";
        script.appendChild(document.createTextNode(code));
        body.appendChild(script);
    }

    componentDidUpdate() {
        // TODO: handle updating examples by replacing SyntaxHighlither with monaco
    }

    handleShowCode = () => this.setState({showCode: true});

    handleHideCode = () => this.setState({showCode: false});

    render() {
        const {showCode} = this.state;
        return (
            <View>
                <View id={this.id} style={styles.example} />
                <View style={styles.buttonContainer}>
                    {!showCode && <button onClick={this.handleShowCode}>show code</button>}
                    {showCode && <button onClick={this.handleHideCode}>hide code</button>}
                </View>
                {showCode && <View>
                    <SyntaxHighlighter language="jsx" style={prism}>
                        {this.props.value}
                    </SyntaxHighlighter>
                </View>}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    example: {
        border: `solid 1px lightgray`,
        padding: 16,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "start",
        lineHeight: 0,
        marginTop: 16,
    },
});
