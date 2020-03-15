import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, withIonLifeCycle } from '@ionic/react';
import { Geolocation, Geoposition } from '@ionic-native/geolocation'
import React from 'react';
import { RouteComponentProps } from 'react-router';
import socketIOClient from 'socket.io-client';
import ExploreContainer from '../components/ExploreContainer';
import './Page.css';

interface PageState {
  response: any;
  endpoint: string;
} 

class Page extends React.Component<RouteComponentProps<{ name: string; }>, PageState> {
  
  private _watch: any;
  private _socket: any;

  constructor(props: any) {
    super(props);

    this.state = {
      response: false,
      endpoint: "http://rtmessages-git-places.apps.us-west-1.starter.openshift-online.com"
    };
  }

  geopos_to_json(pos: Geoposition) {
    return {
      coords: {
        lat: pos.coords.latitude,
        long: pos.coords.longitude,
        alt: pos.coords.altitude,
        speed: pos.coords.speed,
        heading: pos.coords.heading,
      },
      timestamp: pos.timestamp,
    }
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter event fired');
    this._watch = Geolocation.watchPosition();
    this._watch.subscribe((data: Geoposition) => {
      console.log(data);
      this._socket.emit("update location", this.geopos_to_json(data));
    });
    const { endpoint } = this.state;
    this._socket = socketIOClient(endpoint);
    this._socket.on("update locations", (data: any) => this.setState({ response: data }));
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave event fired')
    this._socket.emit("disconnect");
  }

  render() {
    return  (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Cool Title</IonTitle>
          </IonToolbar>
        </IonHeader>
  
        <IonContent>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Locations</IonTitle>
            </IonToolbar>
          </IonHeader>
            <div>
              My cool container
              <p>{ JSON.stringify(this.state.response, null, 2) }</p>
            </div>
        </IonContent>
      </IonPage>
    );
  }
};

export default withIonLifeCycle (Page);
