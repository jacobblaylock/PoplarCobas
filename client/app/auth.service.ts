import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

const users = [
    { "user": "jacob", "password": "jpass" },
    { "user": "cam", "password": "cpass" },
    { "user": "birdie", "password": "birdpass" },
    { "user": "buzz", "password": "beepass" }
]

@Injectable()
export class AuthService {
    currentUser: string;

    constructor(private http:Http) { }

    loginUser(userName: string, password: string): string {
        if (this.currentUser) {
            this.currentUser = '';
        }
        let user: any = users.find(u => u.user === userName);
        if (!user) {
            return 'User not found';
        }
        if (user) {
            if (user.password === password) {
                this.currentUser = user.user;
                return 'Authorized';
            } else {
                return 'Password invalid';
            }
        }
    }

    reset() {
        if(this.currentUser) {this.currentUser = ''};
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    setCurrentUser(username: string){
        this.currentUser = username
    }

    loginPassport(userName: string, password: string) {
        let body = {username: userName, password: password }
        return this.http.post('/auth/signIn',body)
            .map((response: Response) => response.json());
    }

    private handleError (error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        //console.error('handleError:  ' + error);
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }

        return Observable.throw(errMsg);
    }

}