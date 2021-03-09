import { Component, OnInit, Inject } from '@angular/core';
import { DatePipe, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { KeyValue } from '@angular/common';
import { Observable, ReplaySubject } from 'rxjs'

//service
import { GlobalService } from '../../service/global.service';
import { WebsocketService } from '../../service/websocket.service';
import { $, promise } from 'protractor';
import { resolve } from 'dns';
import { RaceOperator } from 'rxjs/internal/observable/race';
import { build$$ } from 'protractor/built/element';
import { on } from 'events';
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
    //mainData: Observable<any>;//change to array for socket io
    mainData: Array<any> = [];// for socket io
    sessionSet: Set<string> = new Set<string>();
    sessionData: Array<any> = [];
    //masterData: Observable<any>;//changed to Array<any> for socket io
    masterData: Array<any> = [];
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
    loopInterval = 1;


    //KeyValue orginal order compareFn
    orderOriginal = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
        return 0
    }

    //constructor
    constructor(
        public globalVar: GlobalService,
        @Inject('nameToken') public name,
        private http: HttpClient,
        private ws: WebsocketService,
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
    //http request version
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
    */

    //socket io version
    loadConnectionsData(): Promise<any> {
        return new Promise((resolve) => {
            this.ws.socket.emit('connections', JSON.stringify({
                listenTrue: this.listenTrue,
                loopInterval: this.loopInterval,
                connectionsInit: "send connection data",
            }))
            resolve("request connections data")
        })
    }

    /*
    //http request version 
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
    */

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
            this.loadConnectionsData()
                .then(mes => {
                    console.log(mes);
                    resolve("update complete");
                })
        })
    }
    // listen button action event
    /*
    //http request version
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
    */
    listen(): void {
        this.listenTrue = !this.listenTrue;
        console.log(`listenTrue = ${this.listenTrue}`)
        this.update();

    }

    ngOnInit(): void {
        this.update();
        this.ws.socket.on('connections', (data) => {
            this.refreshDate();

            data = JSON.parse(data);



            this.mainData.length = 0;
            this.mainData = data.mainData;
            console.warn("main connections data")

            console.warn("session connections data")
            this.loadSessionData(this.mainData)

            this.masterData.length = 0;
            this.masterData = data.masterData
            console.warn("master connections data")

            this.jsonLoaded = Promise.resolve(true);//don't load tables until jsonLoaded 
        })
        /*
        window.onscroll = () => {
          console.log(`${window.scrollX} ${window.scrollY}`)
        }
        */
    }

}
