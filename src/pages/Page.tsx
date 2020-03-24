import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, withIonLifeCycle } from '@ionic/react';
import { IonList, IonItem, IonLabel, IonInput, IonToggle, IonRadio, IonCheckbox, IonItemSliding, IonItemOption, IonItemOptions } from '@ionic/react';
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
  private _imei: any;

  constructor(props: any) {
    super(props);

    this.state = {
      result: [{
        score: 5,
        distance: 0,
      }],
      response: 'No response',
      endpoint: "https://places-updates.herokuapp.com"
    };
  }

  geopos_to_json(pos: Geoposition) {
    return precompute_geoposition(pos);
  }

  compute_all_routes(positions: any) {
    const my_pos = positions[this._imei];
    if (!my_pos) {
      return [];
    }

    delete positions[this._imei];
    let res = [];
    for (const key in positions) {
      if (positions.hasOwnProperty(key)) {
        const pos = positions[key];
        res.push({
          user_id: key,
          ...compute_route(my_pos, pos),
        });
      }
    }
    return res;
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter event fired');
    this._imei = 0;
    /* Get device id */
    UniqueDeviceID.get().then((uuid: any) => {
      console.log("Got imei: " + uuid);
      this._socket.emit("update id", uuid);
      this._imei = uuid;
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
      this.setState({
        response: JSON.stringify(data, null, 2),
        result: this.compute_all_routes(data)
      });
    });
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave event fired')
    this._socket.emit("disconnect");
  }

  render() {
    let list_items = this.state.result.map((pos: any) => {
      return (
        <IonItem key={pos.user_id}>
          <IonLabel>
            <h3>id: {pos.user_id}</h3>
            <h3>distance: {pos.distance}</h3>
            <h3>score: {pos.score}</h3>
          </IonLabel>
        </IonItem>
      )
    });
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
        <IonList>
          {list_items}   
        </IonList>
        </IonContent>
      </IonPage>
    );
  }
};

export default withIonLifeCycle (Page);
