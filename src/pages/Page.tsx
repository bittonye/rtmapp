import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { Geolocation, Geoposition } from '@ionic-native/geolocation'
import React from 'react';
import { RouteComponentProps } from 'react-router';
import ExploreContainer from '../components/ExploreContainer';
import './Page.css';

class Page extends React.Component<RouteComponentProps<{ name: string; }>> {
  
  private _watch: any;

  ionViewWillEnter() {
    console.log('ionViewWillEnter event fired');
    this._watch = Geolocation.watchPosition();
    this._watch.subscribe((data: Geoposition) => {
      console.log(data);
    })
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave event fired')
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter event fired')
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave event fired')
  }

  render() {
    return  (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>{name}</IonTitle>
          </IonToolbar>
        </IonHeader>
  
        <IonContent>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">{ name }</IonTitle>
            </IonToolbar>
          </IonHeader>
          <ExploreContainer name={name} />
        </IonContent>
      </IonPage>
    );
  }
};

export default Page;
