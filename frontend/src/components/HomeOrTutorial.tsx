import React from 'react';
import { Redirect } from 'react-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const HomeOrTutorial: React.FC = () => {
  const hasSeenTutorial = useSelector((state: RootState) => state.user.hasSeenTutorial);

  return hasSeenTutorial ? (
    <Redirect to="/tabs/schedule" />
  ) : (
    <Redirect to="/tutorial" />
  );
};

export default HomeOrTutorial;
