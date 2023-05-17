import { Component, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from './shared/models/user';
import { routes } from './shared/routes';
import { AuthService } from './shared/services/auth.service';

const classes = {
    ['home']: 'home',
    ['sign-in']: 'sign-in',
    ['course-list']: 'course-list',
    ['test']: 'test',
    ['register-user']: 'register-user',
    ['profile']: 'profile',
    ['admin']: 'admin',
};

const icons = {
    home: 'home',
    ['course-list']: 'home',
    ['sign-in']: 'person',
    test: 'person',
    ['register-user']: 'person',
    profile: 'person',
    ['admin']: 'person',
};

const labels = {
    home: 'Home page',
    ['sign-in']: 'Sign In page',
    test: 'test page',
    ['register-user']: 'Sign Up page',
    ['course-list']: 'Events page',
    profile: 'profile page',
    admin: 'admin page',
};

const names = {
    home: 'Home',
    ['sign-in']: 'Sign In',
    test: 'test',
    ['register-user']: 'Sign Up',
    ['course-list']: 'Events',
    profile: 'profile',
    admin: 'admin',
};
const linksActive = {
    home: 'mat-primary',
    ['sign-in']: 'mat-primary',
    test: 'mat-primary',
    ['register-user']: 'mat-primary',
    ['course-list']: 'mat-primary',
    profile: 'mat-primary',
    admin: 'mat-primary',
};

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
    title = 'okevents';
    public user: User | undefined;

    public navigationLinks = routes
        .filter((r) => r.path && r.path !== '' && r.path !== '**')
        .map((r) => ({
            url: r.path,
            cssClass: this.getProp(classes, r.path!),
            icon: this.getProp(icons, r.path!),
            ariaLabel: this.getProp(labels, r.path!),
            name: this.getProp(names, r.path!),
            linkActive: this.getProp(linksActive, r.path!) || '',
        }));

    private getProp(objectType: any, name: string): string {
        return objectType[name];
    }

    private subs: Subscription = new Subscription();

    constructor(authService: AuthService) {
        this.subs.add(
            authService.authenticated.subscribe((res) => {
                if (res) {
                    res.then((user: User) => (this.user = user));
                }
            })
        );
    }

    public showRoute(route: any): boolean {
        switch (route.name) {
            case 'Sign In':
            case 'Sign Up':
                return !this.user;
                break;
            case 'admin':
            case 'userAdmin':
                return this.user?.role === 'admin';
            default:
                return true;
        }
    }
}
