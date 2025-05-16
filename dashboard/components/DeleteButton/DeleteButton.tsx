'use client';
import React from 'react';
import { Button } from '../Button/Button';
import { toast } from 'sonner';
import transferAPIs from '../../APIs/transfer-apis';
import { Server } from '../../types/server';
import { Video } from '../../types/video';

const DeleteButton = ({ server, video }: { server: Server; video: Video }) => {
  return (
    <Button
      variant={'default'}
      onClick={async () => {
        console.log('POSTTranferAction');
        console.log({ server, video });
        const response = await transferAPIs.POSTDeleteAction(server, video);
        if (response.failed === true) {
          toast.error('Xóa thất bại');
        } else {
          toast.success('Đã xóa');
        }
      }}
    >
      Delete
    </Button>
  );
};

export default DeleteButton;
