import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class GlobalService {
  currentDate: Date = new Date();
  authorName: String = "Trevor";
  constructor() { }
}
