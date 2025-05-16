import React, { useContext, useEffect, useState } from 'react';

import AuthContext from '../contexts/auth-context';
import UserAPIs from '../APIs/user-apis';
import AccountOverview from '../components/accounts/AccountOverview';
import AccountDetails from '../components/accounts/AccountDetails';
import ReactLoading from 'react-loading';

import { useNavigate } from 'react-router-dom';

import '../styles/AccountPage.css';

const AccountPage = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const [isRequestingUpgrade, setIsRequestingUpgrade] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userUpgradeReq, setUserUpgradeReq] = useState(null);

  const RequestUpgradeAccountHandler = () => {
    setIsRequestingUpgrade(true);
  };

  const AbortRequestUpgradeAccountHandler = () => {
    setIsRequestingUpgrade(false);
  };

  const RequestedUpgradeAccountHandler = (phoneNumber, dateOfBirth, address) => {
    const updatedUserInfo = userInfo;
    updatedUserInfo.phone = phoneNumber;
    updatedUserInfo.birthday = dateOfBirth;
    updatedUserInfo.address = address;
    setUserInfo(updatedUserInfo);
  };

  const TestAcceptUpgradeReqHandler = async () => {
    try {
      const response = await UserAPIs.POSTAcceptRequestUpgrade(authContext.username, authContext.token, {
        upgradeReq: userUpgradeReq,
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getUserInfo = async () => {
      const response = await UserAPIs.GETUserInfoAction(authContext.username, authContext.token);

      if (response != null && response.status === 'success') {
        const data = response.data;
        setUserInfo(data[0]);
      } else {
        console.log("Unexpected error. Can't find user!");
      }
    };

    const getUserUpgradeRequest = async () => {
      const response = await UserAPIs.GETUpgradeRequestByAccount(authContext.username, authContext.token);

      if (response != null && response.status === 'success') {
        const data = response.data;
        setUserUpgradeReq(data[0]);
      } else {
        console.log(response.status);
      }
    };

    if (authContext.isAuthorized != null)
      if (!authContext.isAuthorized) {
        console.log(authContext);
        navigate('/login');
      } else {
        getUserInfo();
        getUserUpgradeRequest();
      }
  }, [authContext, navigate]);

  return (
    <React.Fragment>
      {!userInfo && (
        <div className="account-page__loading">
          <ReactLoading type="spin" width="50px" height="50px" color="#13088e" />
        </div>
      )}
      {userInfo && (
        <div className="account-page bg-white">
          <AccountOverview context={authContext} userInfo={userInfo} />
          <div className="account-page__separator" />
          <AccountDetails
            context={authContext}
            userInfo={userInfo}
            isRequestingUpgrade={isRequestingUpgrade}
            onRequestUpgrade={RequestUpgradeAccountHandler}
          />
        </div>
      )}
    </React.Fragment>
  );
};

export default AccountPage;
