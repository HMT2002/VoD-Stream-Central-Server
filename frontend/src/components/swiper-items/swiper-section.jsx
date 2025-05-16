import React from 'react';
import logo from '../../assets/img/ben10.jpg';
import Button from '../UI elements/Button';
import { Link, useNavigate } from 'react-router-dom';

const SwiperSection = () => {
  return (
    <div>
      {/* <img src="#" /> */}
      <div className="text-white w-full h-[400px] bg-black flex p-5 px-10">
        <div className="flex flex-1 justify-center flex-col items-start">
          <div className=" w-max">
            <h1 className=" text-[40px] font-bold">Ben 10: Alien Force</h1>
            <div className="flex justify-between max-w-max gap-2">
              <p className="px-2 rounded-md text-gray-500 border-gray-500 border-2 border-solid">PG-13</p>
              <p className="px-2 rounded-md text-gray-500 border-gray-500 border-2 border-solid">HD</p>
              <p className="px-2 rounded-md text-gray-500 border-gray-500 border-2 border-solid">CC</p>
              <p className="px-2 text-gray-500">Oct 01, 2023</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-5">
            Five years later, 15-year-old Ben Tennyson chooses to once again put on the OMNITRIX and discovers that it
            has reconfigured his DNA and can now transform him into 10 brand new aliens. Joined by his super-powered
            cousin Gwen Tennyson and his equally powerful former enemy Kevin Levin, Ben is on a mission to find his
            missing Grandpa .....
          </p>
          <div className=" self-start my-10">
            <Button className="bg-red-400 w-max rounded-md py-2 px-7 text-lg">
              <Link className="login-form__forget-password uppercase" to="/video-demo/eva_ep26">
                play now
              </Link>
            </Button>
          </div>
        </div>
        <div className="">
          <img src={logo} alt="banner-for-swiper" />
        </div>
      </div>
    </div>
  );
};

export default SwiperSection;
