import { Component, OnInit, Input } from '@angular/core';

import { GlobalService } from '../service/global.service';

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.css'],
    inputs: []
})
export class NavigationComponent implements OnInit {
    @Input() name: String;
    @Input() menu: Array<boolean>;
    constructor(
        public globalVar: GlobalService,
    ) {

    }

    selectMenuBtn(index: number): void {
        for (let i in this.menu) {
            this.menu[i] = false;
        }
        this.menu[index] = true;
    }

    ngOnInit(): void {
    }

}
