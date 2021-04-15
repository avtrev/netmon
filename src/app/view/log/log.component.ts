import { Component, OnInit, AfterViewInit } from '@angular/core';
import { KeyValue } from '@angular/common';

//service
import { GlobalService } from '../../service/global.service';
import { WebsocketService } from '../../service/websocket.service';
@Component({
    selector: 'app-log',
    templateUrl: './log.component.html',
    styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit, AfterViewInit {

    logData: Array<any> = [];
    logButtonTrue: Array<boolean> = [true, false, false, false];
    searchText: string = "";

    orderOriginal = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
        return 0
    }
    constructor(
        public globalVar: GlobalService,
        private ws: WebsocketService,
    ) { }

    togLogBtn(index: number) {
        for (let i in this.logButtonTrue) {
            this.logButtonTrue[i] = false;
        }
        this.logButtonTrue[index] = true;
    }

    isArray(obj): boolean {
        return obj instanceof Array;
    }

    getLogData(tableType: string): void {
        console.log("retrieving log")
        this.logData.length = 0;
        this.ws.socket.emit('log', JSON.stringify({
            tableType: tableType
        }))
    }

    ngOnInit(): void {
        this.getLogData("master")
        this.ws.socket.on('log', (data) => {
            data = JSON.parse(data);
            this.logData = data.tableData
        })
    }

    ngAfterViewInit(): void {
        console.warn("loaded log.component");
    }

}
