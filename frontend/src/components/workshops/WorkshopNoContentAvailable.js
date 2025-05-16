import React from "react";

import Button from "../UI elements/Button";

import { SiDropbox } from "react-icons/si";
import { useNavigate } from "react-router-dom";

const WorkshopNoContentAvailable = (props) => {
    const navigate = useNavigate();

    const NavigateToCreateThreadTabHandler = () => {
        navigate(`/workshop/create/thread/${props.account}`);
    }
    return (
        <React.Fragment>
            <div className="no-content-tab">
                <SiDropbox className="icon" />
                <div className="text">No {props.type} available!</div>
                <Button className="redirect-btn" content="New Thread" onClick={NavigateToCreateThreadTabHandler} />
            </div>
        </React.Fragment>
    );
};

export default WorkshopNoContentAvailable;