import React, { useContext, useRef, useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { RegisterAction } from '../APIs/auth-apis';

import AuthContext from '../contexts/auth-context';

import Card from '../components/UI elements/Card';
import Input from '../components/UI elements/Input';
import Button from '../components/UI elements/Button';

import '../styles/RegisterPage.css';

//#region helpers
const UsernameValidator = (username) => {
  return username.trim().length > 0;
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

const PasswordValidator = (password) => {
  return password.trim().length >= 6;
};

const PassConfirmValidator = (passConfirm, password) => {
  return passConfirm.trim() === password.trim();
};
//#endregion

const RegisterPage = () => {
  const authContext = useContext(AuthContext);

  const navigate = useNavigate();

  const [registerMessage, setResisterMessage] = useState('');

  const [usernameValidation, setUsernameValidation] = useState(null);
  const [displayNameValidation, setDisplayNameValidation] = useState(null);
  const [emailValidation, setEmailValidation] = useState(null);
  const [passwordValidation, setPasswordValidation] = useState(null);
  const [passConfirmValidation, setPassConfirmValidation] = useState(null);

  const usernameRef = useRef();
  const displayNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const passConfirmRef = useRef();

  //#region input change handlers
  const UsernameInputChangeHandler = () => {
    setUsernameValidation(null);
    setResisterMessage('');
  };

  const DisplayNameInputChangeHandler = () => {
    setDisplayNameValidation(null);
    setResisterMessage('');
  };

  const EmailInputChangeHandler = () => {
    setEmailValidation(null);
    setResisterMessage('');
  };

  const PasswordInputChangeHandler = () => {
    setPasswordValidation(null);
    setResisterMessage('');
  };

  const PassConfirmChangeHandler = () => {
    setPassConfirmValidation(null);
    setResisterMessage('');
  };
  //#endregion

  //#region input blur handlers
  const UsernameInputBlurHandler = () => {
    const inputValue = usernameRef.current.getValue();
    setUsernameValidation(UsernameValidator(inputValue));
  };

  const DisplayNameInputBlurHandler = () => {
    const inputValue = displayNameRef.current.getValue();
    setDisplayNameValidation(UsernameValidator(inputValue));
  };

  const EmailInputBlurHandler = () => {
    const inputValue = emailRef.current.getValue();
    setEmailValidation(EmailValidator(inputValue));
  };

  const PasswordInputBlurHandler = () => {
    const inputValue = passwordRef.current.getValue();
    setPasswordValidation(PasswordValidator(inputValue));
  };

  const PassConfirmBlurHandler = () => {
    const passConfirmValue = passConfirmRef.current.getValue();
    const passValue = passwordRef.current.getValue();
    setPassConfirmValidation(PassConfirmValidator(passConfirmValue, passValue));
  };
  //#endregion

  //#region on submit handlers
  const RegisterSubmitHandler = (event) => {
    event.preventDefault();

    const usernameInput = usernameRef.current.getValue();
    const displayNameInput = displayNameRef.current.getValue();
    const emailInput = emailRef.current.getValue();
    const passwordInput = passwordRef.current.getValue();
    const passConfirmInput = passConfirmRef.current.getValue();

    const isValidUsername = UsernameValidator(usernameInput);
    const isValidDisplayName = UsernameValidator(displayNameInput);
    const isValidEmail = EmailValidator(emailInput);
    const isValidPassword = PasswordValidator(passwordInput);
    const isValidPassConfirm = PassConfirmValidator(passConfirmInput, passwordInput);

    if (isValidUsername && isValidDisplayName && isValidEmail && isValidPassword && isValidPassConfirm) {
      UserRegisterHandler(usernameInput, displayNameInput, emailInput, passwordInput, passConfirmInput);
    } else if (!isValidUsername) {
      setUsernameValidation(false);
    } else if (!isValidDisplayName) {
      setDisplayNameValidation(false);
    } else if (!isValidEmail) {
      setEmailValidation(false);
    } else if (!isValidPassword) {
      setPasswordValidation(false);
    } else {
      setPassConfirmValidation(false);
    }
  };

  const UserRegisterHandler = async (username, displayNameInput, email, password, passConfirm) => {
    const registedData = {
      account: username.trim(),
      username: displayNameInput.trim(),
      email: email.trim(),
      password: password.trim(),
      passwordConfirm: passConfirm.trim(),
      role: 'user',
    };

    const response = await RegisterAction(registedData);

    console.log(response);
    if (response != null && response.status === 'success create new user') {
      authContext.OnUserLogin(
        response.data.account,
        response.data.avatar,
        response.data.username,
        response.data.token,
        response.data.role,
        true
      );
      navigate('/');
    } else if (response.status === 'fail') {
      setResisterMessage('Existed account!');
    }
  };
  //#endregion

  if (authContext.isLoggedIn) return navigate('/');

  return (
    <div className="flex flex-col bg-white">
      <Link
        className="app-header__logo m-5 w-full"
        style={{
          // top: 50,
          // left: 100,
          fontSize: '2.5rem',
          fontWeight: 800,
        }}
        to="/"
      >
        Logo
      </Link>
      <Card className="w-4/5 mx-auto p-5 max-w-md min-w-max">
        <form onSubmit={RegisterSubmitHandler}>
          <h1 className="register-form__title">Create New Account</h1>
          {registerMessage !== '' && <div className="register-form__message">{registerMessage}</div>}
          <Input
            ref={usernameRef}
            className="register-form__input"
            label="Username"
            variant="standard"
            onChange={UsernameInputChangeHandler}
            onBlur={UsernameInputBlurHandler}
            isValid={usernameValidation !== false}
            helperText={'Username must not be empty!'}
          />
          <Input
            ref={displayNameRef}
            className="register-form__input"
            label="Display Name"
            variant="standard"
            onChange={DisplayNameInputChangeHandler}
            onBlur={DisplayNameInputBlurHandler}
            isValid={displayNameValidation !== false}
            helperText={'Display name must not be empty!'}
          />
          <Input
            ref={emailRef}
            className="register-form__input"
            label="Email"
            variant="standard"
            onChange={EmailInputChangeHandler}
            onBlur={EmailInputBlurHandler}
            isValid={emailValidation !== false}
            helperText={'Invalid email!'}
          />
          <Input
            ref={passwordRef}
            className="register-form__input"
            label="Password"
            variant="standard"
            type="password"
            passwordToggle="true"
            onChange={PasswordInputChangeHandler}
            onBlur={PasswordInputBlurHandler}
            isValid={passwordValidation !== false}
            helperText={'Password must be 6 characters or above!'}
          />
          <Input
            ref={passConfirmRef}
            className="register-form__input"
            label="Password Confirm"
            variant="standard"
            type="password"
            passwordToggle="true"
            onChange={PassConfirmChangeHandler}
            onBlur={PassConfirmBlurHandler}
            isValid={passConfirmValidation !== false}
            helperText={'Password unmatched!'}
          />
          <div className="register-form__login-redirect" to="/">
            <div>Already have account?</div>
            <Link className="text-red-400" to="/login">
              Login here
            </Link>
          </div>
          <Button className="register-form__button bg-red-400 w-full" type="submit" content="REGISTER" />
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;
