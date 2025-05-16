import React from 'react';

import ThreadList from '../threads/ThreadList';

import '../../styles/Section.css';
import { Link } from 'react-router-dom';

const Section = (props) => {
  return (
    <div className="tag-section">
      <h1 className="tag-section__label"># {props.tag}</h1>
      <ThreadList threads={props.threadsByTag} />
      <Link style={{ marginInlineStart: 'auto', marginInlineEnd: '1rem' }} to={`/tag/${props.tag}`}>
        {'More>>>'}
      </Link>
      <div className="tag-section__separator" />
    </div>
  );
};

export default Section;
