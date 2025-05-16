import React, { useContext, useEffect, useState } from 'react';

import Utils from '../Utils';
import AuthContext from '../contexts/auth-context';
import CommentInput from '../components/comments/CommentInput';
import CommentOnThreadList from '../components/comments/CommentOnThreadList';
import Card from '../components/UI elements/Card';
import Input from '../components/UI elements/Input';
import ReactLoading from 'react-loading';

import { useParams, useNavigate } from 'react-router-dom';
import { fetchThreadBySlug } from '../APIs/thread-apis';
import { fetchCommentsByVideoId, createComment, deleteComment } from '../APIs/comments-apis';

import '../styles/ThreadPage.css';

const ThreadPage = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const params = useParams();

  const [thread, setThread] = useState(null);

  const [comments, setComments] = useState([]);

  const LoadAllComments = async () => {
    try {
      const response = await fetchCommentsByVideoId(params.slug);

      if (response.status === 'ok') {
        const unorderedComments = Array.from(response.data);
        unorderedComments.sort((a, b) => new Date(b.createDate) - new Date(a.createDate));

        setComments(unorderedComments);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const UserPostCommentHandler = async (comment) => {
    if (!authContext.isAuthorized) return navigate('/login');

    const userToken = authContext.token;
    const threadSlug = params.slug;
    const commentData = {
      content: comment,
      createDate: Date.now,
      thread: thread,
    };

    await createComment(commentData, threadSlug, userToken);
    await LoadAllComments();
  };

  const UICommentDeleteHandler = (comment) => {
    const commentIndex = comments.indexOf(comment);
    let newComments = comments.map((x) => x);
    newComments.splice(commentIndex, 1);
    setComments(newComments);
  };

  const CommentDeleteHandler = async (deletedComment) => {
    try {
      const payload = { comment: deletedComment };
      const response = await deleteComment(authContext.token, payload);

      if (response != null && response.status === 'success delete') {
        alert('Comment deleted!');
        UICommentDeleteHandler(deletedComment);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const FetchThreadHandler = async () => {
      try {
        const response = await fetchThreadBySlug(params.slug);

        if (response != null && response.status === 'ok') {
          setThread(response.data.thread);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const FetchAllCommentsHandler = async () => {
      try {
        const response = await fetchCommentsByVideoId(params.slug);

        if (response.status === 'ok') {
          const unorderedComments = Array.from(response.data);
          unorderedComments.sort((a, b) => new Date(b.createDate) - new Date(a.createDate));
          setComments(unorderedComments);
        }
      } catch (error) {
        console.log(error);
      }
    };

    FetchThreadHandler();
    FetchAllCommentsHandler();
  }, [params.slug]);

  return (
    <React.Fragment>
      {thread == null && (
        <div className="account-page__loading">
          <ReactLoading type="spin" width="50px" height="50px" color="#13088e" />
        </div>
      )}
      {thread != null && (
        <div className="thread-page">
          <Card className="thread-page__thread">
            <div className="thread-page__thread-title">{thread.title}</div>
            <div className="thread-page__creator">
              <img className="thread-page__creator-avatar" src={thread.user.photo.link} alt="Creator Avatar" />
              <div>
                <div className="thread-page__creator-name">{thread.user.username}</div>
                <div className="thread-page__thread-created-date">
                  {Utils.DateConverter(new Date(thread.createDate))}
                </div>
              </div>
            </div>
            <iframe
              className="video-js thread-page__thread-video"
              controls
              autoPlay={false}
              poster={thread.video.thumbLink}
              title={thread.title}
              src={`https://drive.google.com/file/d/${thread.video.vidLink}/preview`}
              // src={"https://drive.google.com/uc?export=preview&id=1BD3NC7OimCQ4uZ7wJhDix2-gRacdg-LU"}
              type="video/mp4"
            />
            <Input className="thread-page__thread-content" multiline={true} value={thread.content} disabled />
          </Card>
          <div className="thread-page__comments-section">
            <div className="thread-page__comments-section-label">Comments</div>
            <CommentInput
              className="thread-page__comments-section-input"
              context={authContext}
              onUserPostComment={UserPostCommentHandler}
            />
            <CommentOnThreadList
              context={authContext}
              comments={comments}
              threadCreator={thread.user._id}
              onCommentDelete={CommentDeleteHandler}
            />
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default ThreadPage;
