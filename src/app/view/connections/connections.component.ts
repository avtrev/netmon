import { Component, OnInit, Inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { KeyValue } from '@angular/common';
import { Observable, ReplaySubject } from 'rxjs'

//service
import { GlobalService } from '../../service/global.service';
import { promise } from 'protractor';
import { resolve } from 'dns';
import { RaceOperator } from 'rxjs/internal/observable/race';
@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.css'],
  providers: [DatePipe],
})

export class ConnectionsComponent implements OnInit {
  //variables
  Object = Object;
  title: string = "Connections"
  mainData: Observable<any>;
  sessionSet: Set<string> = new Set<string>();
  sessionData: Array<any> = [];
  masterData: Observable<any>;
  jsonLoaded: Promise<boolean>;
  masterLoaded: Promise<boolean>;
  todayDate: Date = new Date();
  baseURL: string = this.global.backendBaseURL;
  //boolean vars
  mainTrue: boolean = true;
  sessionTrue: boolean = false;
  masterTrue: boolean = false;
  listenTrue: boolean = false;

  //KeyValue orginal order compareFn
  orderOriginal = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return 0
  }

  //constructor
  constructor(
    public global: GlobalService,
    @Inject('nameToken') public name,
    private http: HttpClient
  ) {

  }

  //methods
  selectTableTab(event: any): void {
    let id: string = event.target.id;
    console.log(id);
    this.mainTrue = false;
    this.sessionTrue = false;
    this.masterTrue = false;
    switch (id) {
      case "mainBtn":
        this.mainTrue = true;
        break;
      case "sessionBtn":
        this.sessionTrue = true;
        break;
      case "masterBtn":
        this.masterTrue = true;
        break;
      default:
        break;
    }
  }

  refreshDate(): void {
    this.todayDate = new Date();
  }
  /*
  // GET without promise
  loadMainData(): void {
    this.http.get<Observable<Object>>(`${this.baseURL}/connections`)
      .subscribe((data: any) => {
        this.mainData = data;
        this.loadSessionData(this.mainData)
        console.log(this.mainData);
        this.jsonLoaded = Promise.resolve(true);
      })
  }
  */

  loadMainData(): Promise<any> {
    let promise = new Promise((resolve) => {
      this.http.get<Observable<Object>>(`${this.baseURL}/connections`)
        .toPromise()
        .then((data) => {
          this.mainData = data;
          this.loadSessionData(this.mainData)
          //console.log(this.mainData);
          this.jsonLoaded = Promise.resolve(true);
          resolve("main data loaded");
        })
    })
    return promise;
  }
  /*
  loadMasterData(): void {
    this.http.get<Observable<Object>>(`${this.baseURL}/connections-master`)
      .subscribe((data: any) => {
        this.masterData = data;
        console.log(this.masterData);
        this.masterLoaded = Promise.resolve(true);
      })
  }
  */

  loadMasterData(): Promise<any> {
    let promise = new Promise((resolve) => {
      this.http.get<Observable<Object>>(`${this.baseURL}/connections-master`)
        .toPromise()
        .then((data) => {
          this.masterData = data;
          //console.log(this.masterData);
          this.masterLoaded = Promise.resolve(true);
          resolve("master data loaded");
        })
    })
    return promise;

  }

  loadSessionData(data: any): void {
    for (let d of data) {
      if (!this.sessionSet.has(d.service)) {
        this.sessionData.push(d);
      }
      this.sessionSet.add(d.service)
    }
  }

  update(): Promise<any> {
    let promise = new Promise(resolve => {
      this.refreshDate();
      this.loadMainData()
        .then(mes => {
          console.log(mes);
          return this.loadMasterData();
        })
        .then(mes => {
          console.log(mes);
          resolve("update complete");
        })
    })
    return promise;
  }

  listen(): void {
    this.listenTrue = !this.listenTrue;
    if (this.listenTrue) {
      let count = 0;
      var poll = () => {
        if (this.listenTrue) {
          setTimeout(() => {
            this.update()
              .then(mes => {
                console.log(mes);
                console.log(`poll count ${++count}`)
                poll();
              })
          }, 1000)
        }
      }
      poll();


    }

  }



  ngOnInit(): void {
    this.update()
  }

}
