import React from "react";

import CommentOnThread from "./CommentOnThread";

const CommentOnThreadList = (props) => {
    const comments = props.comments.map(comment => {
        return (
            <CommentOnThread
                key={props.comments.indexOf(comment)}
                context={props.context}
                comment={comment}
                threadCreator={props.threadCreator}
                onDelete={props.onCommentDelete} />
        );
    });

    return (
        <React.Fragment>
            <div>{comments}</div>
        </React.Fragment>
    );
};

export default CommentOnThreadList;