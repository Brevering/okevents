import { Component, OnInit } from '@angular/core';
import { UsersService } from '../shared/services/users.service';

@Component({
    selector: 'app-home',
    template: `
        HOME WORKS so ... <mat-slide-toggle>Toggle me!</mat-slide-toggle>
        <p>User: {{ user?.uid }}</p>
        <button (click)="getUser()">LOG USER</button>
		
    `,
})
export class HomeComponent implements OnInit {
    public user = this.us.currentUser;
    constructor(private us: UsersService) {}

    ngOnInit() {}

    getUser() {
        this.us.getUsers().subscribe((r) => console.log(r));
    }
}
