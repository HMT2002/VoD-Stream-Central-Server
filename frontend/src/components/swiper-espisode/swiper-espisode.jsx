import React, { useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import SwiperItems from '../swiper-items/swiper-item';

const SwiperEspisode = (props) => {
  console.log(props.episodes);
  const onclick = useCallback((video) => {
    props.onclick(video);
  });
  return (
    <Swiper
      spaceBetween={50}
      slidesPerView={3}
      onSlideChange={() => console.log('slide change')}
      onSwiper={(swiper) => console.log(swiper)}
      className=" py-6 text-[#777777]"
    >
      {props.episodes.map((episode) => {
        return (
          <SwiperSlide className=" max-w-fit">
            <SwiperItems episode={episode} onclick={onclick} />
          </SwiperSlide>
        );
      })}
      {/* <SwiperSlide className=" max-w-fit">
        <SwiperItems />
      </SwiperSlide>
      <SwiperSlide className=" max-w-fit">
        <SwiperItems />
      </SwiperSlide>
      <SwiperSlide className=" max-w-fit">
        <SwiperItems />
      </SwiperSlide>
      <SwiperSlide className=" max-w-fit">
        <SwiperItems />
      </SwiperSlide>
      <SwiperSlide className=" max-w-fit">
        <SwiperItems />
      </SwiperSlide>
      <SwiperSlide className=" max-w-fit">
        <SwiperItems />
      </SwiperSlide>
      <SwiperSlide className=" max-w-fit">
        <SwiperItems />
      </SwiperSlide> */}
    </Swiper>
  );
};

export default SwiperEspisode;
