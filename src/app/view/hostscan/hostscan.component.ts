import { Component, OnInit, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { KeyValue } from '@angular/common';

//service
import { GlobalService } from '../../service/global.service';
import { WebsocketService } from '../../service/websocket.service';

@Component({
    selector: 'app-hostscan',
    templateUrl: './hostscan.component.html',
    styleUrls: ['./hostscan.component.css']
})
export class HostscanComponent implements OnInit, AfterViewInit {
    Object = Object;

    hostscanData: Array<any> = [];
    newHosts: Array<any> = [];
    scanStatus: string;
    scanOutput: string;
    hostscanTrue: boolean = false;
    @Output() hostscanTrueEvent = new EventEmitter<boolean>();
    pingscanTrue: boolean = false;
    pingScanPercent: number = 0;


    //KeyValue orginal order compareFn
    orderOriginal = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
        return 0
    }

    constructor(
        public globalVar: GlobalService,
        private ws: WebsocketService,
    ) {

    }

    startHostscan(): void {
        this.resetVars();
        this.hostscanTrue = !this.hostscanTrue;
        this.hostscanTrueEvent.emit(this.hostscanTrue)
        this.ws.socket.emit('hostscan', JSON.stringify({
            hostscanTrue: this.hostscanTrue,
        }))
    }

    resetVars(): void {
        this.hostscanData.length = 0;
        this.newHosts.length = 0;
        this.scanStatus = "";
        this.scanOutput = "";
    }

    ngOnInit(): void {
        this.ws.socket.on('hostscan', (data) => {
            data = JSON.parse(data);
            this.hostscanTrue = data.state;
            this.hostscanTrueEvent.emit(this.hostscanTrue)
            console.log(`[SCAN STATE] = ${data.state}`)
            this.hostscanData = data.output;
            console.log(data.output)
        });

        this.ws.socket.on('scanstatus', (data) => {
            data = JSON.parse(data);
            if (data.status) {
                this.scanStatus = data.status;
                console.log(data.status);
            }
            if (data.pingscan != undefined) {
                if (data.pingscan == false) {
                    this.newHosts.length = 0;// clear host read for ip mac host
                    this.scanOutput = "";
                }
                this.pingscanTrue = data.pingscan;
            }
            if (data.newHost) {
                this.newHosts.push(data.newHost);
                console.warn(data.newHost);
            }
            if (data.output) {
                this.scanOutput = data.output;
                console.log(data.output);
            }
            if (data.percent != undefined) {
                this.pingScanPercent = data.percent
            }
        })

    }

    ngAfterViewInit(): void {
        console.warn("loaded hostscan.component");
    }

}
