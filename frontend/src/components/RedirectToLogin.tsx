import React, { useEffect, useContext } from 'react';
import { IonRouterContext } from '@ionic/react';
import { useDispatch } from 'react-redux';
import { setIsLoggedIn, setUsername } from '../data/user/userSlice';
import { AppDispatch } from '../store'; // Import AppDispatch

const RedirectToLogin: React.FC = () => {
  const dispatch: AppDispatch = useDispatch(); // Cast dispatch to AppDispatch
  const ionRouterContext = useContext(IonRouterContext);

  useEffect(() => {
    const performRedirect = async () => {
      await dispatch(setIsLoggedIn(false));
      await dispatch(setUsername(undefined));
      ionRouterContext.push('/tabs/schedule');
    };
    performRedirect();
  }, [dispatch, ionRouterContext]);
  return null;
};

export default RedirectToLogin;
