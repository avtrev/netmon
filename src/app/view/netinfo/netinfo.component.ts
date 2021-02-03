import { Component, OnInit, Inject } from '@angular/core';
//import { DatePipe } from '@angular/common';

//service
import { GlobalService } from '../../service/global.service';


@Component({
  selector: 'app-netinfo',
  templateUrl: './netinfo.component.html',
  styleUrls: ['./netinfo.component.css'],
  //providers: [DatePipe],
})
export class NetinfoComponent implements OnInit {
  tempInfo: object = [
    { host: "Trevors-MacBook-Pro.local" },
    { ether: "8c:85:90:ad:cc:1b" },
    { ipv4: "192.168.0.11" },
    { ipv6: "fe80::1855:298d:4546:5f11" },
    { broadcast: "192.168.0.255" }
  ];
  data: object = this.tempInfo;


  constructor(
    public global: GlobalService,
    @Inject('nameToken') public name,
    @Inject('currentDateToken') public currentDate
  ) {

  }

  ngOnInit(): void {
  }

}
