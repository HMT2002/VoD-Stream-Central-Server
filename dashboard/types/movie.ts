import { Video } from "./video";

export type Movie = {
  URL?: string;
  avarageSpeed?: number;
  numberOfRequest?: number;
  occupy?: number;
  occupyPercentage?: number;
  port?: string;
  storage?: number;
  videos?: Array<Video>;
};
