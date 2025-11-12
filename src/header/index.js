import React, { useState } from "react";
import "./style.css";
import { VscGrabber, VscClose } from "react-icons/vsc";
import { Link } from "react-router-dom";
import { logotext ,socialprofils } from "../content_option";
import Themetoggle from "../components/themetoggle";
import { usePrefetchPortfolio, usePrefetchAbout, usePrefetchHomeIntro } from "../hooks/useDataPrefetch";
import { usePrefetch } from "../hooks/usePrefetch";

const Headermain = () => {
  const [isActive, setActive] = useState("false");

  const handleToggle = () => {
    setActive(!isActive);
    document.body.classList.toggle("ovhidden");
  };

  // Get prefetch handlers for data
  const portfolioDataHandlers = usePrefetchPortfolio();
  const aboutDataHandlers = usePrefetchAbout();
  const homeDataHandlers = usePrefetchHomeIntro();

  // Get prefetch handlers for routes
  const portfolioRouteHandlers = usePrefetch('/portfolio');
  const aboutRouteHandlers = usePrefetch('/about');
  const homeRouteHandlers = usePrefetch('/');

  // Combine both data and route prefetch handlers
  const combinePrefetchHandlers = (...handlerSets) => ({
    onMouseEnter: () => handlerSets.forEach(h => h.onMouseEnter?.()),
    onTouchStart: () => handlerSets.forEach(h => h.onTouchStart?.()),
  });

  return (
    <>
      <header className="fixed-top site__header">
        <div className="d-flex align-items-center justify-content-between">
          <Link  className="navbar-brand nav_ac" to="/">
            {logotext}
          </Link>
          <div className="d-flex align-items-center">
          <Themetoggle />
          <button className="menu__button  nav_ac" onClick={handleToggle}>
            {!isActive ? <VscClose /> : <VscGrabber />}
          </button>
          
          </div>
        </div>

        <div className={`site__navigation ${!isActive ? "menu__opend" : ""}`}>
          <div className="bg__menu h-100">
            <div className="menu__wrapper">
              <div className="menu__container p-3">
                <ul className="the_menu">
                  <li className="menu_item ">
                  <Link  onClick={handleToggle} to="/" className="my-3" {...combinePrefetchHandlers(homeDataHandlers, homeRouteHandlers)}>Home</Link>
                  </li>
                  <li className="menu_item">
                    <Link  onClick={handleToggle} to="/portfolio" className="my-3" {...combinePrefetchHandlers(portfolioDataHandlers, portfolioRouteHandlers)}> Portfolio</Link>
                  </li>
                  <li className="menu_item">
                  <Link onClick={handleToggle} to="/about" className="my-3" {...combinePrefetchHandlers(aboutDataHandlers, aboutRouteHandlers)}>About</Link>
                  </li>
                  <li className="menu_item">
                  <Link onClick={handleToggle} to="/contact" className="my-3"> Contact</Link>
                  </li>
                  <li className="menu_item">
                  <Link onClick={handleToggle} to="/blog" className="my-3">Blog</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="menu_footer d-flex flex-column flex-md-row justify-content-between align-items-md-center position-absolute w-100 p-3">
            <div className="d-flex">
            <a href={socialprofils.facebook}>Facebook</a>
            <a href={socialprofils.github}>Github</a>
            <a href={socialprofils.twitter}>Twitter</a>
            </div>
            <p className="copyright m-0">copyright __ {logotext}</p>
          </div>
        </div>
      </header>
      <div className="br-top"></div>
      <div className="br-bottom"></div>
      <div className="br-left"></div>
      <div className="br-right"></div>
      
    </>
  );
};

export default Headermain;
