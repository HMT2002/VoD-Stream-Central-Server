export const fetchCommentsByVideoId = async (videoID) => {
  if (!videoID) {
    return { status: 'fail' };
  }
  const response = await fetch('/api/v1/comment/get-all-comment/' + videoID, {
    method: 'GET',
    headers: {
      // 'Content-Type': 'application/json',
      // Authorization: storedToken,
    },
  });

  const data = await response.json();
  // console.log(dataComment);
  return data;
};

export const createComment = async (comment, threadSlug, token) => {
  if (!comment) {
    return { status: 'fail' };
  }
  const response = await fetch('/api/v1/threads/' + threadSlug + '/comment', {
    method: 'POST',
    body: JSON.stringify(comment),
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  });
  const data = await response.json();
  // console.log(response_data);
  return data;
};

export const fetchCommentsFromUser = async (account, token) => {
  const response = await fetch('/api/v1/threads/comments/' + account, {
    method: 'GET',
    headers: {
      Authorization: token,
    },
  });
  const data = await response.json();
  // console.log(response_data);
  return data;
};

export const deleteComment = async (token, payload) => {
  try {
    const response = await fetch('/api/v1/threads/comments/ext/' + payload.comment._id, {
      method: 'DELETE',
      body: JSON.stringify(payload),
      headers: {
        Authorization: token,
      },
    });
    const data = await response.json();

    return data;
  } catch (error) {
    console.log(error);
  }
};

const updateComment = async (token, payload) => {
  try {
    const response = await fetch('/api/v1/threads/comments/ext/' + payload.id, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

const commentAPIs = {
  fetchCommentsFromUser,
  fetchCommentsByVideoId,
  createComment,
  deleteComment,
  updateComment,
};

export default commentAPIs;
