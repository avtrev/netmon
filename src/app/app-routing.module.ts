import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NetinfoComponent } from './view/netinfo/netinfo.component';
import { OpenportsComponent } from './view/openports/openports.component';
import { ConnectionsComponent } from './view/connections/connections.component';
import { PacketsComponent } from './view/packets/packets.component';
import { LogComponent } from './view/log/log.component';

const routes: Routes = [
  { path: '', redirectTo: '/netinfo', pathMatch: 'full' },
  { path: 'netinfo', component: NetinfoComponent },
  { path: 'openports', component: OpenportsComponent },
  { path: 'connections', component: ConnectionsComponent },
  { path: 'packets', component: PacketsComponent },
  { path: 'log', component: LogComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
