import React, { useState, useEffect, useRef } from 'react';

import { Link, useLocation } from 'react-router-dom';

import Header from './Header';
import Sidebar from './Sidebar';

import '../../styles/Layout.css';

const Layout = (props) => {
  const location = useLocation();
  const isLoginOrRegisterPage = location.pathname !== '/login' && location.pathname !== '/create-new-account';
  const [openSidebar, setOpenSidebar] = useState(false);
  const navref = useRef(null);

  const handleSidebarClick = (open) => {
    setOpenSidebar(open);
  };

  const handleClickOutsideBox = (event) => {
    // alert(1);
    if (navref.current == null) return;
    if (openSidebar && !navref.current.contains(event.target)) {
      setOpenSidebar(false);
    }
  };
  //document only be used on client side
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutsideBox);
  });

  return (
    <React.Fragment>
      <main className={`app-layout flex flex-col overflow-x-hidden `}>
        {isLoginOrRegisterPage && <Header openState={openSidebar} handleClick={handleSidebarClick} />}
        <div className={`fixed inset-0 ${openSidebar ? ' bg-[#050505e6] z-[100] block' : 'hidden'}`}></div>
        <div className="flex">
          {isLoginOrRegisterPage && (
            <div ref={navref}>
              <Sidebar
                openState={openSidebar}
                handleClick={handleSidebarClick}
                className={`app-layout__sidebar transition-all duration-200 absolute bg-black  ease-in-out ${
                  openSidebar ? 'block left-0' : 'hidden left-[-500px]'
                }`}
              />
            </div>
          )}
          <div className={`app-layout__page app-layout max-w-[1600px] mx-auto z-0 min-h-[100vh] }`}>
            {props.children}
          </div>
        </div>
        {/* <div className="max-w-[1600px] mx-auto my-10 gap-3 text-center">
          <div className="flex flex-row justify-around">
            <Link>Android App</Link>
            <Link>Terms of service</Link>
            <Link>Contact</Link>
            <Link>Sitemap</Link>
            <Link>FAQ</Link>
          </div>
          <div>
            <p>
              TheFlixer is a Free Movies streaming site with zero ads. We let you watch movies online without having to
              register or paying, with over 10000 movies and TV-Series. You can also Download full movies from
              MoviesCloud and watch it later if you want.
            </p>
          </div>
          <div>
            <p>© 2022 MoviesCloud All rights reserved.</p>
          </div>
        </div> */}
      </main>
    </React.Fragment>
  );
};

export default Layout;
