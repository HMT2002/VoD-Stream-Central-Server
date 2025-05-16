import React, { useEffect, useState } from 'react';

import Input from '../UI elements/Input';
import Button from '../UI elements/Button';
import UserAPIs from '../../APIs/user-apis';

const PasswordValidator = (password) => {
  return password.trim().length >= 6;
};

const PassConfirmValidator = (passConfirm, password) => {
  return passConfirm.trim() === password.trim();
};

const EmailValidator = (email) => {
  return (
    email
      .trim()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      ) !== null && email.trim().length > 0
  );
};

const AccountDetails = (props) => {
  const initialDisplayName = props.userInfo.username != null ? props.userInfo.username : '';
  const initialEmail = props.userInfo.email != null ? props.userInfo.email : '';

  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [isUserInfoChanged, setIsUserInfoChanged] = useState(false);

  const [isCorrectOldPassword, setIsCorrectOldPassword] = useState(true);
  const [isValidOldPassword, setIsValidOldPassword] = useState(true);
  const [isValidNewPassword, setIsValidNewPassword] = useState(true);
  const [isNewPasswordMatched, setIsNewPasswordMatched] = useState(true);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [isValidDisplayName, setIsValidDisplayName] = useState(true);
  const [isValidEmail, setIsValidEmail] = useState(true);

  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [email, setEmail] = useState(initialEmail);

  const [photo, setPhoto] = useState(props.userInfo.photo);

  const OldPasswordChangedHandler = (event) => {
    setOldPassword(event.target.value);
    setIsCorrectOldPassword(true);
  };

  const OldPasswordBlurHandler = () => {
    const isValid = PasswordValidator(oldPassword);
    setIsValidOldPassword(isValid);
  };

  const NewPasswordChangedHandler = (event) => {
    setNewPassword(event.target.value);
  };

  const NewPasswordBlurHandler = () => {
    const isValid = PasswordValidator(newPassword);
    setIsValidNewPassword(isValid);
  };

  const PasswordConfirmChangedHandler = (event) => {
    setPasswordConfirm(event.target.value);
  };

  const PasswordConfirmBlurHandler = (event) => {
    const isValid = PassConfirmValidator(newPassword, passwordConfirm);
    setIsNewPasswordMatched(isValid);
  };

  const ChangePasswordBtnClickedHandler = () => {
    setIsPasswordChanging((prev) => !prev);
  };

  const DisplayNameChangeHandler = (event) => {
    const newDisplayName = event.target.value;
    const isValid = newDisplayName.trim().length > 0;
    setIsValidDisplayName(isValid);
    setDisplayName(newDisplayName);
  };

  const EmailChangedHandler = (event) => {
    const newEmail = event.target.value;
    const isValid = EmailValidator(newEmail);
    setIsValidEmail(isValid);
    setEmail(newEmail);
  };

  const RequestUpgradeHandler = () => {
    props.onRequestUpgrade();
  };

  const UpdatePasswordHandler = async () => {
    try {
      const userUpdatePayload = { oldPassword: oldPassword, password: newPassword };
      const response = await UserAPIs.POSTUpdateUserInfo(
        props.context.username,
        props.context.token,
        userUpdatePayload
      );

      console.log(response);

      if (response != null && response.status === 'incorrect old password') {
        setIsCorrectOldPassword(false);
        return;
      } else if (response != null && response.status === 'success') {
        alert('Successfully update user password!');
        ChangePasswordBtnClickedHandler();
      } else {
        alert('Unexpected error. Failed to update user password!');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const UpdateUserInfoHandler = async () => {
    try {
      const userUpdatePayload = { username: displayName, email: email, photo: photo };
      const response = await UserAPIs.POSTUpdateUserInfo(
        props.context.username,
        props.context.token,
        userUpdatePayload
      );

      if (response != null && response.status === 'success') {
        props.context.OnDisplayNameUpdate(displayName);
        alert('Successfully updated user info!');
      } else {
        alert('Unexpected error. Failed to update user info!');
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!isPasswordChanging) {
      setIsCorrectOldPassword(true);
      setIsValidOldPassword(true);
      setIsValidNewPassword(true);
      setIsNewPasswordMatched(true);
      setOldPassword('');
      setNewPassword('');
      setPasswordConfirm('');
    }
  }, [isPasswordChanging]);

  useEffect(() => {
    const isInfoChanged = displayName !== initialDisplayName || email !== initialEmail;
    setIsUserInfoChanged(isInfoChanged);
  }, [displayName, email, initialDisplayName, initialEmail]);

  return (
    <React.Fragment>
      {props.userInfo != null && (
        <div className="flex justify-between w-3/5 mx-auto">
          <div className="flex-1 w-max" style={{ marginBlockEnd: '2rem' }}>
            <div className="account-page__details__label w-max">Account</div>
            <div className="">
              <Input
                className="account-page__details__input w-max"
                // style={{ alignSelf: 'flex-start', width: '320px' }}
                label="Username"
                defaultValue={props.userInfo.account}
                disabled
              />
              {!isPasswordChanging && (
                <Input
                  className="account-page__details__input w-max"
                  //   style={{ width: '320px' }}
                  label="Password"
                  type="password"
                  value="********"
                  disabled
                />
              )}
              {isPasswordChanging && (
                <div>
                  <div className="account-page__details__row" style={{ paddingInline: '0rem' }}>
                    <Input
                      className="account-page__details__input w-max"
                      //   style={{ width: '320px' }}
                      type="password"
                      label="Old Password"
                      value={oldPassword}
                      onChange={OldPasswordChangedHandler}
                      onBlur={OldPasswordBlurHandler}
                      passwordToggle="true"
                      isValid={isValidOldPassword}
                      helperText="Password must be 6 characters or above!"
                    />
                  </div>
                  <div className="account-page__details__row" style={{ paddingInline: '0rem' }}>
                    <Input
                      className="account-page__details__input w-max"
                      //   style={{ width: '320px' }}
                      type="password"
                      label="New Password"
                      value={newPassword}
                      onChange={NewPasswordChangedHandler}
                      onBlur={NewPasswordBlurHandler}
                      passwordToggle="true"
                      isValid={isValidNewPassword}
                      helperText="Password must be 6 characters or above!"
                    />
                  </div>
                  <div className="account-page__details__row" style={{ paddingInline: '0rem' }}>
                    <Input
                      className="account-page__details__input w-max"
                      //   style={{ width: '320px' }}
                      type="password"
                      label="Confirm Password"
                      value={passwordConfirm}
                      onChange={PasswordConfirmChangedHandler}
                      onBlur={PasswordConfirmBlurHandler}
                      passwordToggle="true"
                      isValid={isNewPasswordMatched}
                      helperText="Password unmatched!"
                    />
                  </div>
                  {!isCorrectOldPassword && (
                    <div className="register-form__message" style={{ marginInlineStart: '2rem' }}>
                      Incorrect old password
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="account-page__details__row" style={{ justifyContent: 'flex-start' }}>
              <Button
                className="account-page__button"
                style={{ marginBlockStart: '0.7rem' }}
                content={!isPasswordChanging ? 'Change Password' : 'Save Password'}
                onClick={!isPasswordChanging ? ChangePasswordBtnClickedHandler : UpdatePasswordHandler}
              />
              {isPasswordChanging && (
                <Button
                  className="account-page__button"
                  style={{ marginBlockStart: '0.7rem', marginInlineStart: '1rem' }}
                  content="Cancel"
                  onClick={ChangePasswordBtnClickedHandler}
                />
              )}
            </div>
          </div>
          <div className="flex-1" style={{ marginBlockEnd: '2rem' }}>
            <div className="account-page__details__label">Basic Info</div>
            <div className="">
              <Input
                className="account-page__details__input"
                label="Display Name"
                value={displayName}
                onChange={DisplayNameChangeHandler}
                isValid={isValidDisplayName}
                helperText="Display name must not be empty!"
              />
            </div>
            <div className="account-page__details__row">
              <Input
                className="account-page__details__input"
                label="Email"
                value={email}
                onChange={EmailChangedHandler}
                isValid={isValidEmail}
                helperText="Invalid email!"
              />
            </div>
            <div className="account-page__details__row" style={{ justifyContent: 'flex-start' }}>
              <Button
                className="account-page__button"
                style={{ marginBlockStart: '0.7rem' }}
                content="Save"
                disabled={!(isUserInfoChanged && isValidDisplayName && isValidEmail)}
                onClick={UpdateUserInfoHandler}
              />
              {/* {props.context.role !== 'content-creator' && !props.isRequestingUpgrade && (
                <Button
                  className="account-page__button"
                  style={{ marginBlockStart: '0.7rem', marginInlineStart: '1rem' }}
                  content="Upgrade"
                  onClick={RequestUpgradeHandler}
                />
              )} */}
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default AccountDetails;
