import React, { useEffect, useState } from 'react';

import commentAPIs from '../../APIs/comments-apis';
import CommentManageList from '../comments/CommentManageList';
import ReactLoading from 'react-loading';

const WorkshopCommentManager = (props) => {
  const [comments, setComments] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const UICommentDeleteHandler = (comment) => {
    const commentIndex = comments.indexOf(comment);
    let newComments = comments.map((x) => x);
    newComments.splice(commentIndex, 1);
    setComments(newComments);
  };

  const CommentDeleteHandler = async (deletedComment) => {
    try {
      const payload = { comment: deletedComment };
      const response = await commentAPIs.deleteComment(props.context.token, payload);

      if (response != null && response.status === 'success delete') {
        alert('Comment deleted!');
        UICommentDeleteHandler(deletedComment);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const FetchCommentsOfUserThreads = async () => {
      try {
        const response = await commentAPIs.fetchCommentsFromUser(props.context.username, props.context.token);

        if (response != null && response.status === 'ok') {
          setComments(response.data);
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    };

    FetchCommentsOfUserThreads();
  }, [props.context]);

  return (
    <React.Fragment>
      <div className="workshop-page__tab">
        <div className="workshop-page__title">Comments</div>
        {isLoading && (
          <div className="flex center-content" style={{ height: '100%' }}>
            <ReactLoading type="spin" width="50px" height="50px" color="#13088e" />
          </div>
        )}
        {!isLoading && (
          <CommentManageList context={props.context} comments={comments} onDeleteComment={CommentDeleteHandler} />
        )}
      </div>
    </React.Fragment>
  );
};

export default WorkshopCommentManager;
