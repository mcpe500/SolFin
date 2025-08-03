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
import './Signup.scss';
import { useDispatch } from 'react-redux';
import { setIsLoggedIn, setUsername, userRegister } from '../data/user/userSlice'; // Import userRegister thunk
import { AppDispatch } from '../store';
import { useIonToast } from '@ionic/react';
import { info, error as logError } from '../utils/logger'; // Import logger utilities

const Signup: React.FC = () => {
  const history = useHistory();
  const dispatch: AppDispatch = useDispatch();
  const [signup, setSignup] = useState({ username: '', password: '' });
  const [submitted, setSubmitted] = useState(false);
  const [presentToast] = useIonToast();

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (signup.username && signup.password) {
      try {
        await dispatch(userRegister({ email: signup.username, password: signup.password })).unwrap();
        info(`User ${signup.username} registered successfully.`); // Log success
        presentToast({
          message: 'Registration successful!',
          duration: 1500,
          color: 'success',
        });
        // Optionally, log in the user after successful registration
        // await dispatch(userLogin({ email: signup.username, password: signup.password })).unwrap();
        history.push('/tabs/schedule');
      } catch (err: any) {
        const errorMessage = err.message || 'Registration failed.';
        logError(`Registration failed for user ${signup.username}:`, errorMessage); // Log error
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

  return (
    <IonPage id="signup-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>Signup</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="signup-logo">
          <img src="/assets/img/appicon.svg" alt="Ionic Logo" />
        </div>

        <div className="signup-form">
          <form onSubmit={onSignup} noValidate>
            <IonInput
              label="Username"
              labelPlacement="stacked"
              fill="solid"
              value={signup.username}
              name="username"
              type="email" // Changed to email type for better validation
              errorText={
                (submitted && !signup.username) ? 'Email is required' : ''
              }
              onIonInput={(e) =>
                setSignup({ ...signup, username: e.detail.value! })
              }
              required
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$" // Basic email pattern
            />

            <IonInput
              label="Password"
              labelPlacement="stacked"
              fill="solid"
              value={signup.password}
              name="password"
              type="password"
              minlength={8} // Add minlength for password
              errorText={
                (submitted && !signup.password) ? 'Password is required' : ''
              }
              onIonInput={(e) =>
                setSignup({ ...signup, password: e.detail.value! })
              }
              required
            />

            <IonRow>
              <IonCol>
                <IonButton type="submit" expand="block">
                  Create
                </IonButton>
              </IonCol>
            </IonRow>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Signup;
