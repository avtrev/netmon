import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

//service
import { GlobalService } from '../../service/global.service';


@Component({
    selector: 'app-netinfo',
    templateUrl: './netinfo.component.html',
    styleUrls: ['./netinfo.component.css'],
    providers: [DatePipe],
})
export class NetinfoComponent implements OnInit, AfterViewInit {

    tempInfo: object = [
        { host: "Trevors-MacBook-Pro.local" },
        { ether: "8c:85:90:ad:cc:1b" },
        { ipv4: "192.168.0.11" },
        { ipv6: "fe80::1855:298d:4546:5f11" },
        { broadcast: "192.168.0.255" }
    ];

    data: Observable<Object>;
    todayDate: Date;
    baseURL: string = this.globalVar.backendBaseURL

    constructor(
        public globalVar: GlobalService,
        @Inject('nameToken') public name,
        @Inject('currentDateToken') public currentDate,
        private http: HttpClient
    ) {
        this.todayDate = globalVar.currentDate;
    }

    //methods
    refresh(): void {
        this.todayDate = new Date();
        this.getNetinfo();
    }

    getNetinfo(): void {
        this.http.get<Observable<Object>>(`${this.baseURL}/netinfo`)
            .subscribe(jsonData => {
                this.data = jsonData;
                console.warn("recieved netinfo data")
                //console.log(this.data)
            })
    }

    returnDate(): Date {
        return new Date();
    }

    ngOnInit(): void {
        // this.http.get<Object>('../../assets/data/json/netinfo.json')
        //   .subscribe(jsonData => {
        //     this.data = jsonData;
        //   })
        this.todayDate = new Date();
        this.getNetinfo();
    }

    ngAfterViewInit() {
        console.warn("loaded netinfo.component");
    }

}
