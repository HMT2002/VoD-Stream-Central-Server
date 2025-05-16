import React, { useEffect, useState } from 'react';
import logo from '../../assets/img/ben10.jpg';
import { Button } from '../Button/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { POSTFilmIntoInfo } from '../../APIs/transfer-apis';
import { toast } from 'sonner';

const MovieItem = (props) => {
  const video = props.video;
  const info = props.info;
  const [videos, setVideos] = useState<string[]>(props.videos);
  const queryClient = useQueryClient();
  const addFilmIntoInfo = useMutation({
    mutationFn: POSTFilmIntoInfo,
    onSuccess: () => {
      toast.success('Add film successfully');
      console.log('filmID: ' + info._id);
      console.log('videos: ' + videos);
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
    onError: () => {
      toast.error('Fail');
    },
  });
  useEffect(() => {
    setVideos(props.videos);
  }, [props.videos]);
  return (
    <div className="shadow-lg hover:shadow-2xl text-sm gap-2 mx-2 flex flex-col min-h-max bg-black rounded-sm w-29">
      <div className="">
        <img width={100} height={200} src={video.img != null ? video.img : './logo'} alt="video-image" />
      </div>
      <div className="flex flex-col justify-between px-3 flex-auto">
        <div className="flex flex-col justify-stretch">
          <div className="flex items-start">
            {/* <p className="mr-5">{video.release_date != null ? video.release_date : '2023'}</p> */}
            <p>{video.type != null ? video.type : 'Movie'}</p>
          </div>
          <p className="font-semibold ">{video.title != null ? video.title : 'Ben 10: Alien Force'}</p>
        </div>
        <Button
          onClick={() => {
            POSTFilmIntoInfo({ filmID: info._id, videos: videos });
          }}
          variant="default"
          color=""
          className="text-white w-full rounded-sm py-1 mb-2 mx-auto "
        >
          Thêm vào đây
        </Button>
      </div>
    </div>
  );
};

export default MovieItem;
