import React from 'react';
import logo from '../../assets/img/ben10.jpg';
import Button from '../UI elements/Button';
import { Link, useNavigate } from 'react-router-dom';

const MovieItem = (props) => {
  const video = props.video;
  return (
    <div className="shadow-lg hover:shadow-2xl text-sm gap-2 mx-2 flex flex-col bg-white rounded-sm">
      <div className="">
        <img src={video.img != null ? video.img : './logo'} alt="video-image" />
      </div>
      <div className="flex flex-col justify-between px-3 flex-auto">
        <div className=" bg-white flex flex-col justify-stretch">
          <div className="flex items-start">
            <p className="mr-5">{video.release_date != null ? video.release_date : '2023'}</p>
            <p>{video.type != null ? video.type : 'Movie'}</p>
          </div>
          <p className="font-semibold ">{video.title != null ? video.title : 'Ben 10: Alien Force'}</p>
        </div>
        <Button className="bg-red-400 w-full rounded-sm py-1 mb-2 mx-auto">
          <Link className="login-form__forget-password" to={`/video/${video.id}`}>
            Watch now
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default MovieItem;
