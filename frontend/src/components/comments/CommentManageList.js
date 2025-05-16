import React from "react";

import CommentManage from "./CommentManage";
import WorkshopNoContentAvailable from "../workshops/WorkshopNoContentAvailable";

const CommentManageList = ({ comments, onDeleteComment, context }) => {
    const commentList = comments.map((comment) => (
        <CommentManage
            key={comments.indexOf(comment)}
            comment={comment}
            onDelete={onDeleteComment} />
    ));

    return (
        <React.Fragment>
            {commentList.length === 0 && <WorkshopNoContentAvailable account={context.username} type="comment" />}
            {commentList.length > 0 && <div>{commentList}</div>}
        </React.Fragment>
    );
};

export default CommentManageList;