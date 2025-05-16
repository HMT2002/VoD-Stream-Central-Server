import React, { useEffect, useState } from 'react';

import Utils from '../../Utils';
import commentAPIs from '../../APIs/comments-apis';
import Button from '../UI elements/Button';
import Input from '../UI elements/Input';

import { Link } from 'react-router-dom';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { AiFillEdit } from 'react-icons/ai';
import { FaRegTrashAlt } from 'react-icons/fa';

import '../../styles/CommentOnThread.css';

const CommentOnThread = (props) => {
  const [content, setContent] = useState('');
  const [editContent, setEditContent] = useState('');

  const [isControlsUsed, setIsControlsUsed] = useState(false);
  const [isEditting, setIsEditting] = useState(false);

  const CancelEditHandler = () => {
    setIsEditting(false);
    setEditContent(content);
  };

  const CommentEditChangeHandler = (event) => {
    setEditContent(event.target.value);
  };

  const UpdateCommentHandler = async () => {
    try {
      const payload = {
        id: props.comment._id,
        content: editContent,
      };

      const response = await commentAPIs.updateComment(props.context.token, payload);

      if (response != null && response.status === 'success update comment') {
        setContent(editContent);
        setIsEditting(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setContent(props.comment.content);
    setEditContent(props.comment.content);
  }, [props.comment]);

  console.log(props.threadCreator);

  return (
    <React.Fragment>
      <div className="comment">
        <img className="comment__creator-avatar" src={props.comment.user.photo.link} alt="User Avatar" />
        <div>
          <div className="comment__details">
            <Link
              className={
                'comment__details__creator-name ' +
                (props.comment.user._id === props.threadCreator ? 'thread-host' : '')
              }
              to={`/user/${props.comment.user._id}`}
            >
              {props.comment.user.username}
            </Link>
            <div className="comment__details__created-date">
              {Utils.DateFormatter(new Date(props.comment.createDate))}
            </div>
          </div>
          {!isEditting && <div className="comment__content">{content}</div>}
          {isEditting && (
            <Input
              className="comment__content"
              multiline={true}
              value={editContent}
              variant="standard"
              autoFocus={true}
              onChange={CommentEditChangeHandler}
            />
          )}
          {isEditting && (
            <div className="comment-edit-controls">
              <Button style={{ color: '#3f3f3f' }} content="Cancel" onClick={CancelEditHandler} />
              <Button
                style={{ color: '#3f3f3f' }}
                content="Save"
                onClick={UpdateCommentHandler}
                disabled={editContent == null || editContent === '' || editContent === content}
              />
            </div>
          )}
        </div>
        {props.context.displayName === props.comment.user.username && (
          <div className="comment-controls">
            {!isEditting && (
              <Button
                className="control-options"
                icon={<BsThreeDotsVertical />}
                onClick={() => setIsControlsUsed(true)}
              ></Button>
            )}
            {isControlsUsed && (
              <div className="controls-container" onBlur={() => setIsControlsUsed(false)}>
                <Button
                  icon={<AiFillEdit style={{ marginInlineEnd: '0.5rem' }} />}
                  content="Edit"
                  onClick={() => setIsEditting(true)}
                />
                <Button
                  icon={<FaRegTrashAlt style={{ marginInlineEnd: '0.5rem' }} />}
                  content="Delete"
                  onClick={() => props.onDelete(props.comment)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default CommentOnThread;
