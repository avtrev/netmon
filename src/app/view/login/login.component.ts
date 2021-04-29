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
    adminExists: boolean = false;

    constructor(
        public globalVar: GlobalService,
        private ws: WebsocketService,
    ) { }

    adminExistsCheck(): void {

        this.ws.socket.emit('login', JSON.stringify({
            type: "adminCheck"
        }))
    }

    addUser(): void {
        this.loginError = ""
        if (this.password != undefined && this.password.length > 0) {
            this.username = 'admin'
            this.ws.socket.emit('login', JSON.stringify({
                type: "addUser",
                username: this.username,
                password: this.password
            }))
        } else {
            this.loginError = "enter valid password"
        }
        this.username = ""
        this.password = ""
    }

    logIn(): void {
        this.ws.socket.emit('login', JSON.stringify({
            type: "login",
            username: this.username,
            password: this.password
        }))
        this.username = "";
        this.password = "";
    }

    ngOnInit(): void {
        this.adminExistsCheck();
        this.ws.socket.on('login', (data) => {
            data = JSON.parse(data);
            switch (data.type) {
                case "adminCheck":
                    this.adminExists = data.adminExists;
                    console.log(`admin exists = ${this.adminExists}`);
                    if (!this.adminExists) {
                        this.username = "admin";
                        this.loginError = "create admin password";
                    }
                    break;
                case "addUser":
                    if (data.adminExists) {
                        console.log(`admin user added`);
                        this.adminExists = data.adminExists;
                    } else {
                        console.log(`admin user not added`);
                    }
                    break;
                case "login":
                    console.log(`loggin match = ${data.match}`);
                    this.logginEvent.emit(data.match);
                    if (!data.match) {
                        this.loginError = "invalid user/pass";
                        this.userInput.nativeElement.focus();//focus user input on invalid
                    }
                    break;


            }

        })
    }

    ngAfterViewInit(): void {
        //this.userInput.nativeElement.focus()//focus user input

    }

}
