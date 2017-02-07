import { CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable()
export class LoginActivatorService implements CanActivate {

    constructor(private auth: AuthService, private router: Router) { }

    canActivate() {
        if(!this.auth.currentUser){
            this.router.navigate(['/login']);
        }
        return !!this.auth.currentUser;
    }
}