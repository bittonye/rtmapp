import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, withIonLifeCycle } from '@ionic/react';
import { Geolocation, Geoposition } from '@ionic-native/geolocation'
import React from 'react';
import { RouteComponentProps } from 'react-router';
import socketIOClient from 'socket.io-client';
import { compute_route, precompute_geoposition, ComputedPosition } from "../utils/locationUtils";
import './Page.css';

interface PageState {
  result: number;
  endpoint: string;
} 

class Page extends React.Component<RouteComponentProps<{ name: string; }>, PageState> {
  
  private _watch: any;
  private _socket: any;

  constructor(props: any) {
    super(props);

    this.state = {
      result: 5,
      endpoint: "https://places-updates.herokuapp.com"
    };
  }

  geopos_to_json(pos: Geoposition) {
    return precompute_geoposition(pos);
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
    this._socket.on("update locations", (data: Object) => {
      const values = Object.values(data);
      this.setState({
        result: compute_route(values[0], values[1])
      });
    });
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
              <p>{ JSON.stringify(this.state.result, null, 2) }</p>
            </div>
        </IonContent>
      </IonPage>
    );
  }
};

export default withIonLifeCycle (Page);
