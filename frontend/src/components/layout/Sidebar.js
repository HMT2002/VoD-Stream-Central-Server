import React, { useContext } from 'react';

import AuthContext from '../../contexts/auth-context';

import { Link } from 'react-router-dom';
import { GoHome } from 'react-icons/go';
import { GiToolbox } from 'react-icons/gi';
import { RiUser3Line } from 'react-icons/ri';

import '../../styles/Sidebar.css';
import Button from '../UI elements/Button';

const SidebarItem = (props) => {
  return (
    <Link className="app-sidebar__item" to={props.navigateRoute}>
      {props.icon}
      <div>{props.content}</div>
    </Link>
  );
};

const Sidebar = (props) => {
  const authContext = useContext(AuthContext);
  const handleSidebarClick = () => {
    props.handleClick(!props.openState);
  };
  return (
    <React.Fragment>
      <div className={`${props.className} h-full z-[1000]`}>
        <div className="app-sidebar__content absolute inset-0">
          <Button className={'m-10'} content="Back" onClick={handleSidebarClick}></Button>
          <div className="flex flex-col justify-between gap-3 mt-2">
            <SidebarItem icon={<GoHome className="app-sidebar__item__icon" />} content="Home" navigateRoute={'/'} />
            <SidebarItem
              icon={<GoHome className="app-sidebar__item__icon" />}
              content="Movies"
              navigateRoute={'/movies'}
            />
            <SidebarItem
              icon={<GoHome className="app-sidebar__item__icon" />}
              content="TV Shows"
              navigateRoute={'/tv-series'}
            />
            <SidebarItem icon={<GoHome className="app-sidebar__item__icon" />} content="Top IMDB" navigateRoute={'/'} />
          </div>
          {authContext.isAuthorized && (
            <SidebarItem
              icon={<RiUser3Line className="app-sidebar__item__icon" />}
              content="Account"
              navigateRoute={'/account/' + authContext.username}
              onClick
            />
          )}
          {authContext.role === 'content-creator' && (
            <SidebarItem
              icon={<GiToolbox className="app-sidebar__item__icon" />}
              content="Workshop"
              navigateRoute={'/workshop/' + authContext.username}
            />
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Sidebar;
