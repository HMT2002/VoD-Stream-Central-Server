'use client';
import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../Select/Select';
import { Server } from '../../types/server';
import { Video } from '../../types/video';
import { RadioGroup, RadioGroupItem } from '../RadioGroup/RadioGroup';
import { Label } from '@radix-ui/react-select';
import { Button } from '../Button/Button';
import { Textarea } from '../Textaera/Textarea';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import transferAPI from '../../APIs/transfer-apis';

import helperUtils from '../../utils/helperUtils';
import uploadUtils from '../../utils/uploadUtils';
const proxy = process.env.NEXT_PUBLIC_PROXY_CLOUD;

const ServerModal = ({ data: serverArray, title, type }: { data?: Server[]; title?: string; type?: string }) => {
  const [server, setServer] = useState<Server | null>(null);
  const [videosOfServer, setVideosOfServer] = useState<Video[] | null>(null);
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [threadVideo, setThreadVideo] = useState<File | null>(null);
  const [requestURL, setRequestURL] = useState<string>(proxy + '/redirect/available-upload-url-dash-best-fit');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [isManual, setIsManual] = useState(false);
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const response = await fetch(proxy + '/api/v1/video');
      const jsonData = response.json().then((res) => {
        setVideos(res.data.videos);
        return res.data.videos;
      });
      return null;
    },
  });

  if (isLoading) {
    return <span>Loading...</span>;
  }
  const updateInput = (e) => {
    const fieldName = e.target.name;
    var value = e.target.value;
    if (
      fieldName === 'numberOfTheoryCredits' ||
      fieldName === 'numberOfPracticeCredits' ||
      fieldName === 'numberOfSelfLearnCredits'
    ) {
      value = e.target.value.replace(/\D/g, '');
    }
    setVideoTitle((prevState) => {
      return value;
    });
  };
  if (isError) {
    return <span>Error: {error.message}</span>;
  }
  const handleChange = () => {
    var input = document.getElementById('videoFile');
    if (!(input instanceof HTMLInputElement)) {
      throw new Error('Element is not an HTMLInputElement');
    }
    if (input.files !== null) {
      var files = input.files;
      if (!input.files.length) {
        toast.error('Fail in getting video');
        return;
      } else {
        var file = files[0];
        toast.success(file.name);
        setThreadVideo(files[0]);
        console.log(files[0]);
      }
    }
  };
  const renderVideoDropdown = () => {
    if (videos !== null && type === '1') {
      return (
        <div className="">
          <Select
            onValueChange={(value) => {
              if (value) setSelectedVideo(value as Video);
              console.log('selectedVideo');
              console.log(selectedVideo);
            }}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select your videos" />
            </SelectTrigger>
            <SelectContent className="overflow-y-auto max-h-67 h-max bg-black">
              <SelectGroup>
                <SelectLabel>Videos</SelectLabel>
                {videos.map((videoItem: Video) => (
                  <SelectItem className="hover:cursor-pointer hover:text-white" value={videoItem ?? ''}>
                    {videoItem.title}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      );
    }
  };

  const handleStartTransfer = async () => {
    console.log('handleStartTransfer');

    const response = await transferAPI.POSTTranferAction(server, selectedVideo);
  };
  async function uploadLoop(
    chunkIndex,
    chunkSize,
    fileSize,
    file,
    chunkName,
    arrayChunkName,
    fullUploadURL,
    totalChunks,
    statusID
  ) {
    setTimeout(async function () {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, fileSize);
      const chunk = file?.slice(start, end);
      // Make an API call to upload the chunk to the backend
      const ext = file?.name.split('.').pop();
      const title = chunkName;
      const infoID = null;
      await uploadUtils.uploadChunkDashVer2(
        chunk,
        chunkIndex,
        // arrayChunkName[chunkIndex],
        arrayChunkName,
        chunkName,
        ext,
        title,
        infoID,
        fullUploadURL,
        statusID
      );
      console.log({
        chunk,
        chunkIndex,
        // arrayChunkNamechunkIndex: arrayChunkName[chunkIndex],
        arrayChunkName,
        chunkName,
        ext,
        title,
        infoID,
        fullUploadURL,
        statusID,
      });
      chunkIndex++;
      if (chunkIndex < totalChunks) {
        uploadLoop(
          chunkIndex,
          chunkSize,
          fileSize,
          file,
          chunkName,
          arrayChunkName,
          fullUploadURL,
          totalChunks,
          statusID
        );
      }
    }, 500);
  }
  const handleUploadNewVideo = async () => {
    try {
      console.log('press create new thread btn');
      if (videoTitle === '') {
        toast.error('Please enter video name');

        return;
      }
      const file = threadVideo;
      if (!file) {
        toast.error('Please select video');
        return;
      }
      const chunkSize = 30 * 1024 * 1024; // Set the desired chunk size (30MB in this example)

      const fileSize = file?.size || 0;
      const totalChunks = Math.ceil(fileSize / chunkSize);

      let chunkName = helperUtils.RandomString(7);
      let arrayChunkName: Array<string> = [];
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        arrayChunkName.push(chunkName + '_' + chunkIndex);
      }
      const requestHeaders: HeadersInit = new Headers();
      requestHeaders.set('Content-Type', 'application/json');
      requestHeaders.set('filename', chunkName);
      requestHeaders.set('filesize', fileSize.toString());
      requestHeaders.set('title', videoTitle);

      if (isManual === true) {
        console.log('Choose manual. Uncomment 2 requestHeaders');
        requestHeaders.set('preferurl', server.URL); // 3 dòng này, chỉ khi chọn manual upload, chọn server thì mới bỏ ẩn 2 dòng này
        requestHeaders.set('preferport', server.port); // để thêm địa chỉ server  chọn thủ công vào request
      }

      const requestUploadURL = await fetch(requestURL, {
        method: 'POST',
        mode: 'cors', // no-cors, *cors, same-origin
        body: JSON.stringify({
          filename: chunkName,
          filesize: fileSize,
        }),
        headers: requestHeaders,
      });

      const checkResult = await requestUploadURL.json();
      console.log(checkResult);
      if (checkResult.status === 200) {
        let chunkIndex = 0;
        console.log(chunkName);

        const index = 0;
        const uploadURL = checkResult.servers[index].URL;
        const uploadPort = checkResult.servers[index].port || '';
        const fullUploadURL = checkResult.servers[index].uploadURL;
        const statusID = checkResult.videoStatus._id;
        console.log({ uploadURL, uploadPort, fullUploadURL });

        uploadLoop(
          chunkIndex,
          chunkSize,
          fileSize,
          file,
          chunkName,
          arrayChunkName,
          fullUploadURL,
          totalChunks,
          statusID
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className={`w-full text-white ${type === '2' && 'grid grid-cols-2 '}`}>
        <div className="flex gap-3 flex-col min-w-max ">
          {type === '2' && (
            <div
              id="FileUpload"
              className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border-2 border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5"
            >
              <input
                type="file"
                accept="video/*, .mp4 ,.mkv"
                className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                id="videoFile"
                onChange={handleChange}
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 13.1971 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z"
                      fill="#3C50E0"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z"
                      fill="#3C50E0"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z"
                      fill="#3C50E0"
                    />
                  </svg>
                </span>
                <p>
                  <span className="text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="mt-1.5">MP4 or MKV</p>
              </div>
            </div>
          )}

          <Select
            onValueChange={(value) => {
              // alert((value as Server).URL);
              setServer(value as Server);
              console.log('server');
              console.log(server);
              setVideosOfServer((value as Server).videos ?? null);
            }}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder={title} />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup className="bg-black">
                <SelectLabel>Servers</SelectLabel>
                {serverArray?.map((item) => (
                  <SelectItem className="min-w-full hover:cursor-pointer hover:text-white" value={item ?? ''}>
                    <div>{item.URL}</div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {/* {videosOfServer === null ? (
            <div></div>
          ) : (
            <div className="">
              <Select
                onValueChange={(value) => {
                  if (value) setSelectedVideo(value as Video);
                }}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select your videos" />
                </SelectTrigger>
                <SelectContent className="overflow-y-auto max-h-40 h-max">
                  <SelectGroup>
                    <SelectLabel>Videos</SelectLabel>
                    {videosOfServer.map((videoItem: Video) => (
                      <SelectItem value={videoItem ?? ""}>
                        {videoItem.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )} */}
          {renderVideoDropdown()}
          <Textarea className="min-w-full max-h-39 overflow-y-auto" readOnly draggable={'false'} />
        </div>
        {type === '2' && (
          <div className="justify-self-center">
            <RadioGroup defaultValue="best_fit">
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  onClick={() => {
                    setRequestURL(proxy + '/redirect/available-upload-url-dash-first-fit');
                    setIsManual(false);
                    console.log(proxy + '/redirect/available-upload-url-dash-first-fit');
                  }}
                  value="first_fit"
                  id="r1"
                />
                <label htmlFor="r1">First Fit</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  onClick={() => {
                    setRequestURL(proxy + '/redirect/available-upload-url-dash-best-fit');
                    setIsManual(false);
                    console.log(proxy + '/redirect/available-upload-url-dash-best-fit');
                  }}
                  value="best_fit"
                  id="r2"
                />
                <label htmlFor="r2">Best Fit</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  onClick={() => {
                    setRequestURL(proxy + '/redirect/available-upload-url-dash-weight-allocate');
                    setIsManual(false);
                    console.log('/redirect/available-upload-url-dash-weight-allocate');
                  }}
                  value="weight_allocate"
                  id="r3"
                />
                <label htmlFor="r3">Weight Allocate</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  onClick={() => {
                    setRequestURL(proxy + '/redirect/request-upload-url-dash');
                    setIsManual(true);
                    console.log(proxy + '/redirect/request-upload-url-dash');
                  }}
                  value="manual_choose"
                  id="r4"
                />
                <label htmlFor="r4">Manual Choose</label>
              </div>
            </RadioGroup>
            <div className="flex items-center space-x-2">Video name</div>
            <input
              className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="email"
              name="title"
              id="emailAddress"
              placeholder=""
              defaultValue=""
              onChange={updateInput}
            />
          </div>
        )}
      </div>
      <div className="text-center my-5 text-white">
        {type === '2' ? (
          <Button onClick={handleUploadNewVideo}>Start</Button>
        ) : (
          <Button onClick={handleStartTransfer}>Transfer</Button>
        )}
      </div>
    </div>
  );
};

export default ServerModal;
