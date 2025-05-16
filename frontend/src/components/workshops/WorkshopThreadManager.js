import React, { useEffect, useState } from 'react';

import ThreadManageList from '../threads/ThreadManageList';
import ReactLoading from 'react-loading';

import { deleteThread } from '../../APIs/thread-apis';
import { fetchAllThreadsByUser } from '../../APIs/thread-apis';

const WorkshopThreadManager = (props) => {
  const [threads, setThreads] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const UIThreadDeleteHandler = (thread) => {
    const threadIndex = threads.indexOf(thread);
    let newThreads = threads.map((x) => x);
    newThreads.splice(threadIndex, 1);
    setThreads(newThreads);
  };

  const ThreadDeleteHandler = async (deletedThread) => {
    try {
      const payload = { thread: deletedThread };
      const response = await deleteThread(props.context.token, payload);

      if (response != null && response.status === 'success delete') {
        alert('Thread deleted!');
        UIThreadDeleteHandler(deletedThread);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const FetchThreadsCreatedByUser = async () => {
      try {
        const response = await fetchAllThreadsByUser(props.context.username, props.context.token);

        if (response != null && response.status === 'success') {
          setThreads(response.data.threads);
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    };

    FetchThreadsCreatedByUser();
  }, [props.context]);

  return (
    <React.Fragment>
      <div className="workshop-page__tab">
        <div className="workshop-page__title">Threads</div>
        {isLoading && (
          <div className="flex center-content" style={{ height: '100%' }}>
            <ReactLoading type="spin" width="50px" height="50px" color="#13088e" />
          </div>
        )}
        {!isLoading && (
          <ThreadManageList context={props.context} threads={threads} onDeleteThread={ThreadDeleteHandler} />
        )}
      </div>
    </React.Fragment>
  );
};

export default WorkshopThreadManager;
