import React from 'react';

import '../../styles/Button.css';

const Button = (props) => {
  const classes = 'button ' + props.className;
  return (
    <button
      className={`${classes}`}
      style={props.style}
      onClick={props.onClick}
      type={props.type}
      autoFocus={props.autoFocus}
      disabled={props.disabled}
    >
      {props.icon}
      {props.content}
      {props.children}
    </button>
  );
};

export default Button;
