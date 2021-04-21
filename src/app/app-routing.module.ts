import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NetinfoComponent } from './view/netinfo/netinfo.component';
import { OpenportsComponent } from './view/openports/openports.component';
import { ConnectionsComponent } from './view/connections/connections.component';
import { PacketsComponent } from './view/packets/packets.component';
import { HostscanComponent } from './view/hostscan/hostscan.component';
import { LogComponent } from './view/log/log.component';
import { LoginComponent } from './view/login/login.component';

const routes: Routes = [
    { path: '', redirectTo: '/', pathMatch: 'full' },
    { path: 'netinfo', component: NetinfoComponent },
    { path: 'openports', component: OpenportsComponent },
    { path: 'connections', component: ConnectionsComponent },
    { path: 'packets', component: PacketsComponent },
    { path: 'hostscan', component: HostscanComponent },
    { path: 'log', component: LogComponent },
    { path: 'login', component: LoginComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
