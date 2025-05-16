import React, { useState } from 'react';

import Input from '../UI elements/Input';
import Button from '../UI elements/Button';

import '../../styles/CommentInput.css';

const CommentInput = (props) => {
  const [commentInput, setCommentInput] = useState('');

  const CommentInputChangeHandler = (event) => {
    setCommentInput(event.target.value);
  };

  const PostCommentSubmitHandler = (event) => {
    event.preventDefault();
    props.onUserPostComment(commentInput);
    setCommentInput('');
  };

  return (
    <React.Fragment>
      <form className={'comment-input__form ' + props.className} onSubmit={PostCommentSubmitHandler}>
        <img
          className="comment-input__user-avatar"
          src={props.context.avatar != null ? props.context.avatar : 'https://i.imgur.com/KNJnIR0.jpeg'}
          alt="User Avatar"
        />
        <div style={{ width: '100%' }}>
          <Input
            className="comment-input__input-field bg-white rounded-sm"
            multiline={true}
            minRows={2}
            value={commentInput}
            onChange={CommentInputChangeHandler}
            variant="filled"
            label={null}
            placeholder="Write your comment here..."
          />
          <Button className="comment-input__submit-button bg-red-400" content="Post" />
        </div>
      </form>
    </React.Fragment>
  );
};

export default CommentInput;
