import React, { useContext, useEffect, useState } from 'react';
import { GETUserInfoAction } from '../APIs/user-apis';

const AuthContext = React.createContext({
  isAuthorized: false,
  username: '',
  avatar: '',
  displayName: '',
  token: '',
  role: '',
  OnUserLogin: (username, avatar, displayName, token, role, isStayLoggedIn) => {},
  OnUserLogout: () => {},
  OnAvatarUpdate: (newAvatar) => {},
  OnDisplayNameUpdate: (newDisplayName) => {},
});

export const AuthContextProvider = (props) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isStayLoggedIn, setIsStayLoggedIn] = useState(null);

  const [username, setUsername] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);

  const UserLoginHandler = (username, avatar, displayName, token, role, isStayLoggedIn) => {
    setIsAuthorized(true);
    setUsername(username);
    setAvatar(avatar);
    setDisplayName(displayName);
    setToken('Bearer ' + token);
    setRole(role);
    setIsStayLoggedIn(isStayLoggedIn);
  };

  const UserLogOutHandler = () => {
    setIsAuthorized(false);
    setIsStayLoggedIn(false);
    setUsername(null);
    setAvatar(null);
    setDisplayName(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('username');
    localStorage.removeItem('token');
  };

  const AvatarUpdateHandler = (newAvatar) => {
    setAvatar(newAvatar);
  };

  const DisplayNameUpdateHandler = (newDisplayName) => {
    setDisplayName(newDisplayName);
  };

  useEffect(() => {
    const RetrieveUserInfoHandler = async (username, token) => {
      try {
        const response = await GETUserInfoAction(username, token);
        if (response.status === 'success') {
          const userInfo = response.data;
          if (userInfo[0] != null) {
            setAvatar(userInfo[0].photo.link);
            setDisplayName(userInfo[0].username);
            setRole(userInfo[0].role);
          }
        } else {
          console.log('Failed to retrieve user info!');
        }
      } catch (error) {
        console.log('Can not retrieve user info. Error: ' + error);
      }
    };

    const localUsername = localStorage.getItem('username');
    const localToken = localStorage.getItem('token');

    if (localUsername != null && !localToken != null) {
      setIsAuthorized(true);
      setIsStayLoggedIn(true);
      setUsername(localUsername);
      setToken(localToken);
      RetrieveUserInfoHandler(localUsername, localToken);
    }
  }, []);

  useEffect(() => {
    if (isStayLoggedIn) {
      localStorage.setItem('username', username);
      localStorage.setItem('token', token);
    }
  }, [isStayLoggedIn, username, token]);

  // console.log("is authorized: " + isAuthorized);
  // console.log("local username: " + username);
  // console.log("local avatar: " + avatar);
  // console.log("local display name: " + displayName);
  // console.log("local token: " + token);
  // console.log("local role: " + role);

  return (
    <AuthContext.Provider
      value={{
        isAuthorized: isAuthorized,
        username: username,
        avatar: avatar,
        displayName: displayName,
        token: token,
        role: role,
        OnUserLogin: UserLoginHandler,
        OnUserLogout: UserLogOutHandler,
        OnAvatarUpdate: AvatarUpdateHandler,
        OnDisplayNameUpdate: DisplayNameUpdateHandler,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
export const useAuth = () => {
  return useContext(AuthContext);
};
