import { Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { KeyValue } from '@angular/common';

//import { ResizedEvent } from 'angular-resize-event';

//service
import { GlobalService } from '../../service/global.service';
import { WebsocketService } from '../../service/websocket.service';

@Component({
    selector: 'app-packets',
    templateUrl: './packets.component.html',
    styleUrls: ['./packets.component.css'],
    providers: [DatePipe],
})

export class PacketsComponent implements OnInit, AfterViewInit {
    //variables
    Object = Object;
    title: string = "Packets"
    data: any;
    todayDate: Date = new Date();
    unfilteredData: Array<any> = [];
    incomingData: Array<any> = [];
    sessionData: Array<any> = [];
    masterData: Array<any> = [];
    sessionSet: Set<string> = new Set<string>();
    @ViewChild('targetIncoming') private targetIncoming: ElementRef;
    @ViewChild('targetUnfiltered') private targetUnfiltered: ElementRef;
    @ViewChild('mainTable') private mainTable: ElementRef;
    //boolean
    incomingSectionTrue: boolean = true;
    unfilteredSectionTrue: boolean = false;
    mainTrue: boolean = true;
    sessionTrue: boolean = false;
    masterTrue: boolean = false;
    dumpTrue: boolean = false;
    @Output() dumpTrueEvent = new EventEmitter<boolean>();
    scrollToBottomTrue: boolean = true;
    colorTrue: boolean = true;

    //KeyValue orginal order compareFn
    orderOriginal = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
        return 0
    }

    //constructor
    constructor(
        public globalVar: GlobalService,
        @Inject('nameToken') public name,
        private httpClient: HttpClient,
        private ws: WebsocketService,
        private cdr: ChangeDetectorRef
    ) {

    }

    //methods

    //SELECT SECTION
    selectSection(event: any): void {
        let id: string = event.target.id;
        console.log(id);
        this.incomingSectionTrue = false;
        this.unfilteredSectionTrue = false;
        switch (id) {
            case "incomingBtn":
                this.incomingSectionTrue = true;
                break;
            case "unfilteredBtn":
                this.unfilteredSectionTrue = true;
                break;
            default:
                break;
        }
    }

    //SELECT INCOMING IPV4 TAB
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

    //REFRESH DATE
    refreshDate(): void {
        this.todayDate = new Date();
    }

    /****** SOCKET IO METHODS START ******/

    // GET TCPDUMP SOCKET.IO
    getTcpdump(): void {
        this.dumpTrue = !this.dumpTrue
        this.toggleWheelListener(this.dumpTrue && this.scrollToBottomTrue);//toggle scroll wheel listener
        this.dumpTrueEvent.emit(this.dumpTrue) //output to parent component
        this.ws.socket.emit('tcpdump', {
            dumpTrue: this.dumpTrue,
            incoming: this.incomingSectionTrue,
            unfiltered: this.unfilteredSectionTrue
        })
    }
    /****** SOCKET IO METHODS END ******/

    //CLEAR PACKET DATA OUPUT
    clearData(event: any): void {
        let id: string = event.target.id;
        console.log(id);
        switch (id) {
            case "incomingClearBtn":
                this.incomingData.length = 0;
                break;
            case "unfilteredClearBtn":
                this.unfilteredData.length = 0;
                break;
            default:
                break;
        }
    }

    //SCROLL TO BOTTOM OF DATA OUPUT DISPLAY ON NEW DATA
    scrollToBottom(container: ElementRef): Promise<any> {
        return new Promise(resolve => {
            if (this.scrollToBottomTrue) {
                container.nativeElement.scroll({
                    top: container.nativeElement.scrollHeight,
                    left: 0,
                    behavior: 'smooth'
                });
                resolve("scrolled down");
            } else {
                resolve("scroll disabled");
            }
        })

    }

    toggleScrollToBottom(event: any): void {
        this.scrollToBottomTrue = !this.scrollToBottomTrue;
        this.toggleWheelListener(this.dumpTrue && this.scrollToBottomTrue);//toggle scroll wheel listener
        let id: string = event.target.id;
        switch (id) {
            case "incomingScrollBtn":
                if (this.scrollToBottomTrue) this.scrollToBottom(this.targetIncoming)
                break;
            case "unfilteredScrollBtn":
                if (this.scrollToBottomTrue) this.scrollToBottom(this.targetUnfiltered)
                break;
            default:
                break;
        }
    }

    /** WHEEL LISTENER  START*/
    wheelHandler(): void {
        let element: ElementRef;
        this.incomingSectionTrue ? element = this.mainTable : element = this.targetUnfiltered;
        if (this.dumpTrue && this.scrollToBottomTrue) {
            this.scrollToBottomTrue = false;
        }
        element.nativeElement.removeEventListener('wheel', this._wheelHandler);
        console.error("scroll test");
    }

    _wheelHandler = this.wheelHandler.bind(this)

    toggleWheelListener(check: boolean): void {
        let element: ElementRef;
        this.incomingSectionTrue ? element = this.mainTable : element = this.targetUnfiltered;
        switch (check) {
            case true:
                element.nativeElement.addEventListener('wheel', this._wheelHandler);
                break;
            case false:
                element.nativeElement.removeEventListener('wheel', this._wheelHandler);
                break;
            default:
                break;
        }
    }
    /** WHEEL LISTENER END */

    //DATA METHODS
    addData(dataArray: Array<any>, obj: any): Promise<any> {
        return new Promise(resolve => {
            if (dataArray.length >= 100) {
                console.log("array full");
                dataArray.length = 0;
                console.log(`dataArray length = ${dataArray.length}`)
            }
            dataArray.push(obj);
            resolve("data added")
        })
    }

    loadSessionData(data: any): Promise<any> {
        return new Promise(resolve => {
            if (!this.sessionSet.has(data.remoteip)) {
                this.sessionData.push(data);
                this.sessionSet.add(data.remoteip)
                resolve("new session data added")
            } else {
                resolve("session data exists")
            }
        })
    }

    ngOnInit(): void {

        //initial load master ip db
        this.ws.socket.emit('updateMasterIpDb');

        //update master ip log array
        this.ws.socket.on('updateMasterIpDb', (data) => {
            this.masterData = data;
            console.warn("UPDATING MASTER IP DB DATA")
        })

        this.ws.socket.on('tcpdump', (data) => {
            if (data.state != undefined) console.warn(`[TCPDUMP RUNNING] = ${data.state}`);
            if (this.incomingSectionTrue) { // if incoming dump type
                new Promise(resolve => resolve("start promise"))
                    .then(mes => console.warn(mes))
                    .then(() => { return this.addData(this.incomingData, data.output) })
                    .then(mes => console.log(mes))
                    .then(() => { return this.loadSessionData(data.output) })
                    .then(mes => console.log(mes))
                    .then(() => { return this.scrollToBottom(this.targetIncoming) })
                    .then(mes => console.log(mes))
                    //.then(() => console.log(data.output)) //console.log tcpdump object
                    .finally(() => console.warn("end promise"))

            } else if (this.unfilteredSectionTrue) { // if unfiltered dump type
                new Promise(resolve => resolve("start promise"))
                    .then(mes => console.warn(mes))
                    .then(() => { return this.addData(this.unfilteredData, data.output) })
                    .then(mes => console.log(mes))
                    .then(() => { return this.scrollToBottom(this.targetUnfiltered) })
                    .then(mes => console.log(mes))
                    // .then(() => console.log(data.output)) // console.log tcpdump output
                    .finally(() => console.warn("end promise"))
            }

        })
    }

    ngAfterViewInit() {
        console.warn("loaded packets.component");
        // this.toggleWheelListener(this.dumpTrue && this.scrollToBottomTrue);
    }

}
