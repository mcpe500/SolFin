import React, { useRef } from 'react';
import {
  IonItemSliding,
  IonItem,
  IonLabel,
  IonItemOptions,
  IonItemOption,
  AlertButton,
  useIonToast,
} from '@ionic/react';
import { Session } from '../models/Schedule';

interface SessionListItemProps {
  session: Session;
  listType: 'all' | 'favorites';
  onAddFavorite: (id: string) => void; // Changed to string
  onRemoveFavorite: (id: string) => void; // Changed to string
  onShowAlert: (
    header: string,
    message: string,
    buttons: AlertButton[]
  ) => void;
  isFavorite: boolean;
}

const SessionListItem: React.FC<SessionListItemProps> = ({
  isFavorite,
  onAddFavorite,
  onRemoveFavorite,
  onShowAlert,
  session,
  listType,
}) => {
  const [presentToast] = useIonToast();
  const ionItemSlidingRef = useRef<HTMLIonItemSlidingElement>(null);

  const dismissAlert = () => {
    ionItemSlidingRef.current && ionItemSlidingRef.current.close();
  };

  const removeFavoriteSession = (title: string) => {
    onShowAlert(
      title,
      'Would you like to remove this session from your favorites?',
      [
        {
          text: 'Cancel',
          handler: dismissAlert,
        },
        {
          text: 'Remove',
          handler: () => {
            onRemoveFavorite(session.id.toString()); // Convert to string
            dismissAlert();
          },
        },
      ]
    );
  };

  const addFavoriteSession = async () => {
    if (isFavorite) {
      // Prompt to remove favorite
      removeFavoriteSession('Favorite already added');
    } else {
      // Add as a favorite
      onAddFavorite(session.id.toString()); // Convert to string

      // Close the open item
      ionItemSlidingRef.current && ionItemSlidingRef.current.close();

      // Create a toast
      presentToast({
        message: `${session.name} was successfully added as a favorite.`,
        duration: 3000,
        buttons: [
          {
            text: 'Close',
            role: 'cancel',
          },
        ],
      });
    }
  };

  return (
    <IonItemSliding
      ref={ionItemSlidingRef}
      class={'track-' + session.tracks[0].toLowerCase()}
    >
      <IonItem routerLink={`/tabs/schedule/${session.id}`}>
        <IonLabel>
          <h3>{session.name}</h3>
          <p>
            {session.timeStart} &mdash;&nbsp;
            {session.timeEnd}:&nbsp;
            {session.location}
          </p>
        </IonLabel>
      </IonItem>
      <IonItemOptions>
        {listType === 'favorites' ? (
          <IonItemOption
            color="danger"
            onClick={() => removeFavoriteSession('Remove Favorite')}
            aria-label="Remove from favorites" // Added aria-label
          >
            Remove
          </IonItemOption>
        ) : (
          <IonItemOption
            color="favorite"
            onClick={addFavoriteSession}
            aria-label="Add to favorites" // Added aria-label
          >
            Favorite
          </IonItemOption>
        )}
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default React.memo(SessionListItem);
