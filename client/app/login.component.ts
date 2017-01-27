import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { AuthService } from './auth.service';

@Component({
    moduleId: module.id,
    selector: 'login',
    templateUrl: 'login.component.html',
    styles: [`
        em { float:right; color:#E05C65; padding-left:10px; }
    `]
})
export class LoginComponent implements OnInit {
    loginStatus: string;

    constructor(private _auth: AuthService) { }

    ngOnInit() { }

    login(formValues: any) {
        console.log(formValues);
        this.loginStatus = this._auth.loginUser(formValues.userName, formValues.password);
    }

}