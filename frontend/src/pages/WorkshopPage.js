import React, { useContext, useEffect, useState } from 'react';

import AuthContext from '../contexts/auth-context';
import WorkshopTabBar from '../components/workshops/WorkshopTabBar';
// import WorkshopDashBoard from "../components/workshops/WorkshopDashboard";
import WorkshopThreadManager from '../components/workshops/WorkshopThreadManager';
import WorkshopCommentManager from '../components/workshops/WorkshopCommentManager';
import WorkshopCreateThread from '../components/workshops/WorkshopCreateThread';
import WorkshopEditThread from '../components/workshops/WorkshopEditThread';
import ReactLoading from 'react-loading';

import { useLocation, matchPath } from 'react-router-dom';

import '../styles/WorkshopPage.css';

const WorkshopPage = () => {
  const workshopPagePathPatterns = [
    '/workshop/:username',
    '/workshop/dashboard/:username',
    '/workshop/threads/:username',
    '/workshop/comments/:username',
    '/workshop/create/thread/:username',
    '/workshop/edit/thread/:slug',
  ];

  const initialTabIndex = 0;

  const authContext = useContext(AuthContext);

  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(initialTabIndex);

  workshopPagePathPatterns.forEach((pattern) => {
    const index = workshopPagePathPatterns.indexOf(pattern);
    if (matchPath(pattern, location.pathname) && currentTab !== index) setCurrentTab(index);
  });

  useEffect(() => {
    if (authContext.isAuthorized != null) setIsLoading(false);
  }, [authContext]);

  return (
    <React.Fragment>
      {isLoading && (
        <div className="account-page__loading">
          <ReactLoading type="spin" width="50px" height="50px" color="#13088e" />
        </div>
      )}
      {!isLoading && (
        <div className="workshop-page">
          {/* {(currentTab === 0 || currentTab === 1) && <WorkshopDashBoard context={authContext} />} */}
          {(currentTab === 0 || currentTab === 2) && <WorkshopThreadManager context={authContext} />}
          {currentTab === 3 && <WorkshopCommentManager context={authContext} />}
          {currentTab === 4 && <WorkshopCreateThread context={authContext} />}
          {currentTab === 5 && <WorkshopEditThread context={authContext} />}
          <WorkshopTabBar context={authContext} />
        </div>
      )}
    </React.Fragment>
  );
};

export default WorkshopPage;
