import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';





@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: String = 'netmon';
  currentDate: Date = new Date();
  myName: String;

  constructor(
    @Inject('nameToken') private name
  ) {
    this.myName = this.name;
  }
}
