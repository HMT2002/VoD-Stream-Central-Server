import React, { useContext } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { IoLogInOutline, IoLogOut, IoMenu } from 'react-icons/io5';
import { RiUserAddFill } from 'react-icons/ri';

import Button from '../UI elements/Button';
import SearchBar from './SearchBar';
import AuthContext from '../../contexts/auth-context';

import '../../styles/Header.css';

const Header = (props) => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const LogoutHandler = () => {
    authContext.OnUserLogout();
    navigate('/');
  };

  const handleSidebarClick = () => {
    props.handleClick(!props.openState);
  };

  return (
    <React.Fragment>
      <div className="app-header">
        <div className="app-header__container">
          <Button
            onClick={handleSidebarClick}
            className="app-header__burger-menu__button"
            icon={<IoMenu className="app-header__burger-menu__button icon" />}
          />
          <Link className="app-header__logo" to="/">
            Logo
          </Link>
          <SearchBar />
          {/*Unauthorized*/}
          {!authContext.isAuthorized && (
            <React.Fragment>
              <Link className="app-header__unauthorized login" to="/login">
                <IoLogInOutline className="app-header__unauthorized__icon login" />
                Login
              </Link>
              <Link className="app-header__unauthorized register" to="/create-new-account">
                <RiUserAddFill className="app-header__unauthorized__icon register" />
                Register
              </Link>
            </React.Fragment>
          )}
          {/*Authorized*/}
          {authContext.isAuthorized && (
            <React.Fragment>
              <Link to={`/account/${authContext.username}`}>
                <img
                  className="app-header__authorized-avatar"
                  // src="https://aniyuki.com/wp-content/uploads/2022/03/aniyuki-cute-anime-avatar-profile-picture-14.jpg"
                  src={authContext.avatar}
                  alt="avatar"
                />
              </Link>
              <Button
                className="app-header__authorized-logout"
                onClick={LogoutHandler}
                icon={<IoLogOut className="app-header__authorized-logout icon" />}
                content="Logout"
              />
            </React.Fragment>
          )}
        </div>
      </div>
      {props.children}
    </React.Fragment>
  );
};

export default Header;
