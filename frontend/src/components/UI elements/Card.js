import React from "react";

import "../../styles/Card.css";

const Card = (props) => {
    const classes = "card " + props.className;

    return (<div className={classes}>{props.children}</div>);
}

export default Card;