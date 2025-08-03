import React, { useRef, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  useIonViewWillEnter,
} from '@ionic/react';
import { arrowForward } from 'ionicons/icons';
import { setMenuEnabled } from '../data/sessions/sessionsSlice';
import { setHasSeenTutorial } from '../data/user/userSlice';
import './Tutorial.scss';
import { useDispatch } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { AppDispatch } from '../store';

interface TutorialProps extends RouteComponentProps {}

const Tutorial: React.FC<TutorialProps> = ({
  history,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const sliderRef = useRef<HTMLDivElement>(null);

  useIonViewWillEnter(() => {
    dispatch(setMenuEnabled(false));
    // Scroll to first slide when entering the tutorial
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: 0,
        behavior: 'smooth'
      });
    }
  });

  const startApp = async () => {
    await dispatch(setHasSeenTutorial(true));
    await dispatch(setMenuEnabled(true));
    history.push('/tabs/schedule', { direction: 'none' });
  };

  return (
    <IonPage id="tutorial-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="end">
            <IonButton color="primary" onClick={startApp}>
              Skip
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="slider" ref={sliderRef}>
          <section>
            <div className="swiper-item">
              <img
                src="assets/img/ica-slidebox-img-1.png"
                alt=""
                className="slide-image"
              />
              <h2 className="slide-title">
                Welcome to <b>ICA</b>
              </h2>
              <p>
                The <b>ionic conference app</b> is a practical preview of the
                ionic framework in action, and a demonstration of proper code
                use.
              </p>
            </div>
          </section>
          <section>
            <div className="swiper-item">
              <img
                src="assets/img/ica-slidebox-img-2.png"
                alt=""
                className="slide-image"
              />
              <h2 className="slide-title">What is Ionic?</h2>
              <p>
                <b>Ionic Framework</b> is an open source SDK that enables
                developers to build high quality mobile apps with web
                technologies like HTML, CSS, and JavaScript.
              </p>
            </div>
          </section>
          <section>
            <div className="swiper-item">
              <img
                src="assets/img/ica-slidebox-img-3.png"
                alt=""
                className="slide-image"
              />
              <h2 className="slide-title">What is Ionic Appflow?</h2>
              <p>
                <b>Ionic Appflow</b> is a powerful set of services and features
                built on top of Ionic Framework that brings a totally new level
                of app development agility to mobile dev teams.
              </p>
            </div>
          </section>
          <section>
            <div className="swiper-item">
              <img
                src="assets/img/ica-slidebox-img-4.png"
                alt=""
                className="slide-image"
              />
              <h2 className="slide-title">Ready to Play?</h2>
              <IonButton fill="clear" onClick={startApp}>
                Continue
                <IonIcon slot="end" icon={arrowForward} />
              </IonButton>
            </div>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tutorial;
