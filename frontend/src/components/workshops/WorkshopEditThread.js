import React, { useEffect, useRef, useState } from 'react';

import Utils from '../../Utils';
import Input from '../UI elements/Input';
import Button from '../UI elements/Button';
import ReactLoading from 'react-loading';

import { fetchThreadBySlug } from '../../APIs/thread-apis';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { uploadVideo, updateThread } from '../../APIs/thread-apis';
import { TextField, Autocomplete } from '@mui/material';
import { RiVideoFill } from 'react-icons/ri';
import { BiRefresh } from 'react-icons/bi';

const optionsThreadTags = ['Daily life', 'Technique', 'Art', 'Cruisine', 'Du lịch'];

let initialTitle = '';
let initialTag = '';
let initialContent = '';
let initialVideoURL = '';
let initialThumbnailURL = '';

const WorkshopEditThread = (props) => {
  const [threadTitle, setThreadTitle] = useState('');
  const [threadTag, setThreadTag] = useState('');
  const [threadContent, setThreadContent] = useState('');

  const [threadVideo, setThreadVideo] = useState(null);
  const [threadVideoURL, setThreadVideoURL] = useState(null);
  const [threadVideoName, setThreadVideoName] = useState(null);

  const [isValidThreadTitle, setIsValidThreadTitle] = useState(true);
  const [isValidThreadTag, setIsValidThreadTag] = useState(true);
  const [isValidThreadContent, setIsValidThreadContent] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isThreadChange, setIsThreadChange] = useState(false);
  const [threadLink, setThreadLink] = useState(null);

  const { state } = useLocation();
  const { slug } = useParams();

  const navigate = useNavigate();
  const threadVideoRef = useRef();

  const ThreadTitleChangeHandler = (event) => {
    setThreadTitle(event.target.value);
  };

  const ThreadTagChangeHandler = (event, newValue) => {
    setThreadTag(newValue != null ? newValue : '');
  };

  const ThreadContentChangeHandler = (event) => {
    setThreadContent(event.target.value);
  };

  const VideoChangeHandler = async (event) => {
    if (event.target.files.length > 0) {
      const localURL = await URL.createObjectURL(event.target.files[0]);
      setThreadVideo(event.target.files[0]);
      setThreadVideoURL(localURL);
      setThreadVideoName(event.target.files[0].name);
      setIsThreadChange(true);
    }
  };

  const BrowseVideoHandler = () => {
    threadVideoRef.current.click();
  };

  const NormalizeThreadTitle = (title) => {
    title = title.trim();
    title = title.normalize('NFD');
    title = title.replace(/[\u0300-\u036f]/g, '');
    title = title.replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'));
    title = title.toLowerCase();
    title = title.replace('-', '_');
    title = title.replace(' ', '-');
    return title;
  };

  const UpdateThreadHandler = async () => {
    setIsProcessing(true);
    try {
      const threadSlug = NormalizeThreadTitle(threadTitle);
      let threadVideoCloudURL = null;
      let threadVideoThumbnailCloudURL = null;

      const formData = new FormData();
      formData.append('myFile', threadVideo);

      const response = await uploadVideo(formData);

      if (response != null && response.status === 'success upload') {
        threadVideoCloudURL = response.driveID;
        threadVideoThumbnailCloudURL = response.thumbnail;
      } else {
        threadVideoCloudURL = initialVideoURL;
        threadVideoThumbnailCloudURL = initialThumbnailURL;
      }

      const payload = {
        title: threadTitle,
        slug: threadSlug,
        tag: threadTag,
        content: threadContent,
        video: {
          vidLink: threadVideoCloudURL,
          thumbLink: threadVideoThumbnailCloudURL,
        },
        updateDate: Date.now,
      };

      const threadUpdateResponse = await updateThread(props.context.token, slug, payload);

      if (threadUpdateResponse != null && threadUpdateResponse.status === 'success update') {
        alert('Thread updated successfully!');
        navigate(`/workshop/edit/thread/${threadSlug}`);
      }
    } catch (error) {
      console.log(error);
    }
    setIsProcessing(false);
  };

  useEffect(() => {
    const InitState = (thread) => {
      initialTitle = thread.title;
      initialTag = thread.tag;
      initialContent = thread.content;
      initialVideoURL = thread.video.vidLink;
      initialThumbnailURL = thread.video.thumbLink;

      const tagIndex = optionsThreadTags.indexOf(initialTag);

      setThreadTitle(initialTitle);
      setThreadTag(optionsThreadTags[tagIndex]);
      setThreadContent(initialContent);
      setThreadLink(document.location.origin + '/thread/' + thread.slug);
      setThreadVideoURL(`https://drive.google.com/file/d/${initialVideoURL}/preview`);

      // setcreatedDate: response.data.thread.createDate
      // thumbnail: response.data.thread.video.thumbLink
    };

    const GetThreadBySlug = async () => {
      try {
        const response = await fetchThreadBySlug(slug);
        if (response != null && response.status === 'ok') {
          InitState(response.data.thread);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (state == null) {
      GetThreadBySlug();
    } else {
      InitState(state);
    }

    setIsLoading(false);
  }, [state, slug]);

  useEffect(() => {
    setIsValidThreadTitle(!Utils.EmptyValueValidator(threadTitle));
    setIsThreadChange(threadTitle !== initialTitle);
  }, [threadTitle]);

  useEffect(() => {
    setIsValidThreadTag(optionsThreadTags.includes(threadTag));
    setIsThreadChange(threadTag !== initialTag);
  }, [threadTag]);

  useEffect(() => {
    setIsValidThreadContent(threadContent.length >= 50);
    setIsThreadChange(threadContent !== initialContent);
  }, [threadContent]);

  return (
    <React.Fragment>
      {isLoading && (
        <div className="flex center-content" style={{ margin: 'auto', marginBlockStart: '15rem' }}>
          <ReactLoading type="spin" width="50px" height="50px" color="#13088e" />
        </div>
      )}
      {!isLoading && (
        <div className="workshop-new-thread-tab">
          <div className="workshop-page__title">Edit Thread</div>
          <div className="workshop-new-thread-tab__work-section">
            <div className="workshop-new-thread-tab__thread">
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '90.3%' }}>
                <div style={{ width: '65%' }}>
                  <div className="workshop-new-thread-tab__label">Title</div>
                  <Input
                    className="workshop-new-thread-tab__input"
                    style={{ width: '100%' }}
                    value={threadTitle}
                    onChange={ThreadTitleChangeHandler}
                    isValid={isValidThreadTitle}
                    helperText="Thread title must not be empty!"
                    placeholder="Thread Title"
                    disabled={isProcessing}
                  />
                </div>
                <div style={{ width: '30%' }}>
                  <div className="workshop-new-thread-tab__label">Tag</div>
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    value={threadTag}
                    onChange={ThreadTagChangeHandler}
                    options={optionsThreadTags}
                    sx={{ width: '100%' }}
                    disabled={isProcessing}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={isValidThreadTag === false}
                        placeholder="Thread Tag"
                        helperText={isValidThreadTag === false ? 'Thread tag is empty!' : ''}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="workshop-new-thread-tab__label">Content</div>
              <Input
                className="workshop-new-thread-tab__input-content"
                multiline={true}
                minRows={10}
                value={threadContent}
                isValid={isValidThreadContent !== false}
                onChange={ThreadContentChangeHandler}
                placeholder="Thread Content"
                helperText="Thread content must be equal or greater than 50 characters!"
                disabled={isProcessing}
              />
            </div>
            <div className="workshop-new-thread-tab__video">
              <div className="workshop-new-thread-tab__label">Video</div>
              {threadVideoURL == null && (
                <Button
                  className="workshop-new-thread-tab__video-required"
                  content="Upload Video"
                  icon={<RiVideoFill className="workshop-new-thread-tab__video-required-icon" />}
                  onClick={BrowseVideoHandler}
                />
              )}
              {threadVideoURL != null && (
                <iframe
                  className="workshop-new-thread-tab__video-preview"
                  type="video/mp4"
                  title="uploaded video"
                  src={threadVideoURL}
                  controls
                  disabled={isProcessing}
                />
              )}
              {threadVideoURL != null && (
                <div style={{ marginInlineEnd: '0.5rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <div>
                      <div className="workshop-new-thread-tab__label workshop-new-thread-tab__label-file-name">
                        File name:
                      </div>
                      <div className="workshop-new-thread-tab__file-name">
                        {threadVideoName}
                        <div className="tool-tip">{threadVideoName}</div>
                      </div>
                    </div>
                    <Button
                      className="workshop-new-thread-tab__video-select-btn"
                      icon={<BiRefresh style={{ width: '23px', height: '23px' }} />}
                      content="Change"
                      onClick={BrowseVideoHandler}
                      disabled={isProcessing}
                    />
                  </div>
                  <div style={{ marginInlineEnd: '0.5rem', marginBlockStart: '0.5rem' }}>
                    <div className="workshop-new-thread-tab__label workshop-new-thread-tab__label-file-name">
                      Thread Link:
                    </div>
                    <div className="workshop-new-thread-tab__file-name" style={{ width: '310px' }}>
                      <Link to={threadLink}>{threadLink}</Link>
                      <div className="tool-tip">{threadLink}</div>
                    </div>
                  </div>
                </div>
              )}
              <Button
                className="workshop-new-thread-tab__complete-btn"
                icon={
                  isProcessing && (
                    <ReactLoading className="loading-icon" type="spin" width="30px" height="30px" color="white" />
                  )
                }
                content={!isProcessing ? 'Save' : 'Processing'}
                disabled={
                  isProcessing || !isThreadChange || !isValidThreadTitle || !isValidThreadTag || !isValidThreadContent
                }
                onClick={UpdateThreadHandler}
              />
              <input
                ref={threadVideoRef}
                style={{ display: 'none' }}
                type="file"
                accept="video/*"
                onChange={VideoChangeHandler}
              />
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default WorkshopEditThread;
