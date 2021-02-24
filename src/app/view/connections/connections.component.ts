import { Component, OnInit, Inject } from '@angular/core';
import { DatePipe, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { KeyValue } from '@angular/common';
import { Observable, ReplaySubject } from 'rxjs'

//service
import { GlobalService } from '../../service/global.service';
import { $, promise } from 'protractor';
import { resolve } from 'dns';
import { RaceOperator } from 'rxjs/internal/observable/race';
import { build$$ } from 'protractor/built/element';
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
  baseURL: string = this.globalVar.backendBaseURL;
  searchText: string = "";
  filterText: string = "";
  //boolean vars
  mainTrue: boolean = true;
  sessionTrue: boolean = false;
  masterTrue: boolean = false;
  listenTrue: boolean = false;
  ipv4True: boolean = false;
  ipv6True: boolean = false;
  tableHeaders: object = [
    "service",
    "user",
    "ipv",
    "locaip",
    "localport",
    "remoteip",
    "remoteport"
  ];


  //KeyValue orginal order compareFn
  orderOriginal = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return 0
  }

  //constructor
  constructor(
    public globalVar: GlobalService,
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
  //toggle table filters
  toggleFilter(event: any): void {
    let id: string = event.target.id;
    console.log(id);

    switch (id) {
      case "ipv4Btn":
        if (this.ipv6True) this.ipv6True = false;
        this.ipv4True = !this.ipv4True;
        if (this.ipv4True) this.filterText = "ipv4";
        else this.filterText = "";
        break;
      case "ipv6Btn":
        if (this.ipv4True) this.ipv4True = false;
        this.ipv6True = !this.ipv6True;
        if (this.ipv6True) this.filterText = "ipv6";
        else this.filterText = "";
        break;
      default:
        break;
    }
  }



  refreshDate(): void {
    this.todayDate = new Date();
  }
  /*
  // load main data non promise
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
  //load main data - promise
  loadMainData(): Promise<any> {
    return new Promise((resolve) => {
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
  }
  /*
  //load master data non promise
  loadMasterData(): void {
    this.http.get<Observable<Object>>(`${this.baseURL}/connections-master`)
      .subscribe((data: any) => {
        this.masterData = data;
        console.log(this.masterData);
        this.masterLoaded = Promise.resolve(true);
      })
  }
  */
  //load master data - promise
  loadMasterData(): Promise<any> {
    return new Promise((resolve) => {
      this.http.get<Observable<Object>>(`${this.baseURL}/connections-master`)
        .toPromise()
        .then((data) => {
          this.masterData = data;
          //console.log(this.masterData);
          this.masterLoaded = Promise.resolve(true);
          resolve("master data loaded");
        })
    })
  }
  //load session data
  loadSessionData(data: any): void {
    for (let d of data) {
      if (!this.sessionSet.has(d.service)) {
        this.sessionData.push(d);
      }
      this.sessionSet.add(d.service)
    }
  }
  //clear session data
  clearSessionData(): void {
    this.sessionData = [];
    this.sessionSet.clear()
  }
  //update data - promise
  update(): Promise<any> {
    return new Promise(resolve => {
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
  }
  // listen button action event
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
                console.log(`poll count ${++count}`);
                poll();
              })
          }, 1000)
        }
      }
      poll();


    }

  }

  ngOnInit(): void {
    this.update();
    /*
    window.onscroll = () => {
      console.log(`${window.scrollX} ${window.scrollY}`)
    }
    */
  }

}
