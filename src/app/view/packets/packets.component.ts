import { Component, OnInit, Inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { KeyValue } from '@angular/common';

//service
import { GlobalService } from '../../service/global.service';
@Component({
  selector: 'app-packets',
  templateUrl: './packets.component.html',
  styleUrls: ['./packets.component.css'],
  providers: [DatePipe],
})
export class PacketsComponent implements OnInit {
  //variables
  Object = Object;
  title: string = "Packets"
  data: any;
  jsonLoaded: Promise<boolean>;
  todayDate: Date = new Date();

  //boolean
  incomingSectionTrue: boolean = true
  unfilteredSectionTrue: boolean = false;
  mainTrue: boolean = true;
  sessionTrue: boolean = false;
  masterTrue: boolean = false;

  //KeyValue orginal order compareFn
  orderOriginal = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return 0
  }

  //constructor
  constructor(
    public global: GlobalService,
    @Inject('nameToken') public name,
    private httpClient: HttpClient
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

  refreshDate(): void {
    this.todayDate = new Date();
  }

  ngOnInit(): void {
  }

}
