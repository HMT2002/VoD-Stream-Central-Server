import React from "react";

import ThreadManage from "./ThreadManage";
import WorkshopNoContentAvailable from "../workshops/WorkshopNoContentAvailable";

const ThreadManageList = ({ threads, onDeleteThread, context }) => {
    const threadList = threads.map((thread) => (
        <ThreadManage
            key={threads.indexOf(thread)}
            thread={thread}
            onDelete={onDeleteThread} />
    ));

    return (
        <React.Fragment>
            {threadList.length === 0 && <WorkshopNoContentAvailable account={context.username} type="thread" />}
            {threadList.length > 0 && <div>{threadList}</div>}
        </React.Fragment>
    );
};

export default ThreadManageList;