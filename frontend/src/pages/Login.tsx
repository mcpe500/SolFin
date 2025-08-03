import React, { useState } from 'react';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonPage,
  IonButtons,
  IonMenuButton,
  IonRow,
  IonCol,
  IonButton,
  IonInput,
} from '@ionic/react';
import { useHistory } from 'react-router';
import './Login.scss';
import { useDispatch } from 'react-redux';
import { setIsLoggedIn, setUsername, userLogin } from '../data/user/userSlice'; // Import userLogin thunk
import { AppDispatch } from '../store';
import { useIonToast } from '@ionic/react';
import { info, error as logError } from '../utils/logger'; // Import logger utilities

const Login: React.FC = () => {
  const history = useHistory();
  const dispatch: AppDispatch = useDispatch();
  const [login, setLogin] = useState({ username: '', password: '' });
  const [submitted, setSubmitted] = useState(false);
  const [presentToast] = useIonToast();

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (login.username && login.password) {
      try {
        await dispatch(userLogin({ email: login.username, password: login.password })).unwrap();
        info(`User ${login.username} logged in successfully.`); // Log success
        presentToast({
          message: 'Login successful!',
          duration: 1500,
          color: 'success',
        });
        history.push('/tabs/schedule');
      } catch (err: any) {
        const errorMessage = err.message || 'Login failed. Please check your credentials.';
        logError(`Login failed for user ${login.username}:`, errorMessage); // Log error
        presentToast({
          message: errorMessage,
          duration: 3000,
          color: 'danger',
        });
      }
    } else {
      presentToast({
        message: 'Please enter both username and password.',
        duration: 3000,
        color: 'warning',
      });
    }
  };

  const onSignup = () => {
    history.push('/signup');
  };

  return (
    <IonPage id="login-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="login-logo">
          <img src="/assets/img/appicon.svg" alt="Ionic logo" />
        </div>

        <div className="login-form">
          <form onSubmit={onLogin} noValidate>
            <IonInput
              label="Username"
              labelPlacement="stacked"
              fill="solid"
              value={login.username}
              name="username"
              type="email" // Changed to email type for better validation
              spellCheck={false}
              autocapitalize="off"
              errorText={
                (submitted && !login.username) ? 'Email is required' : ''
              }
              onIonInput={(e) =>
                setLogin({ ...login, username: e.detail.value! })
              }
              required
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$" // Basic email pattern
            />

            <IonInput
              label="Password"
              labelPlacement="stacked"
              fill="solid"
              value={login.password}
              name="password"
              type="password"
              minlength={8}
              errorText={
                (submitted && !login.password) ? 'Password is required' : ''
              }
              onIonInput={(e) =>
                setLogin({ ...login, password: e.detail.value! })
              }
              required
            />

            <IonRow>
              <IonCol>
                <IonButton type="submit" expand="block">
                  Login
                </IonButton>
              </IonCol>
              <IonCol>
                <IonButton onClick={onSignup} color="light" expand="block">
                  Signup
                </IonButton>
              </IonCol>
            </IonRow>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
