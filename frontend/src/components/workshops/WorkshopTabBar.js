import React from "react";

import { Link } from "react-router-dom";
import { SiAddthis } from "react-icons/si";

const WorkshopTabBarItem = (props) => {
    return (
        <React.Fragment>
            <Link className={props.className} to={props.route}>
                {props.icon}
                {props.content}
            </Link>
        </React.Fragment>
    );
}

const WorkshopTabBar = (props) => {
    return (
        <React.Fragment>
            <div className="workshop-page__tab-bar">
                <WorkshopTabBarItem
                    itemIndex={4}
                    className="workshop-page__tab-bar__new-thread-btn"
                    icon={<SiAddthis className="workshop-page__tab-bar__new-thread-icon" />}
                    content="NEW THREAD"
                    route={`/workshop/create/thread/${props.context.username}`} />
                {/* <WorkshopTabBarItem
                    itemIndex={1}
                    className="workshop-page__tab-bar__item"
                    content="Dashboard"
                    route={`/workshop/dashboard/${props.context.username}`} /> */}
                <WorkshopTabBarItem
                    itemIndex={2}
                    className="workshop-page__tab-bar__item"
                    content="Threads"
                    route={`/workshop/threads/${props.context.username}`} />
                <WorkshopTabBarItem
                    itemIndex={3}
                    className="workshop-page__tab-bar__item"
                    content="Comments"
                    route={`/workshop/comments/${props.context.username}`} />
            </div>
        </React.Fragment>
    );
}

export default WorkshopTabBar;