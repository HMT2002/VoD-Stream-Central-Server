import React from "react";

import Utils from "../../Utils";
import Button from "../UI elements/Button";

import { Link } from "react-router-dom";
import { FaRegTrashAlt } from "react-icons/fa";

import "../../styles/CommentManage.css";

const CommentManage = (props) => {

    const DeleteCommentHandler = () => {
        props.onDelete(props.comment);
    }

    return (
        <React.Fragment>
            <div className="comment-manage">
                <div className="container">
                    <img className="creator-avatar" alt="Avatar" src={props.comment.user.photo.link} />
                    <div>
                        <div className="flex center-content-cross">
                            <div className="creator-display-name">{props.comment.user.username}</div>
                            <div style={{ marginInline: "0.5rem" }}>|</div>
                            <div className="created-date">Created date: {Utils.DateFormatter(props.comment.createDate)}</div>
                        </div>
                        <div className="content">{props.comment.content}</div>
                    </div>
                    <Link className="thread-part" to={`/thread/${props.comment.thread.slug}`}>
                        <img
                            className="thread-video-thumbnail"
                            alt="Video Thumbnail"
                            src={props.comment.thread.video.thumbLink}>
                        </img>
                        <div className="thread-title">{props.comment.thread.title}</div>
                    </Link>
                    <Button className="delete-control" icon={<FaRegTrashAlt />} onClick={DeleteCommentHandler} >
                        <div className="tool-tip">Delete Comment</div>
                    </Button>
                </div>
            </div>
        </React.Fragment>
    );
}

export default CommentManage;