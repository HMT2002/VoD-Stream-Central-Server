import React from 'react';

import Section from './Section';
import MovieItem from '../movieItem/MovieItem.jsx';
import { videoItem } from '../movieItem/movieItem.js';

const SectionList = (props) => {
  console.log(props);
  const sections = props.labels.map((label) => {
    let threadsPerTag = [];
    props.threads.map((thread) => {
      if (thread.tag === label) threadsPerTag = [...threadsPerTag, thread];
      return thread;
    });
    return <Section key={props.labels.indexOf(label).toString()} tag={label} threadsByTag={threadsPerTag} />;
  });

  const videoSections = props.threads.map((thread) => {
    let video = new videoItem(
      thread.filmInfo.name,
      thread.filmInfo.first_air_date,
      thread.filmInfo.poster_path,
      thread.filmType,
      thread._id
    );

    return <MovieItem video={video} info={thread} />;
  });

  return (
    <React.Fragment>
      <ul className=" mt-10 grid mx-auto gap-5 grid-cols-2 md:grid-cols-4 lg:grid-cols-6  max-w-7xl">
        {videoSections}
      </ul>
    </React.Fragment>
  );
};

export default SectionList;
