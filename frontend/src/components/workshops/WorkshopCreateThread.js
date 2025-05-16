import React, { useRef, useState } from 'react';

import Utils from '../../Utils';
import Input from '../UI elements/Input';
import Button from '../UI elements/Button';
import ReactLoading from 'react-loading';

import { Link } from 'react-router-dom';
import { uploadVideo, createThread } from '../../APIs/thread-apis';
import { TextField, Autocomplete } from '@mui/material';
import { RiVideoFill } from 'react-icons/ri';
import { BiRefresh } from 'react-icons/bi';

import '../../styles/WorkshopCreateThread.css';

const optionsThreadTags = ['Daily life', 'Technique', 'Art', 'Cruisine', 'Du lịch'];

const WorkshopCreateThread = (props) => {
  const [threadTitle, setThreadTitle] = useState('');
  const [threadTag, setThreadTag] = useState('');
  const [threadContent, setThreadContent] = useState('');

  const [threadVideo, setThreadVideo] = useState(null);
  const [threadVideoURL, setThreadVideoURL] = useState(null);
  const [threadVideoName, setThreadVideoName] = useState(null);

  const [isValidThreadTitle, setIsValidThreadTitle] = useState(null);
  const [isValidThreadTag, setIsValidThreadTag] = useState(null);
  const [isValidThreadContent, setIsValidThreadContent] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [threadLink, setThreadLink] = useState(null);

  const threadVideoRef = useRef();

  const ThreadTitleChangeHandler = (event) => {
    setThreadTitle(event.target.value);
    setIsValidThreadTitle(null);
  };

  const ThreadTitleBlurHandler = () => {
    setIsValidThreadTitle(!Utils.EmptyValueValidator(threadTitle));
  };

  const ThreadTagChangeHandler = (event, newValue) => {
    setThreadTag(newValue != null ? newValue : '');
    setIsValidThreadTag(null);
  };

  const ThreadTagBlurHandler = () => {
    setIsValidThreadTag(optionsThreadTags.includes(threadTag));
  };

  const ThreadContentChangeHandler = (event) => {
    setThreadContent(event.target.value);
    setIsValidThreadContent(null);
  };

  const ThreadContentBlurHandler = () => {
    const isValid = threadContent.length >= 50;
    setIsValidThreadContent(isValid);
  };

  const VideoChangeHandler = async (event) => {
    if (event.target.files.length > 0) {
      const localURL = await URL.createObjectURL(event.target.files[0]);
      setThreadVideo(event.target.files[0]);
      setThreadVideoURL(localURL);
      setThreadVideoName(event.target.files[0].name);
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

  const CreateNewThreadHandler = async () => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('myFile', threadVideo);

      const response = await uploadVideo(formData);

      if (response != null && response.status === 'success upload') {
        const slug = NormalizeThreadTitle(threadTitle);
        const threadVideoCloudURL = response.driveID;
        const threadVideoThumbnailCloudURL = response.thumbnail;

        const newThread = {
          title: threadTitle,
          video: {
            vidLink: threadVideoCloudURL,
            thumbLink: threadVideoThumbnailCloudURL,
          },
          content: threadContent,
          tag: threadTag,
          slug: slug,
        };

        const threadUploadResponse = await createThread(newThread, props.context.token);

        if (threadUploadResponse != null && threadUploadResponse.status === 'ok') {
          alert('New thread uploaded successfully!');
          setThreadLink(document.location.origin + '/thread/' + slug);
        }

        if (
          threadUploadResponse != null &&
          threadUploadResponse.status === 'fail' &&
          threadUploadResponse.message === 'The title is already existed'
        ) {
          alert('Failed to upload. Thread title is already existed!');
        }
      }
    } catch (error) {
      alert(error);
    }
    setIsProcessing(false);
  };

  return (
    <React.Fragment>
      <div className="workshop-new-thread-tab">
        <div className="workshop-page__title">New Thread</div>
        <div className="workshop-new-thread-tab__work-section">
          <div className="workshop-new-thread-tab__thread">
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '90.3%' }}>
              <div style={{ width: '65%' }}>
                <div className="workshop-new-thread-tab__label">Title</div>
                <Input
                  className="workshop-new-thread-tab__input"
                  style={{ width: '100%' }}
                  value={threadTitle}
                  isValid={isValidThreadTitle !== false}
                  onChange={ThreadTitleChangeHandler}
                  onBlur={ThreadTitleBlurHandler}
                  placeholder="Thread Title"
                  helperText="Thread title must not be empty!"
                  disabled={isProcessing}
                />
              </div>
              <div style={{ width: '30%' }}>
                <div className="workshop-new-thread-tab__label">Tag</div>
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  inputValue={threadTag}
                  onChange={ThreadTagChangeHandler}
                  onBlur={ThreadTagBlurHandler}
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
              onBlur={ThreadContentBlurHandler}
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <div style={{ marginInlineEnd: '0.5rem' }}>
                  <div className="workshop-new-thread-tab__label workshop-new-thread-tab__label-file-name">
                    File name:
                  </div>
                  <div
                    className="workshop-new-thread-tab__file-name"
                    style={threadLink != null ? { width: '310px' } : {}}
                  >
                    {threadVideoName}
                    <div className="tool-tip">{threadVideoName}</div>
                  </div>
                  {threadLink != null && (
                    <div style={{ marginInlineEnd: '0.5rem', marginBlockStart: '0.5rem' }}>
                      <div className="workshop-new-thread-tab__label workshop-new-thread-tab__label-file-name">
                        Thread Link:
                      </div>
                      <div className="workshop-new-thread-tab__file-name" style={{ width: '310px' }}>
                        <Link to={threadLink}>{threadLink}</Link>
                        <div className="tool-tip">{threadLink}</div>
                      </div>
                    </div>
                  )}
                </div>
                {threadLink == null && (
                  <Button
                    className="workshop-new-thread-tab__video-select-btn"
                    icon={<BiRefresh style={{ width: '23px', height: '23px' }} />}
                    content="Change"
                    onClick={BrowseVideoHandler}
                    disabled={isProcessing}
                  />
                )}
              </div>
            )}
            {isValidThreadTitle &&
              isValidThreadTag &&
              isValidThreadContent &&
              threadVideoURL != null &&
              threadLink == null && (
                <Button
                  className="workshop-new-thread-tab__complete-btn"
                  icon={
                    isProcessing && (
                      <ReactLoading className="loading-icon" type="spin" width="30px" height="30px" color="white" />
                    )
                  }
                  content={!isProcessing ? 'Upload' : 'Processing'}
                  onClick={CreateNewThreadHandler}
                  disabled={isProcessing}
                />
              )}
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
    </React.Fragment>
  );
};

export default WorkshopCreateThread;
