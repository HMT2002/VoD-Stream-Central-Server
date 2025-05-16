'use client';
import React from 'react';
import { Button } from '../Button/Button';
import { toast } from 'sonner';
import transferAPIs from '../../APIs/transfer-apis';
import { Server } from '../../types/server';
import { Video } from '../../types/video';

const CopyURLButton = ({ server, video }: { server: Server; video: Video }) => {
  return (
    <Button
      variant={'default'}
      onClick={async () => {
        console.log({ server, video });
        navigator.clipboard.writeText('http://' + server.URL + '/dash-token/' + video.video_jwt_token + '.mpd');
        //toast.success('Đã copy: http://' + server.URL + '/videos/' + video.videoname + 'Dash/init.mpd');
      }}
    >
      Copy playable URL
    </Button>
  );
};

export default CopyURLButton;
