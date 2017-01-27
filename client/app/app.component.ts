import { Component, OnInit } from '@angular/core';

import { AuthService } from './auth.service';

@Component({
    moduleId: module.id,
    selector: 'my-app',
    templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit  {

    constructor(private _auth: AuthService) {

    }

    ngOnInit() {

    }


}
