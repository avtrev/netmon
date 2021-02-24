import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class GlobalService {
  currentDate: Date = new Date();
  authorName: string = "Trevor";
  backendBaseURL: string = "https://127.0.0.1:5000"
  constructor() { }
}
