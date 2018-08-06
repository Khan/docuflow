// @flow
import * as React from "react";
import Markdown from "react-markdown";
import {addStyle} from "@khanacademy/wonder-blocks-core";

import type {CommentLine, CommentBlock} from "../types/types.js";

const StyledMarkdown = addStyle(Markdown);

type Props = {
    comments: Array<CommentBlock | CommentLine>,
    style?: any,
}

export default class Comments extends React.Component<Props> {
    render() {
        return this.props.comments.map(comment => {
            const lines = comment.value.split("\n")
                .map(line => line.replace(/^\s*\*\s?/, ""))
            if (lines[0].trim() === "") {
                lines.shift();
            }
            if (lines[lines.length - 1].trim() === "") {
                lines.pop();
            }
            return <StyledMarkdown 
                style={this.props.style}
                source={lines.join("\n")}
            />;
        });
    }
}
