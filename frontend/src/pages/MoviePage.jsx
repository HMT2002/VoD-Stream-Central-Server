import React, { useEffect, useState, useCallback } from 'react';

import SectionList from '../components/sections/SectionList';
import ReactLoading from 'react-loading';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';

// import required modules
import { Pagination } from 'swiper/modules';

import { fetchAllInfo } from '../APIs/thread-apis';
import axios from 'axios';
import SwiperEspisode from '../components/swiper-espisode/swiper-espisode';
import SwiperItems from '../components/swiper-items/swiper-item';
import SwiperSection from '../components/swiper-items/swiper-section';

const MoviePage = () => {
  const tags = [
    // "Popular",
    'Trending',
    'Latest Movies',
    'Latest TV Shows',
    'Coming Soon',
  ];

  const [threads, setThreads] = useState([]); // all threads in loaded in homepage

  const fetchThreadsHandler = useCallback(async () => {
    try {
      const response = await fetchAllInfo();
      if (response.status === 200) {
        console.log(response.data);
        setThreads(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  // load all threads for the first time access homepage
  // should change to load a set (10-15) of newest threads for #Popular secion
  useEffect(() => {
    fetchThreadsHandler();
  }, [fetchThreadsHandler]);

  return (
    <React.Fragment>
      {threads.length === 0 ? (
        <div className="account-page__loading">
          <ReactLoading type="spin" width="50px" height="50px" color="#13088e" />
        </div>
      ) : (
        <div className="w-full bg-white ">
          <Swiper
            spaceBetween={0}
            slidesPerView={1}
            onSlideChange={() => console.log('slide change')}
            onSwiper={(swiper) => console.log(swiper)}
            className="max-w-7xl min-h-max w-full"
            pagination={{
              dynamicBullets: true,
            }}
            modules={[Pagination]}
          >
            <SwiperSlide className="">
              <SwiperSection />
            </SwiperSlide>
            <SwiperSlide className="">
              <SwiperSection />
            </SwiperSlide>
            <SwiperSlide className="">
              <SwiperSection />
            </SwiperSlide>
            <SwiperSlide className="">
              <SwiperSection />
            </SwiperSlide>
          </Swiper>

          <SectionList labels={tags} threads={threads} />
        </div>
      )}
      {/* {threads.length === 0 && (
        <div className="account-page__loading">
          <ReactLoading type="spin" width="50px" height="50px" color="#13088e" />
        </div>
      )}
      {threads.length > 0 && <SectionList labels={tags} threads={threads} />} */}
    </React.Fragment>
  );
};

export default MoviePage;
