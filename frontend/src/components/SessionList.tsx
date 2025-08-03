import {
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonListHeader,
  IonAlert,
  AlertButton,
} from '@ionic/react';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Schedule, Session } from '../models/Schedule';
import SessionListItem from './SessionListItem';
import { useDispatch, useSelector } from 'react-redux';
import { addFavorite, removeFavorite } from '../data/sessions/sessionsSlice';
import { RootState } from '../store';

interface OwnProps {
  schedule: Schedule;
  listType: 'all' | 'favorites';
  hide: boolean;
}

const SessionList: React.FC<OwnProps> = ({
  hide,
  schedule,
  listType,
}) => {
  const dispatch = useDispatch();
  const favoriteSessions = useSelector((state: RootState) => state.sessions.favorites);
  const scheduleListRef = useRef<HTMLIonListElement>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertHeader, setAlertHeader] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<(AlertButton | string)[]>(
    []
  );

  const handleShowAlert = useCallback(
    (header: string, message: string, buttons: AlertButton[]) => {
      setAlertHeader(header);
      setAlertMessage(message);
      setAlertButtons(buttons);
      setShowAlert(true);
    },
    []
  );

  const handleAddFavorite = useCallback((sessionId: string) => {
    dispatch(addFavorite(sessionId));
  }, [dispatch]);

  const handleRemoveFavorite = useCallback((sessionId: string) => {
    dispatch(removeFavorite(sessionId));
  }, [dispatch]);

  useEffect(() => {
    if (scheduleListRef.current) {
      scheduleListRef.current.closeSlidingItems();
    }
  }, [hide]);

  if (schedule.groups.length === 0 && !hide) {
    return (
      <IonList>
        <IonListHeader>No Sessions Found</IonListHeader>
      </IonList>
    );
  }

  return (
    <>
      <IonList ref={scheduleListRef} style={hide ? { display: 'none' } : {}}>
        {schedule.groups.map((group, index: number) => (
          <IonItemGroup key={`group-${index}`}>
            <IonItemDivider sticky>
              <IonLabel>{group.time}</IonLabel>
            </IonItemDivider>
            {group.sessions.map((session: Session, sessionIndex: number) => (
              <SessionListItem
                onShowAlert={handleShowAlert}
                isFavorite={favoriteSessions.indexOf(session.id.toString()) > -1} // Convert to string for comparison
                onAddFavorite={handleAddFavorite}
                onRemoveFavorite={handleRemoveFavorite}
                key={`group-${index}-${sessionIndex}`}
                session={session}
                listType={listType}
              />
            ))}
          </IonItemGroup>
        ))}
      </IonList>
      <IonAlert
        isOpen={showAlert}
        header={alertHeader}
        message={alertMessage}
        buttons={alertButtons}
        onDidDismiss={() => setShowAlert(false)}
      ></IonAlert>
    </>
  );
};

export default SessionList;
