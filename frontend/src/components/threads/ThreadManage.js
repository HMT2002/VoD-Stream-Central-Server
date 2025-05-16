import React, { useState } from "react";

import Utils from "../../Utils";
import Card from "../UI elements/Card";
import Button from "../UI elements/Button";
import ReactLoading from "react-loading";

import { Link, useNavigate } from "react-router-dom";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";

import "../../styles/ThreadManage.css";

const ThreadManage = (props) => {
    const [isLoadingVideo, setIsLoadingVideo] = useState(true);

    const navigate = useNavigate();

    const OnVideoReadyHandler = () => {
        setIsLoadingVideo(false);
    }

    const NavigateToEditThreadPageHandler = () => {
        navigate(
            "/workshop/edit/thread/" + props.thread.slug,
            { state: props.thread }
        );
    }

    const DeleteThreadHandler = () => {
        props.onDelete(props.thread);
    }

    return (
        <React.Fragment>
            <Card className="thread-manage">
                {isLoadingVideo && <div className="thread-manage__video-onload">
                    <ReactLoading type="spinningBubbles" color="gray" height="35px" width="35px" />
                </div>}
                <iframe
                    className="thread-manage__video"
                    style={isLoadingVideo ?
                        { position: "absolute", visibility: "hidden" } :
                        { position: "relative", visibility: "visible" }}
                    type="video/mp4"
                    title={`${props.thread.title} video`}
                    poster={props.thread.video.thumbLink}
                    src={`https://drive.google.com/file/d/${props.thread.video.vidLink}/preview`}
                    autoPlay={false}
                    controls
                    onLoad={OnVideoReadyHandler}>
                </iframe>
                <Link className="thread-manage__details" to={"/thread/" + props.thread.slug}>
                    <div className="thread-manage__title">{props.thread.title}</div>
                    <div className="flex center-content-cross" style={{ marginBlockStart: "0.3rem", marginBlockEnd: "1rem" }}>
                        <img className="thread-manage__creator-avatar" alt="Creator Avatar" src={props.thread.user.photo.link} />
                        <div className="thread-manage__creator-display-name">{props.thread.user.username}</div>
                        <div className="thread-manage__creator-display-name" style={{ marginInline: "0.5rem" }}>|</div>
                        <div className="thread-manage__creator-display-name">{`Created Date: ${Utils.DateFormatter(props.thread.createDate)}`}</div>
                    </div>
                    <div className="thread-manage__content">{props.thread.content}</div>
                </Link>
                <div className="thread-manage__controls">
                    <Button className="edit-control" icon={<FaEdit />} onClick={NavigateToEditThreadPageHandler}>
                        <div className="tool-tip">Edit Thread</div>
                    </Button>
                    <Button className="delete-control" icon={<FaRegTrashAlt />} onClick={DeleteThreadHandler} >
                        <div className="tool-tip">Delete Thread</div>
                    </Button>
                </div>
            </Card>
        </React.Fragment>
    );
}

export default ThreadManage;