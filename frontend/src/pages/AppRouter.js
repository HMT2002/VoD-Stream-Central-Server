import React, { useContext } from 'react';

import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import HomePage from './HomePage';
import ThreadPage from './ThreadPage';
import AccountPage from './AccountPage';
import VideoDemo from './VideoDemo';
import VideoManagementPage from './VideoManagementPage';

import VideoPage from './VideoPage';

import VideoDash from './VideoDash';

import WorkshopPage from './WorkshopPage';
import TagPage from './TagPage';
import UserPage from './UserPage';
import { GoogleOAuthProvider } from '@react-oauth/google';
import MoviePage from './MoviePage';
import TVPage from './TVPage';
import AuthContext from '../contexts/auth-context';
import { RequireAuth } from '../components/RequireAuth/RequireAuth';
import { RequireRole } from '../components/RequireRole/RequireRole';
const AppRouter = () => {
  return (
    <GoogleOAuthProvider clientId="1031226840176-2hfbvd0am0ea3hcapmapeea1tc4ijn0n.apps.googleusercontent.com">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-new-account" element={<RegisterPage />} />
        <Route
          path="/"
          exact
          element={
            <RequireAuth>
              {' '}
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/movies"
          exact
          element={
            <RequireAuth>
              <MoviePage />
            </RequireAuth>
          }
        />
        <Route
          path="/tv-series"
          exact
          element={
            <RequireAuth>
              <TVPage />
            </RequireAuth>
          }
        />
        <Route
          path="/user/:id"
          element={
            <RequireAuth>
              <UserPage />
            </RequireAuth>
          }
        />
        <Route
          path="/tag/:tag"
          element={
            <RequireAuth>
              <TagPage />
            </RequireAuth>
          }
        />
        <Route
          path="/thread/:slug"
          element={
            <RequireAuth>
              <ThreadPage />
            </RequireAuth>
          }
        />
        <Route
          path="/account/:username"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />
        <Route
          path="/video-demo/:filename"
          element={
            <RequireAuth>
              <VideoDemo />
            </RequireAuth>
          }
        />
        <Route
          path="/video/:filename"
          element={
            <RequireAuth>
              <VideoPage />
            </RequireAuth>
          }
        />
        <Route
          path="/video-dash/:videoname"
          element={
            <RequireAuth>
              {' '}
              <VideoDash />
            </RequireAuth>
          }
        />
        <Route
          path="/workshop/:username"
          element={
            <RequireAuth>
              {' '}
              <WorkshopPage />
            </RequireAuth>
          }
        />
        <Route
          path="/workshop/create/thread/:username"
          element={
            <RequireAuth>
              <WorkshopPage />
            </RequireAuth>
          }
        />
        <Route
          path="/workshop/dashboard/:username"
          element={
            <RequireAuth>
              <WorkshopPage />{' '}
            </RequireAuth>
          }
        />
        <Route
          path="/workshop/threads/:username"
          element={
            <RequireAuth>
              <WorkshopPage />
            </RequireAuth>
          }
        />
        <Route
          path="/workshop/comments/:username"
          element={
            <RequireAuth>
              <WorkshopPage />
            </RequireAuth>
          }
        />
        <Route
          path="/workshop/edit/thread/:slug"
          element={
            <RequireAuth>
              <WorkshopPage />
            </RequireAuth>
          }
        />

        <Route path="/adminstrator" element={<VideoManagementPage />} />
      </Routes>
    </GoogleOAuthProvider>
  );
};

export default AppRouter;
