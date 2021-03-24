import { Component, OnInit } from '@angular/core';
import { KeyValue } from '@angular/common';

//service
import { GlobalService } from '../../service/global.service';
import { WebsocketService } from '../../service/websocket.service';
@Component({
    selector: 'app-log',
    templateUrl: './log.component.html',
    styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit {

    logData: Array<any> = [];

    orderOriginal = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
        return 0
    }
    constructor(
        public globalVar: GlobalService,
        private ws: WebsocketService,
    ) { }

    isArray(obj): boolean {
        return obj instanceof Array;
    }

    getLogData(tableType: string): void {
        console.log("clicked get log button")
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

}
