import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';

const DashboardPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Dashboard</IonTitle>
          </IonToolbar>
        </IonHeader>
        {/* Your dashboard content goes here */}
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Welcome to your SolFin Dashboard!</p>
      </IonContent>
    </IonPage>
  );
};

export default DashboardPage;