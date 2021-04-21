import { Component, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';

//local imports
import { GlobalService } from './service/global.service';
import { NetinfoComponent } from './view/netinfo/netinfo.component';
import { OpenportsComponent } from './view/openports/openports.component';
import { ConnectionsComponent } from './view/connections/connections.component';
import { LoginComponent } from './view/login/login.component';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
    title: String = 'netmon';
    currentDate: Date = new Date();
    myName: String;
    menuBtnTrue: Array<boolean> = [true, false, false, false, false];
    @ViewChild(NetinfoComponent) netinfo: NetinfoComponent;
    @ViewChild(OpenportsComponent) openports: OpenportsComponent;
    @ViewChild(ConnectionsComponent) connections: ConnectionsComponent;
    @ViewChild(LoginComponent) login: LoginComponent;
    connectionsActive: boolean;
    packetsActive: boolean;
    hostscanActive: boolean;
    loggedIn: boolean = false;
    constructor(
        public globalVar: GlobalService,
        @Inject('nameToken') private name

    ) {
        this.myName = this.name;

    }
    selectMenuBtn(index: number): void {
        for (let i in this.menuBtnTrue) {
            this.menuBtnTrue[i] = false;
        }
        this.menuBtnTrue[index] = true;
    }

    refreshNetinfo(): void {
        this.netinfo.refresh()
        console.log("refresh netinfo clicked")
    }

    refreshOpenPorts(): void {

    }

    refreshChild(childName: string): void {
        switch (childName) {
            case "netinfo":
                this.netinfo.refresh();
                break;
            case "openports":
                this.openports.refresh();
                break;
            case "connections":
                if (!this.connections.listenTrue) this.connections.update();
            default:
                break;
        }
    }


    //exec child component function after view loaded
    ngAfterViewInit() {
        console.warn("loaded app.component");
    }
}
