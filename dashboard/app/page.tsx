import MovieDashboard from '../components/Dashboard/MovieDashboard';

import { Metadata } from 'next';
import SignIn from './auth/signin/page';

export const metadata: Metadata = {
  title: 'TailAdmin | Next.js E-commerce Dashboard Template',
  description: 'This is Home Blog page for TailAdmin Next.js',
  // other metadata
};

export default function Home() {
  return <MovieDashboard />;
  // return <SignIn />;
}
