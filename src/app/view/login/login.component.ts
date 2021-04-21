import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';

//service
import { GlobalService } from '../../service/global.service';
import { WebsocketService } from '../../service/websocket.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    @Input() loggedIn: boolean;
    @Output() logginEvent = new EventEmitter<boolean>();
    username: string;
    password: string;
    loginError: string;
    @ViewChild('userInput') userInput: ElementRef;

    constructor(
        public globalVar: GlobalService,
        private ws: WebsocketService,
    ) { }

    logIn(): void {
        this.ws.socket.emit('login', JSON.stringify({
            username: this.username,
            password: this.password
        }))
        this.username = "";
        this.password = "";
    }

    ngOnInit(): void {
        this.ws.socket.on('login', (data) => {
            data = JSON.parse(data);
            console.log(`loggin match = ${data}`)
            this.logginEvent.emit(data)
            if (!data) {
                this.loginError = "invalid user/pass"
                this.userInput.nativeElement.focus()//focus user input on invalid
            }
        })
    }

    ngAfterViewInit(): void {
        this.userInput.nativeElement.focus()//focus user input
    }

}
