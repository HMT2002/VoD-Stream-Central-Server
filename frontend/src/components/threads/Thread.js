import React from "react";

import { Link } from "react-router-dom";
import { format, getDate } from "date-fns";

import Card from "../UI elements/Card";

import "../../styles/Thread.css";

const DateConverter = (date) => {
  const today = Date.now;
  const offset = getDate(today - date);

  if (offset === 0) return "Today";
  if (offset > 0 && offset <= 7)
    return `${offset} ${offset > 1 ? "days" : "day"} ago`;
  if (offset > 7) return format(date, "dd-MM-yyyy").toString();
};

const Thread = (props) => {
  const thread = { ...props.thread };
  const threadVideo = thread.video;
  const threadCreator = props.creator == null ? thread.user : props.creator;

  const threadCreatedDate = DateConverter(new Date(thread.createDate));

  return (
    <Card className={"thread " + props.className}>
      <Link className="thread" to={"/thread/" + thread.slug}>
        <div className="thread-creator">
          <img
            className="thread-creator avatar"
            src={threadCreator.photo.link}
            alt="Creator's avatar"
          />
          <h1 className="thread-creator display-name">
            {threadCreator.username}
          </h1>
        </div>
        <img
          className="thread-video-thumbnail"
          src={threadVideo.thumbLink}
          alt="Thread video thumbnail"
        />
        <div className="thread-summary">
          <h1 className="thread-summary title">{thread.title}</h1>
          <p className="thread-summary content">{thread.content}</p>
        </div>
        <h1 className="thread-create-date">{threadCreatedDate}</h1>
      </Link>
    </Card>
  );
};

export default Thread;
