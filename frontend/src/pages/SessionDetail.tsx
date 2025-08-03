import React from 'react';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonPage,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonText,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { starOutline, star, share, cloudDownload } from 'ionicons/icons';
import './SessionDetail.scss';
import { addFavorite, removeFavorite, getSessionById } from '../data/sessions/sessionsSlice'; // Import getSessionById selector
import { Session } from '../models/Schedule';
import { AppDispatch, RootState } from '../store'; // Import RootState and AppDispatch

interface SessionDetailProps extends RouteComponentProps<{ id: string }> {}

const SessionDetail: React.FC<SessionDetailProps> = ({ match }) => {
  const dispatch: AppDispatch = useDispatch();
  const session = useSelector((state: RootState) => getSessionById(state, match.params.id));
  const favoriteSessions = useSelector((state: RootState) => state.sessions.favorites);

  if (!session) {
    return <div>Session not found</div>;
  }

  const isFavorite = favoriteSessions.includes(session.id.toString());

  const toggleFavorite = () => {
    isFavorite ? dispatch(removeFavorite(session.id.toString())) : dispatch(addFavorite(session.id.toString()));
  };
  const shareSession = () => {};
  const sessionClick = (text: string) => {
    console.log(`Clicked ${text}`);
  };

  return (
    <IonPage id="session-detail-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/schedule"></IonBackButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={() => toggleFavorite()}>
              {isFavorite ? (
                <IonIcon slot="icon-only" icon={star}></IonIcon>
              ) : (
                <IonIcon slot="icon-only" icon={starOutline}></IonIcon>
              )}
            </IonButton>
            <IonButton onClick={() => shareSession}>
              <IonIcon slot="icon-only" icon={share}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="ion-padding">
          <h1>{session.name}</h1>
          {session.tracks.map((track: string) => (
            <span
              key={track}
              className={`session-track-${track.toLowerCase()}`}
            >
              {track}
            </span>
          ))}
          <p>{session.description}</p>
          <IonText color="medium">
            {session.timeStart} &ndash; {session.timeEnd}
            <br />
            {session.location}
          </IonText>
        </div>
        <IonList>
          <IonItem onClick={() => sessionClick('watch')} button>
            <IonLabel color="primary">Watch</IonLabel>
          </IonItem>
          <IonItem onClick={() => sessionClick('add to calendar')} button>
            <IonLabel color="primary">Add to Calendar</IonLabel>
          </IonItem>
          <IonItem onClick={() => sessionClick('mark as unwatched')} button>
            <IonLabel color="primary">Mark as Unwatched</IonLabel>
          </IonItem>
          <IonItem onClick={() => sessionClick('download video')} button>
            <IonLabel color="primary">Download Video</IonLabel>
            <IonIcon
              slot="end"
              color="primary"
              size="small"
              icon={cloudDownload}
            ></IonIcon>
          </IonItem>
          <IonItem onClick={() => sessionClick('leave feedback')} button>
            <IonLabel color="primary">Leave Feedback</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default SessionDetail;
