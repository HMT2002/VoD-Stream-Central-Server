import React, { useRef, useState } from 'react';

import Utils from '../../Utils';
import UserAPIs from '../../APIs/user-apis';
import Button from '../UI elements/Button';
import ReactLoading from 'react-loading';

import { AiOutlineCamera } from 'react-icons/ai';

const AccountOverviewInfo = (props) => {
  const avatarInputRef = useRef();

  const [avatar, setAvatar] = useState(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  const UpdateUserAvatarHandler = async (cloudURL) => {
    try {
      const userUpdatePayload = { photo: { link: cloudURL } };
      const response = await UserAPIs.POSTUpdateUserInfo(
        props.context.username,
        props.context.token,
        userUpdatePayload
      );
      console.log(response);
      if (response != null && response.status === 'success') {
        props.context.OnAvatarUpdate(cloudURL);
        return true;
      } else {
        console.log('Unexpected error. Failed to update user avatar!');
      }
    } catch (error) {
      console.log(error);
    }
    return false;
  };

  const CloudUploadAvatarHandler = async (newAvatarFile) => {
    try {
      const uploadAvatarData = new FormData();
      uploadAvatarData.append('myFile', newAvatarFile);

      const response = await UserAPIs.POSTUploadAvatarAction(uploadAvatarData);

      if (response != null && response.status === 'success upload image') {
        return response.data;
      } else {
        console.log('Unexpected error. Failed to upload avatar to cloud!');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const UploadAvatarHandler = () => {
    avatarInputRef.current.click();
  };

  const ChangeAvatarHandler = async (event) => {
    if (event.target.files.length > 0) {
      setIsAvatarUploading(true);
      const cloudURL = await CloudUploadAvatarHandler(event.target.files[0]);
      const isSuccess = await UpdateUserAvatarHandler(cloudURL);
      if (isSuccess) setAvatar(cloudURL);
      setIsAvatarUploading(false);
    }
  };

  return (
    <React.Fragment>
      {props.userInfo != null && (
        <div className="account-page__overview">
          <div className="account-page__overview__avatar">
            <img src={avatar == null ? props.userInfo.photo.link : avatar} alt="Avatar" />
            {isAvatarUploading && (
              <div className="account-page__overview__avatar-change-spinner">
                <ReactLoading type="spin" width="32px" height="32px" color="#13088e" />
              </div>
            )}
            {!isAvatarUploading && (
              <Button className="account-page__overview__avatar-change-btn" onClick={UploadAvatarHandler}>
                <div className="account-page__overview__avatar-change-btn__icon">
                  <AiOutlineCamera style={{ width: '23px', height: '23px' }} />
                  <div>Edit</div>
                </div>
              </Button>
            )}
            <input
              ref={avatarInputRef}
              style={{ display: 'none' }}
              type="file"
              accept="image/*"
              onChange={ChangeAvatarHandler}
            />
          </div>
          <div>
            <div className="account-page__overview__username">{props.userInfo.username}</div>
            <div className="account-page__overview__account">{'Role: ' + props.userInfo.role}</div>
            <div className="account-page__overview__account">
              {'Created Date: ' + Utils.DateFormatter(props.userInfo.createdDate)}
            </div>
            <div className="account-page__overview__account">
              {'Last Updated: ' + Utils.DateFormatter(props.userInfo.lastUpdated)}
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default AccountOverviewInfo;
