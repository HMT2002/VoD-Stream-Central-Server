import React, { useEffect, useState } from 'react';

import threadAPIs from '../APIs/thread-apis';
import UserAPIs from '../APIs/user-apis';
import ReactLoading from 'react-loading';
import Thread from '../components/threads/Thread';

import { useParams } from 'react-router-dom';
import { SiDropbox } from 'react-icons/si';

const UserPage = () => {
  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState(null);

  const { id } = useParams();

  useEffect(() => {
    const FetchThreads = async (retrievedUser) => {
      try {
        const response = await threadAPIs.fetchThreadsByUserId(id);

        if (response != null && response.status === 'success') {
          const threads = response.data.threads;
          const threadItems = threads.map((thread) => (
            <Thread
              className="thread-grid-item"
              key={threads.indexOf(thread)}
              thread={thread}
              creator={retrievedUser}
            />
          ));
          setThreads(threadItems);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const FetchUser = async () => {
      try {
        const response = await UserAPIs.GETUserByIdAction(id);

        if (response != null && response.status === 'success') {
          setUser(response.data[0]);
          await FetchThreads(response.data[0]);
        }
      } catch (error) {
        console.log(error);
      }
    };

    FetchUser();
  }, [id]);

  return (
    <React.Fragment>
      {!user && (
        <div className="account-page__loading">
          <ReactLoading type="spin" width="50px" height="50px" color="#13088e" />
        </div>
      )}
      {user && (
        <div className="account-page">
          <div className="account-page__overview">
            <div className="account-page__overview__avatar">
              <img src={user.photo.link} alt="Avatar" />
            </div>
            <div>
              <div className="account-page__overview__username">{user.username}</div>
              <div className="account-page__overview__account">{'Email: ' + user.email}</div>
              <div className="account-page__overview__account">{'Role: ' + user.role}</div>
            </div>
          </div>
          <div className="account-page__separator" />
          <div style={{ paddingInline: '12rem' }}>
            <div className="account-page__details__label" style={{ marginBlockStart: '10rem', marginBlockEnd: '2rem' }}>
              Threads
            </div>
            {threads == null && (
              <div className="account-page__loading">
                <ReactLoading type="spin" width="50px" height="50px" color="#13088e" />
              </div>
            )}
            {threads != null && threads.length === 0 && (
              <div className="no-content-tab flex-vertical center-content">
                <SiDropbox className="icon" style={{ marginBlockStart: '4rem' }} />
                <div className="text">User hasn't upload any thread!</div>
              </div>
            )}
            {threads != null && threads.length > 0 && (
              <div
                className="threads-container"
                style={{
                  display: 'grid',
                  gap: '5rem',
                  gridTemplateColumns: 'auto auto auto',
                }}
              >
                {threads}
              </div>
            )}
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default UserPage;
