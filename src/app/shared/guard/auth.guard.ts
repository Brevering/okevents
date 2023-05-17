import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    CanActivateChild,
    CanDeactivate,
    CanLoad,
    Router,
    RouterStateSnapshot,
    UrlSegment,
    UrlTree,
    Route,
} from '@angular/router';
import { map, Observable, take, of, lastValueFrom } from 'rxjs';
import { SignInComponent } from '../../components/sign-in/sign-in.component';
import { AuthService } from '../../shared/services/auth.service';
import { LoginComponent, loginAction } from '../../login/login.component';
import { User } from 'firebase/auth';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard
    implements CanActivate, CanActivateChild, CanDeactivate<unknown>, CanLoad
{
    constructor(
        public authService: AuthService,
        public router: Router,
        private dialog: MatDialog
    ) {}

    /** Returns the current authenticated user id */
    get userId() {
        return this.authService.userId;
    }

    /** Prompts the user for authentication */
    //  public prompt(data: loginAction = 'signIn'): Promise<User> {

    // 	return this.dialog.open<LoginComponent,loginAction, User>(LoginComponent, { data })
    // 	  .afterClosed().toPromise();
    //   }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ):
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree>
        | boolean
        | UrlTree {
        return lastValueFrom(
            this.authService.authenticated.pipe(
                map((user) => {
                    if (user) {
                        return user.then((user: any) => {
                            if (user) {
                                if (user.role === 'admin') {
                                    console.log('User is admin!');

                                    return Promise.resolve(true);
                                } else {
                                    window.alert(
                                        'You do not have permission to access this. Please contact the site admin.'
                                    );
                                    return Promise.resolve(false);
                                }
                            } else {
                                let data: loginAction = route.url[0]
                                    .path as loginAction;
                                return lastValueFrom(
                                    this.dialog
                                        .open<
                                            LoginComponent,
                                            loginAction,
                                            User
                                        >(LoginComponent, {
                                            data,
                                            height: '400px',
                                            width: '300px',
                                        })
                                        .afterClosed()
                                ).then((user: any) => {
                                    if (user) {
                                        if (user.role === 'admin') {
                                            return Promise.resolve(true);
                                        } else {
                                            window.alert(
                                                'You do not have permission to access this. Please contact the site admin.'
                                            );
                                            return Promise.resolve(false);
                                        }
                                    } else {
                                        this.router.navigate(['register-user']);
                                        return Promise.resolve(false);
                                    }
                                });
                            }
                        });
                    } else {
                        let data: loginAction = 'sign-in' as loginAction;
                        return lastValueFrom(
                            this.dialog
                                .open<LoginComponent, loginAction, User>(
                                    LoginComponent,
                                    {
                                        data,
                                        height: '400px',
                                        width: '300px',
                                    }
                                )
                                .afterClosed()
                        ).then(() => {
                            this.router.navigate(['/']);
                        });
                    }
                    //return false
                }),
                take(1)
            )
        );
        // return this.authService.authenticated.pipe(map((user)=>{

        // 	if(user){

        // 		console.log('The user is|: ', user);
        // 		return true;
        // 	}

        // 	return false;
        // }))
    }
    canActivateChild(
        childRoute: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ):
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree>
        | boolean
        | UrlTree {
        return true;
    }
    canDeactivate(
        component: unknown,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState?: RouterStateSnapshot
    ):
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree>
        | boolean
        | UrlTree {
        return true;
    }
    canLoad(
        route: Route,
        segments: UrlSegment[]
    ):
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree>
        | boolean
        | UrlTree {
        return true;
    }
}
