import React, { useState } from 'react';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonPage,
  IonButtons,
  IonMenuButton,
  IonList,
  IonItem,
  IonAlert,
} from '@ionic/react';
import './Account.scss';
import { useDispatch, useSelector } from 'react-redux';
import { setUsername } from '../data/user/userSlice';
import { RootState, AppDispatch } from '../store';
import { RouteComponentProps } from 'react-router';

interface AccountProps extends RouteComponentProps {}

const Account: React.FC<AccountProps> = () => {
  const dispatch: AppDispatch = useDispatch();
  const username = useSelector((state: RootState) => state.user.username);
  const [showAlert, setShowAlert] = useState(false);

  const clicked = (text: string) => {
    console.log(`Clicked ${text}`);
  };

  const handleSetUsername = (data: any) => {
    dispatch(setUsername(data.username));
  };

  return (
    <IonPage id="account-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Account</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {username && (
          <div className="ion-padding-top ion-text-center">
            <img
              src="https://www.gravatar.com/avatar?d=mm&s=140"
              alt="avatar"
            />
            <h2>{username}</h2>
            <IonList inset>
              <IonItem onClick={() => clicked('Update Picture')}>
                Update Picture
              </IonItem>
              <IonItem onClick={() => setShowAlert(true)}>
                Change Username
              </IonItem>
              <IonItem onClick={() => clicked('Change Password')}>
                Change Password
              </IonItem>
              <IonItem routerLink="/support" routerDirection="none">
                Support
              </IonItem>
              <IonItem routerLink="/logout" routerDirection="none">
                Logout
              </IonItem>
            </IonList>
          </div>
        )}
      </IonContent>
      <IonAlert
        isOpen={showAlert}
        header="Change Username"
        buttons={[
          'Cancel',
          {
            text: 'Ok',
            handler: (data) => {
              handleSetUsername(data);
            },
          },
        ]}
        inputs={[
          {
            type: 'text',
            name: 'username',
            value: username,
            placeholder: 'username',
          },
        ]}
        onDidDismiss={() => setShowAlert(false)}
      />
    </IonPage>
  );
};

export default Account;
