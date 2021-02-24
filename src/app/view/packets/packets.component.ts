import { Component, OnInit, Inject, ViewChild, ElementRef, HostListener, Directive, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { KeyValue } from '@angular/common';

import { ResizedEvent } from 'angular-resize-event';

//service
import { GlobalService } from '../../service/global.service';
import { WebsocketService } from '../../service/websocket.service';
import { Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { ThisReceiver } from '@angular/compiler';

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
  jsonLoaded: Promise<boolean>;
  todayDate: Date = new Date();
  unfilteredData: Array<any> = [];
  incomingData: Array<any> = [];
  sessionData: Array<any> = [];
  masterData: Array<any> = [];
  sessionSet: Set<string> = new Set<string>();
  @ViewChild('targetIncoming') private targetIncoming: ElementRef;
  @ViewChild('targetUnfiltered') private targetUnfiltered: ElementRef;
  @ViewChild('packetsHeader') private packetsHeader: ElementRef;
  @ViewChild('incomingHeader') private incomingHeader: ElementRef;
  @ViewChild('mainTabHeader') private mainTabHeader: ElementRef;
  @ViewChild('unfilterHeader') private unfilterHeader: ElementRef;
  @ViewChild('incomingTableHead') private incomingTableHead: ElementRef;
  @ViewChild('rip') private rip: ElementRef;
  @ViewChild('rp') private rp: ElementRef;
  @ViewChild('lip') private lip: ElementRef;
  @ViewChild('lp') private lp: ElementRef;
  thw: Array<any> = ['0px', '0px', '0px', '0px'];
  temp: any = '100px'
  //boolean
  incomingSectionTrue: boolean = true
  unfilteredSectionTrue: boolean = false;
  mainTrue: boolean = true;
  sessionTrue: boolean = false;
  masterTrue: boolean = false;
  dumpTrue: boolean = false;
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

  //REFRESH DATA
  refreshDate(): void {
    this.todayDate = new Date();
  }

  /****** SOCKET IO METHODS START ******/
  //SEND MESSAGE SOCKET.IO
  sendMessage(): void {
    this.ws.socket.send("this is the new send message");
    //this.ws.send("send this data")
    //this.ws.emit("message", { "data": "this is the message data" });
    // this.ws.listen('message').subscribe((data) => {
    //   console.log(data);
    // })
  }

  // GET TCPDUMP SOCKET.IO
  getTcpdump(): void {
    this.dumpTrue = !this.dumpTrue
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
        this.incomingData = [];
        break;
      case "unfilteredClearBtn":
        this.unfilteredData = [];
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

  print(text: string): void {
    console.log(text);
  }

  //
  getSize(container: ElementRef): any {
    let width = container.nativeElement.offsetWidth;
    let height = container.nativeElement.offsetHeight;
    console.log(`${container.nativeElement.id} width = ${width} height = ${height}`)
    return { width: width, height: height }
  }

  //HELPERS FOR TABLE HEADER SIZING
  getWidth(container: ElementRef): any {
    let width = container.nativeElement.offsetWidth;
    return width
  }

  //HELPER FOR DATA OUTPUT DISPLAY SIZE
  setSize(): void {
    let aHeader = document.querySelector('#appHeader').clientHeight;
    let pHeader = this.packetsHeader.nativeElement.offsetHeight;

    //incoming heights
    let iHeader = this.incomingHeader.nativeElement.offsetHeight;
    let mHeader = this.mainTabHeader.nativeElement.offsetHeight;
    let itHeader = this.incomingTableHead.nativeElement.offsetHeight;
    let targetIn = this.targetIncoming.nativeElement;

    //unfiltered heights
    let uHeader = this.unfilterHeader.nativeElement.offsetHeight;
    let targetUn = this.targetUnfiltered.nativeElement;

    let win = window.innerHeight;

    targetIn.style.height = (win - (aHeader + pHeader + iHeader + mHeader + itHeader + 10)) + "px"
    targetUn.style.height = (win - (aHeader + pHeader + uHeader + 10)) + "px"
  }

  onResize(event) {
    //console.log(`event height = ${event.target.innerHeight}`);
    //console.log(`window height = ${window.innerHeight}`);
    //this.setSize();
  }

  changeWidth(width: number): void {
    this.temp = width;
    console.log(this.temp)
  }

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


  matchSize(event: ResizedEvent, toChange: any) {
    let id = event.element.nativeElement.id;
    console.log(`${id} ${event.newWidth}`);
    toChange = `${event.newWidth}px`;
    console.log(`${toChange}`)
    console.log(this.thw[0])
    // switch (id) {
    //   case 'rip':
    //     this.thw[0] = `${event.newWidth}px`;
    //     break;
    //   case 'rp':
    //     this.thw[1] = `${event.newWidth}px`;
    //     break;
    //   case 'lip':
    //     this.thw[2] = `${event.newWidth}px`;
    //     break;
    //   case 'lp':
    //     this.thw[3] = `${event.newWidth}px`;
    //     break;
    //   default:
    //     break;
    // }
    //console.log(event.newHeight);
  }

  returnSize(event: ResizedEvent): any {
    console.log(`source size = ${event.newWidth}px`);
    return `${event.newWidth}px`;
  }

  ngOnInit(): void {
    this.ws.listen('connection event').subscribe((data) => {
      console.log(data);
    })
    this.ws.socket.onAny((event) => {
      //console.log(`recieved event = ${event}`)
    })

    this.ws.socket.on('message', (data) => {
      console.log(`message data = ${data}`)
    })

    this.ws.socket.on('tcpdump', (data) => {
      if (data.state != undefined) console.log(data.state);
      if (this.incomingSectionTrue) {
        new Promise(resolve => resolve("start promise"))
          .then(mes => console.warn(mes))
          .then(() => { return this.addData(this.incomingData, data.output) })
          .then(mes => console.log(mes))
          .then(() => { return this.loadSessionData(data.output) })
          .then(mes => console.log(mes))
          .then(() => { return this.scrollToBottom(this.targetIncoming) })
          .then(mes => console.log(mes))
          .then(() => console.log(data.output))
          .finally(() => console.warn("end promise"))

      } else if (this.unfilteredSectionTrue) {
        new Promise(resolve => resolve("start promise"))
          .then(mes => console.warn(mes))
          .then(() => { return this.addData(this.unfilteredData, data.output) })
          .then(mes => console.log(mes))
          .then(() => { return this.scrollToBottom(this.targetUnfiltered) })
          .then(mes => console.log(mes))
          .then(() => console.log(data.output))
          .finally(() => console.warn("end promise"))
      }

    })

    //update master ip log array
    this.ws.socket.on('updateMasterIpDb', (data) => {
      this.masterData = data;
      console.warn("UPDATING MASTER IP DB DATA")
    })
    //initial load master ip db
    this.ws.socket.emit('updateMasterIpDb');

  }

  ngAfterViewInit() {
    console.log('after view');
    //this.setSize();
    console.log(this.getWidth(this.rip))

  }

  //not used at moment
  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  //not used at moment
  ngAfterContentChecked() {
    this.cdr.detectChanges();
  }


}
