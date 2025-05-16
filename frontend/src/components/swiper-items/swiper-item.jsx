import React from 'react';

const SwiperItems = (props) => {
  return (
    <div
      onClick={() => {
        props.onclick(props.episode);
      }}
    >
      {/* <img src="#" /> */}
      <div className="text-unactive text-sm hover:cursor-pointer leading-7">
        <div className="bg-black w-40 h-24"></div>
        <div>
          {props.episode !== null ? <p>{props.episode.videoname}</p> : <p>Episode 1</p>}
          {props.episode !== null ? <p className="text-active text-md">{props.episode.title}</p> : <p>Episode 1</p>}
        </div>
      </div>
    </div>
  );
};

export default SwiperItems;
