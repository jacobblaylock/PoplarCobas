import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { AuthService } from './auth.service';

@Component({
    moduleId: module.id,
    selector: 'login',
    templateUrl: 'login.component.html',
    styles: [`
        em { float:right; color:#E05C65; padding-left:10px; }
        .error input {background-color:#E3C3C5;}
    `]
})
export class LoginComponent implements OnInit {
    loginStatus: string;
    loginForm: FormGroup;
    private userName: FormControl;
    private password: FormControl;

    constructor(private _auth: AuthService) { }

    ngOnInit() {
        this.userName = new FormControl('', Validators.required);
        this.password = new FormControl('', Validators.required);
        this.loginForm = new FormGroup({
            userName: this.userName,
            password: this.password
        })
    }

    validateUserName(): boolean {
        return this.userName.valid || this.userName.untouched
    }

    validatePassword(): boolean {
        return this.password.valid || this.password.untouched
    }

    login(formValues: any) {
        if(this.loginForm.valid){
            this.loginStatus = this._auth.loginUser(formValues.userName, formValues.password);
        }

    }
}