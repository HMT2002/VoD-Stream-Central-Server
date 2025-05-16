'use client';
import React from 'react';
import ChartOne from '../Charts/ChartOne';
import ChartThree from '../Charts/ChartThree';
import ChartTwo from '../Charts/ChartTwo';
import ChatCard from '../Chat/ChatCard';
import TableOne from '../Tables/TableOne';
import CardDataStats from '../CardDataStats';
import { useQuery } from '@tanstack/react-query';
// import Map from "../Maps/TestMap";

// without this the component renders on server and throws an error
import dynamic from 'next/dynamic';
const MapOne = dynamic(() => import('../Maps/MapOne'), {
  ssr: false,
});

type Server = {
  URL?: string;
  avarageSpeed?: number;
  numberOfRequest?: number;
  occupy?: number;
  occupyPercentage?: number;
  port?: string;
  storage?: number;
  videos?: Array<Number>;
};

const MovieDashboard: React.FC = () => {
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ['servers'],
    queryFn: async () => {
      const response = await fetch(process.env.NEXT_PUBLIC_PROXY_CLOUD + '/api/v1/server');
      const jsonData = response.json();
      return jsonData;
    },
  });

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  function logData() {
    if (data) {
      console.log(data.servers);
    }
  }
  logData();

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        {data.servers.map((item: Server) => (
          <div>
            <p>URL: {item.URL}</p>
            <p>Average Speed: {item.avarageSpeed?.toString()}</p>
            <p>Number of request: {item.numberOfRequest}</p>
            <p>Occupy: {item.occupy}</p>
            <p>Occupy Percentage: {item.occupyPercentage}</p>
            <p>Port: {item.port}</p>
            <p>Storage: {item.storage}</p>
          </div>
        ))}
      </div>
      <br />
      {data.servers.map((server: Server) => {
        return (
          <div>
            <br />
            <TableOne data={server} />
            <br />
          </div>
        );
      })}
    </>
  );
};

export default MovieDashboard;
