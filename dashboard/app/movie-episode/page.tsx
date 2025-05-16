'use client';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
// import Map from "../Maps/TestMap";
import { Server } from '../../types/server';
import { Movie } from '../../types/movie';

// without this the component renders on server and throws an error
import dynamic from 'next/dynamic';
import TableOne from '../../components/Tables/TableOne';
import TableFive from '../../components/Tables/TableFive';
import ServerModal from '../../components/SelectDropdown/SelectDropdown';
import { Button } from '../../components/Button/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogOverlay,
} from '../../components/Dialog/Dialog';
import { Video } from '../../types/video';
import { fetchAllInfo } from '../../APIs/transfer-apis';
import MovieItem from '../../components/movieItem/MovieItem';
import { videoItem } from '../../types/movieItem';
const proxy = process.env.NEXT_PUBLIC_PROXY_CLOUD;

const MovieDashboard: React.FC = () => {
  const [allVideos, setAllVideos] = useState([]);
  const [allFilmsInfoData, setAllFilmsInfoData] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState<string[]>([]);
  let selectingVideo: string[] = [];
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ['allVideos'],
    queryFn: async () => {
      const response = await fetch(proxy + '/api/v1/video/');
      const jsonData = response.json();
      return jsonData;
    },
  });

  const allFilmsInfo = useQuery({
    queryKey: ['allFilmsInfo'],
    queryFn: async () => {
      const response = await fetch(proxy + '/api/v1/info/');
      const jsonData = response.json();
      console.log(jsonData);
      return jsonData;
    },
  });

  useEffect(() => {
    if (data !== undefined) {
      console.log(data);
      setAllVideos(data.data.videos);
    }
    if (allFilmsInfo.data) {
      // console.log(allFilmsInfo.data.data);
      setAllFilmsInfoData(allFilmsInfo.data.data);
    }
  });

  const videoSections = allFilmsInfoData.map((item) => {
    let video = new videoItem(
      item.filmInfo.name,
      item.filmInfo.first_air_date,
      item.filmInfo.poster_path,
      item.filmInfo.filmType,
      item.filmInfo._id
    );

    return <MovieItem video={video} videos={selectedVideo} info={item} />;
  });

  const handleToggle = (itemID) => {
    // Check if the item is already in the array
    const isItemToggled = selectedVideo.includes(itemID);

    if (isItemToggled) {
      // If the item is already in the array, remove it
      setSelectedVideo(selectedVideo.filter((item) => item !== itemID));
    } else {
      // If the item is not in the array, add it
      setSelectedVideo([...selectedVideo, itemID]);
    }
  };

  useEffect(() => {
    console.log('Toggled Items: ', selectedVideo);
    // You could also save to local storage or perform other side effects here
  }, [selectedVideo]);

  return (
    <>
      <div className="flex mb-5 gap-10 justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="text-white" variant={'default'}>
              ADD VIDEO INTO FILM
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:min-w-[700px] bg-black">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription>
                {/* Make changes to your profile here. Click save when you're done. */}
                {/* <div className="min-h-max grid grid-rows-3 grid-flow-col gap-4 overflow-y-auto">{videoSections}</div> */}
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-auto h-[400px] flex flex-wrap justify-center gap-4">
              {/* <div><ServerModal type="2" title="Choose your server" data={data.allVideos} /></div> */}
              {videoSections}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        {/* {data.videos &&
          data.videos.map((item: Video) => (
            <div>
              <p>Title: {item.title}</p>
              <p>Videoname: {item.videoname}</p>
            </div>
          ))} */}
        {allVideos.map((item: Video) => {
          return (
            <div
              className="w-full hover:cursor-pointer"
              onClick={() => {
                handleToggle(item._id);
              }}
            >
              <p>{item.title}</p>
              <p>{item.videoname}</p>
            </div>
          );
        })}
      </div>
      <br />
      {/* {data.map((movie: Movie) => {
        return (
          <div>
            <br />
            <TableFive data={movie} />
            <br />
          </div>
        );
      })} */}
    </>
  );
};

export default MovieDashboard;
