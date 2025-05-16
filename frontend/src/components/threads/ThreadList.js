import React, { useRef } from "react";

import Thread from "./Thread";

import "../../styles/ThreadList.css";

const ThreadList = (props) => {
    const listRef = useRef();

    const threads = props.threads.map((thread) => (
        <Thread className="thread-list item" key={props.threads.indexOf(thread)} thread={thread} />
    ));

    const onScroll = (event) => {
        event.preventDefault();
        const scale = 1.85;
        listRef.current.scrollLeft += event.deltaY * scale;
    }

    const MouseEnterHandler = () => {
        listRef.current.addEventListener("wheel", onScroll);
    }

    const MouseLeaveHandler = () => {
        listRef.current.removeEventListener("wheel", onScroll);
    }

    return (
        <div className="thread-list wrapper"
            ref={listRef}
            onMouseEnter={MouseEnterHandler}
            onMouseLeave={MouseLeaveHandler}>
            {threads}
        </div>
    );
};

export default ThreadList;