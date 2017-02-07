import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

@Component({
    moduleId: module.id,
    templateUrl: 'login.component.html',
    styles: [`
        em { float:right; color:#E05C65; padding-left:10px; }
        .error input {background-color:#E3C3C5;}
    `]
})
export class LoginComponent implements OnInit {
    loginStatus: string;
    loginForm: FormGroup;
    errorMessage: string;
    private userName: FormControl;
    private password: FormControl;

    constructor(private auth: AuthService, private router: Router) { }

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
        if (this.loginForm.valid) {
            this.auth.loginPassport(formValues.userName, formValues.password)
                .subscribe(data => {
                    if(data.user) {
                        this.loginStatus = data.status;
                        this.auth.setCurrentUser(data.user.username);
                    }else{
                        this.auth.reset();
                        this.loginStatus = data.status;
                    }

                },
                    error => this.errorMessage = <any>error,
                    () => {
                        if(this.auth.currentUser) {
                            this.router.navigate(['/batch']);
                        }
                    }
                );
        }
    }
}