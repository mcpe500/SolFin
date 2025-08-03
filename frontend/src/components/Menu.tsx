import React from 'react';
import { useLocation, useHistory } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';

import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonToggle,
} from '@ionic/react';
import {
  calendarOutline,
  hammer,
  moonOutline,
  help,
  informationCircleOutline,
  logIn,
  logOut,
  mapOutline,
  peopleOutline,
  person,
  personAdd,
} from 'ionicons/icons';

import { setDarkMode } from '../data/user/userSlice'; // Import from userSlice
import { RootState } from '../store'; // Import RootState
import { setMenuEnabled } from '../data/sessions/sessionsSlice'; // Import from sessionsSlice

import './Menu.scss';

const routes = {
  appPages: [
    { title: 'Schedule', path: '/tabs/schedule', icon: calendarOutline },
    { title: 'Speakers', path: '/tabs/speakers', icon: peopleOutline },
    { title: 'Map', path: '/tabs/map', icon: mapOutline },
    { title: 'About', path: '/tabs/about', icon: informationCircleOutline },
  ],
  loggedInPages: [
    { title: 'Account', path: '/account', icon: person },
    { title: 'Support', path: '/support', icon: help },
    { title: 'Logout', path: '/logout', icon: logOut },
  ],
  loggedOutPages: [
    { title: 'Login', path: '/login', icon: logIn },
    { title: 'Support', path: '/support', icon: help },
    { title: 'Signup', path: '/signup', icon: personAdd },
  ],
};

interface Pages {
  title: string;
  path: string;
  icon: string;
  routerDirection?: string;
}

const Menu: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();

  const darkMode = useSelector((state: RootState) => state.user.darkMode);
  const isAuthenticated = useSelector((state: RootState) => state.user.isLoggedin);
  const menuEnabled = useSelector((state: RootState) => state.sessions.menuEnabled); // Access from sessions slice

  const handleSetDarkMode = (checked: boolean) => {
    dispatch(setDarkMode(checked));
  };

  const handleShowTutorial = () => {
    history.push('/tutorial');
  };

  function renderlistItems(list: Pages[]) {
    return list
      .filter((route) => !!route.path)
      .map((p) => (
        <IonMenuToggle key={p.title} auto-hide="false">
          <IonItem
            detail={false}
            routerLink={p.path}
            routerDirection="none"
            className={
              location.pathname.startsWith(p.path) ? 'selected' : undefined
            }
          >
            <IonIcon slot="start" icon={p.icon} />
            <IonLabel>{p.title}</IonLabel>
          </IonItem>
        </IonMenuToggle>
      ));
  }

  return (
    <IonMenu type="overlay" disabled={!menuEnabled} contentId="main">
      <IonContent forceOverscroll={false}>
        <IonList lines="none">
          <IonListHeader>Conference</IonListHeader>
          {renderlistItems(routes.appPages)}
        </IonList>
        <IonList lines="none">
          <IonListHeader>Account</IonListHeader>
          {isAuthenticated
            ? renderlistItems(routes.loggedInPages)
            : renderlistItems(routes.loggedOutPages)}
          <IonItem>
            <IonIcon
              slot="start"
              icon={moonOutline}
              aria-hidden="true"
            ></IonIcon>
            <IonToggle
              checked={darkMode}
              onClick={() => handleSetDarkMode(!darkMode)}
            >
              Dark Mode
            </IonToggle>
          </IonItem>
        </IonList>
        <IonList lines="none">
          <IonListHeader>Tutorial</IonListHeader>
          <IonItem
            button
            detail={false}
            onClick={handleShowTutorial}
          >
            <IonIcon slot="start" icon={hammer} />
            <IonLabel>Show Tutorial</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
