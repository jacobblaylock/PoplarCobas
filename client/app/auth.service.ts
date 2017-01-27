import { Injectable } from '@angular/core';

const users = [
    {"user": "jacob", "password": "jpass"},
    {"user": "cam", "password": "cpass"},
    {"user": "birdie", "password": "birdpass"},
    {"user": "buzz", "password": "beepass"}
]

@Injectable()
export class AuthService {
    currentUser: string;

    constructor() { }

    loginUser(userName: string, password: string): string {
        if(this.currentUser){
            this.currentUser = '';
        }
        let user: any = users.find(u => u.user === userName);
        if(!user){
            return 'User not found';
        }
        if(user) {
            if(user.password === password) {
                this.currentUser = user.user;
                return 'Authorized';
            }else{
                return 'Password invalid';
            }
        }
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

}