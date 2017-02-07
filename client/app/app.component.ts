import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

@Component({
    moduleId: module.id,
    selector: 'my-app',
    templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit  {

    constructor(private auth: AuthService, private router: Router) {

    }

    ngOnInit() {

    }


    logout() {
        this.auth.reset();
        this.router.navigate(['/login']);
    }

}
