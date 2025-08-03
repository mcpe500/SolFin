import React, { useEffect, useMemo } from 'react'; // Import useMemo
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonPage,
  IonButtons,
  IonMenuButton,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import SpeakerItem from '../components/SpeakerItem';
import { Speaker } from '../models/Speaker';
import { Session } from '../models/Schedule';
import { useDispatch, useSelector } from 'react-redux';
import { getSpeakers, getAllSessions, loadConfData } from '../data/sessions/sessionsSlice';
import { RootState, AppDispatch } from '../store';
import './SpeakerList.scss';

const SpeakerList: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const speakers = useSelector((state: RootState) => getSpeakers(state));
  const sessions = useSelector((state: RootState) => getAllSessions(state));

  useEffect(() => {
    dispatch(loadConfData());
  }, [dispatch]);

  // Memoize the speakerSessions calculation
  const speakerSessions = useMemo(() => {
    const sessionsMap: { [key: string]: Session[] } = {};
    speakers.forEach(speaker => {
      sessionsMap[speaker.name] = sessions.filter((session: Session) =>
        session.speakerNames.includes(speaker.name)
      );
    });
    return sessionsMap;
  }, [speakers, sessions]); // Recalculate only when speakers or sessions change

  return (
    <IonPage id="speaker-list">
      <IonHeader translucent={true}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Speakers</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen={true}>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Speakers</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonGrid fixed>
          <IonRow>
            {speakers.map((speaker) => (
              <IonCol size="12" size-md="6" key={speaker.id}>
                <SpeakerItem
                  key={speaker.id}
                  speaker={speaker}
                  sessions={speakerSessions[speaker.name]}
                />
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default SpeakerList;
