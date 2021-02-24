import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client/dist/socket.io';

import { GlobalService } from './global.service';


@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  socket: any;
  readonly uri: string;
  //readonly uri: string = 'https://127.0.0.1:5000'

  constructor(public globalVar: GlobalService,) {
    this.uri = globalVar.backendBaseURL;
    //this.socket = io(this.uri);
    this.socket = io(this.uri, {
      rejectUnauthorized: false,
      //rememberUpgrade: false
    });

  }


  listen(eventName: string) {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data) => {
        subscriber.next(data);
      })
    })
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  send(data: any) {
    this.socket.send(data);
  }

}