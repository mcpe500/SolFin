import React, { useEffect } from 'react';
import { Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useSelector, useDispatch } from 'react-redux';

import Menu from './components/Menu';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

// import '@ionic/react/css/palettes/dark.always.css';
// import '@ionic/react/css/palettes/dark.system.css';
import '@ionic/react/css/palettes/dark.class.css';

/* Theme variables */
import './theme/variables.css';

/* Leaflet CSS */
import 'leaflet/dist/leaflet.css';

/* Global styles */
import './App.scss';
import MainTabs from './pages/MainTabs';
import { loadConfData } from './data/sessions/sessionsSlice'; // Import from sessionsSlice
import {
  setIsLoggedIn,
  setUsername,
  loadUserData,
} from './data/user/userSlice'; // Import from userSlice
import Account from './pages/Account';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Support from './pages/Support';
import Tutorial from './pages/Tutorial';
import HomeOrTutorial from './components/HomeOrTutorial';
import { Schedule } from './models/Schedule';
import RedirectToLogin from './components/RedirectToLogin';
import { RootState, AppDispatch } from './store'; // Import RootState and AppDispatch

setupIonicReact();

/**
 * @component App
 * @description The root component of the Ionic React application.
 * It sets up Ionic React, configures routing, and initializes global state.
 * It also handles dark mode and initial data loading.
 */
const App: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.user.darkMode);
  const loadingConfData = useSelector((state: RootState) => state.sessions.loading);

  /**
   * @description useEffect hook to load initial user data and conference data when the component mounts.
   *              It dispatches Redux actions to fetch necessary data for the application.
   *              `loadUserData` fetches user-specific settings (like dark mode preference) and authentication status.
   *              `loadConfData` fetches general application data (like schedule, speakers, locations).
   * @param {AppDispatch} dispatch - The Redux dispatch function.
   */
  useEffect(() => {
    dispatch(loadUserData());
    dispatch(loadConfData());
    // The `dispatch` function is a stable reference provided by React-Redux,
    // so including it in the dependency array is correct and won't cause
    // unnecessary re-renders.
  }, [dispatch]);

  // Render a loading indicator or null while data is loading
  if (loadingConfData) {
    return <div>Loading...</div>; // Or a proper spinner/skeleton loader
  }

  return (
    <IonApp className={`${darkMode ? 'ion-palette-dark' : ''}`}>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Menu />
          <IonRouterOutlet id="main">
            {/*
                We use IonRoute here to keep the tabs state intact,
                which makes transitions between tabs and non tab pages smooth
                */}
            <Route path="/tabs" render={() => <MainTabs />} />
            <Route path="/account" component={Account} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/support" component={Support} />
            <Route path="/tutorial" component={Tutorial} />
            <Route
              path="/logout"
              render={() => {
                return (
                  <RedirectToLogin />
                );
              }}
            />
            <Route path="/" component={HomeOrTutorial} exact />
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
