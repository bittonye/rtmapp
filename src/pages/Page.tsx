import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, withIonLifeCycle } from '@ionic/react';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { UniqueDeviceID } from "@ionic-native/unique-device-id";
import React from 'react';
import { RouteComponentProps } from 'react-router';
import socketIOClient from 'socket.io-client';
import { compute_route, precompute_geoposition, ComputedPosition } from "../utils/locationUtils";
import './Page.css';

interface PageState {
  result: any;
  response: string,
  endpoint: string;
} 

class Page extends React.Component<RouteComponentProps<{ name: string; }>, PageState> {
  
  private _watch: any;
  private _socket: any;

  constructor(props: any) {
    super(props);

    this.state = {
      result: {
        score: 5,
        distance: 0,
      },
      response: 'No response',
      endpoint: "https://places-updates.herokuapp.com"
    };
  }

  geopos_to_json(pos: Geoposition) {
    return precompute_geoposition(pos);
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter event fired');

    /* Get device id */
    UniqueDeviceID.get().then((uuid: any) => {
      this._socket.emit("update id", uuid);
    });

    /* Init location data */
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
        response: JSON.stringify(data, null, 2),
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

              <h2>
                Result from server
              </h2>
              <p>
                { this.state.response }
              </p>
            </div>
        </IonContent>
      </IonPage>
    );
  }
};

export default withIonLifeCycle (Page);
