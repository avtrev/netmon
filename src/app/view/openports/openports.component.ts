import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { KeyValue } from '@angular/common';
import { Observable } from 'rxjs'


//service
import { GlobalService } from '../../service/global.service';
@Component({
    selector: 'app-openports',
    templateUrl: './openports.component.html',
    styleUrls: ['./openports.component.css'],
    providers: [DatePipe],
})

export class OpenportsComponent implements OnInit, AfterViewInit {
    //variables
    Object = Object;

    title: string = "OpenPorts"
    data: Observable<Object>;
    jsonLoaded: Promise<boolean>;
    todayDate: Date = new Date();
    baseURL: string = this.globalVar.backendBaseURL

    //KeyValue compareFn
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
    refreshDate(): void {
        this.todayDate = new Date();
    }

    loadJson(): void {
        //this.http.get<Object>('../../assets/data/json/openports.json')
        this.http.get<Observable<Object>>(`${this.baseURL}/openports`)
            .subscribe((data: any) => {
                this.data = data;
                console.warn("recieved openports data")
                //console.log(this.data);
                this.jsonLoaded = Promise.resolve(true);
            })
    }

    refresh(): void {
        this.refreshDate();
        this.loadJson();
    }

    ngOnInit(): void {
        this.loadJson();
    }

    ngAfterViewInit(): void {
        console.warn("loaded openports.component");
    }

}
