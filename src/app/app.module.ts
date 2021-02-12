import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';//needed for [(ngModel)]
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationComponent } from './navigation/navigation.component';
import { NetinfoComponent } from './view/netinfo/netinfo.component';
import { OpenportsComponent } from './view/openports/openports.component';
import { ConnectionsComponent } from './view/connections/connections.component';
import { PacketsComponent } from './view/packets/packets.component';
import { LogComponent } from './view/log/log.component';

//service

//global variables
const name: String = "Trevor";
const currentDate: Date = new Date();

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    NetinfoComponent,
    OpenportsComponent,
    ConnectionsComponent,
    PacketsComponent,
    LogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    { provide: 'nameToken', useValue: name },
    { provide: 'currentDateToken', useValue: currentDate },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
