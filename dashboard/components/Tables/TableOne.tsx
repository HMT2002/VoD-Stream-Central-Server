// import { BRAND } from "@/types/brand";
import Image from 'next/image';
import { Server } from '../../types/server';
import { Video } from '../../types/video';
import DeleteButton from '../DeleteButton/DeleteButton';
import CopyURLButton from '../CopyURLButton/CopyURLButton';
const TableOne = ({ data }: { data: Server }) => {
  const videos = data.videos as Video[];
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">{data.URL}</h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-8">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Video Name</h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Type</h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Title</h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Size</h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Number Of Request</h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Number Of Replicant</h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">Avarage Speed</h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">{/* Avarage Speed */}</h5>
          </div>
        </div>

        {videos.map((video, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-8 ${
              key === videos.length - 1 ? '' : 'border-b border-stroke dark:border-strokedark'
            }`}
            key={key}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <div className="text-black dark:text-white">{video.videoname}</div>
            </div>
            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className=" text-black dark:text-white">{video.type}</p>
            </div>
            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{video.title}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{video.size}</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-black dark:text-white">{video.numberOfRequest}</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-black dark:text-white">{video.numberOfReplicant}</p>
            </div>
            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-black dark:text-white">{video.avarageSpeed}</p>
            </div>
            <div className="items-center justify-center p-2.5 sm:flex xl:p-5">
              {/* <p className="text-black dark:text-white">{video.avarageSpeed}</p> */}
              <DeleteButton server={data} video={video} />
              <br />

              <CopyURLButton server={data} video={video} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOne;
