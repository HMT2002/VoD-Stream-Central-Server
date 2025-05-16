import React, { useEffect, useState } from 'react';

import threadAPIs from '../APIs/thread-apis';
import Thread from '../components/threads/Thread';
import ReactLoading from 'react-loading';

import { useParams } from 'react-router-dom';

import '../styles/TagPage.css';

const TagPage = () => {
  const [threads, setThreads] = useState([]);

  const { tag } = useParams();

  useEffect(() => {
    const FetchThreadsByTag = async () => {
      try {
        const response = await threadAPIs.fetchThreadsByTag(tag);

        if (response != null && response.status === 'success') {
          const threads = response.data.threads;
          const threadItems = threads.map((thread) => (
            <Thread className="thread-grid-item" key={threads.indexOf(thread)} thread={thread} />
          ));
          setThreads(threadItems);
        }
      } catch (error) {
        console.log(error);
      }
    };

    FetchThreadsByTag();
  }, [tag]);

  return (
    <React.Fragment>
      <div className="tag-page">
        <div className="workshop-page__title">{`# ${tag}`}</div>
        {threads.length === 0 && (
          <div className="account-page__loading">
            <ReactLoading type="spin" width="50px" height="50px" color="#13088e" />
          </div>
        )}
        {threads.length > 0 && <div className="threads-container">{threads}</div>}
      </div>
    </React.Fragment>
  );
};

export default TagPage;
