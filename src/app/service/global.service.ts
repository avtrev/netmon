import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class GlobalService {
  currentDate: Date = new Date();
  authorName: string = "Trevor";
  backendBaseURL: string = "http://192.168.0.11:5000"
  constructor() { }
}
