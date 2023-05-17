import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FacebookAuthProvider, GithubAuthProvider, GoogleAuthProvider, UserCredential } from 'firebase/auth';
import {
    AngularFirestore,
    AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { UsersService } from './users.service';
import { filter, take } from 'rxjs/operators';
import { Observable, map, of, lastValueFrom } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    public userData: User | null = null;

    constructor(
        private afs: AngularFirestore,
        private afAuth: AngularFireAuth,
        private router: Router,
        private usersService: UsersService
    ) {
        this.afAuth.authState.subscribe((user) => {
            if (user) {
                this.usersService
                    .getById(user.uid)
                    .then(
                        (user) =>
                            (this.userData = user.exists() ? user.val() : null)
                    );
                localStorage.setItem('user', JSON.stringify(this.userData));
                JSON.parse(localStorage.getItem('user')!);
            } else {
                localStorage.setItem('user', 'null');
                JSON.parse(localStorage.getItem('user')!);
            }
        });
    }

    get authenticated(): Observable<any> {
        if (this.userData) {
            return of(Promise.resolve(this.userData));
        }
        return this.afAuth.authState.pipe(
            map((user) => {
                if (user) {
                    return this.usersService.getById(user.uid).then((user) => {
                        this.userData = user.exists() ? user.val() : null;
                        localStorage.setItem(
                            'user',
                            JSON.stringify(this.userData)
                        );
                        JSON.parse(localStorage.getItem('user')!);
                        return Promise.resolve(user.val());
                    });
                } else {
                    localStorage.setItem('user', 'null');
                    JSON.parse(localStorage.getItem('user')!);
                    return Promise.resolve(null);
                }
            })
        );
    }

    /** Returns the current user id, when authenticated */
    get userId(): string {
        return this.authenticated && this.userData ? this.userData.uid : '';
    }
    /** Returns the current user role, when authenticated */
    get userRole(): string {
        return this.authenticated && this.userData ? this.userData.uid : '';
    }

    public signIn(email: string, password: string): Promise<void> {
        return this.afAuth
            .signInWithEmailAndPassword(email, password)
            .then((result) => {
                this.usersService
                    .getById((result.user as any).uid)
                    .then((u) => {
                        this.usersService.currentUser = u.val();
                    });
            })
            .then(() => {
                return lastValueFrom(this.authenticated.pipe(take(1)));
            })
            .catch((error) => {
                window.alert(error.message);
            });
    }

    public signUp(formValue: any): Promise<void> {
        return this.afAuth
            .createUserWithEmailAndPassword(formValue.email, formValue.password)
            .then((result) => {
                this.sendVerificationMail();
                this.setUserData(result.user, formValue);
            })
            .catch((error) => {
                window.alert(error.message);
            });
    }

    public sendVerificationMail(): Promise<boolean | void> {
        return this.afAuth.currentUser
            .then((u: any) => u.sendEmailVerification())
            .then(() => {
                this.router.navigate(['verify-email-address']);
            });
    }

    /**
     * Sends an email to the user to resets the account password
     * @param url (optional) the link to be passed as the continueUrl query parameter
     */
    public sendPasswordResetEmail(email: string, url?: string): Promise<void> {
        console.log('Resetting the password for: ', email);
        return this.afAuth.sendPasswordResetEmail(
            email,
            url ? { url } : undefined
        );
    }

    public forgotPassword(passwordResetEmail: string): Promise<void> {
        return this.afAuth
            .sendPasswordResetEmail(passwordResetEmail)
            .then(() => {
                window.alert('Password reset email sent, check your inbox.');
            })
            .catch((error) => {
                window.alert(error);
            });
    }

    public get isLoggedIn(): boolean {
        const user = JSON.parse(localStorage.getItem('user')!);
        return user !== null && user.emailVerified !== false ? true : false;
    }

    public googleAuth(): Promise<void> {
        return this.authLogin(new GoogleAuthProvider()).then((res: any) => {
            return lastValueFrom(this.authenticated.pipe(take(1)));
        });
    }
    public facebookAuth(): Promise<void> {
        return this.authLogin(new FacebookAuthProvider()).then((res: any) => {
            return lastValueFrom(this.authenticated.pipe(take(1)));
        });
    }

    public authLogin(provider: any): Promise<void> {
        function getProvider(providerId: string) {
            switch (providerId) {
                case GoogleAuthProvider.PROVIDER_ID:
                    return new GoogleAuthProvider();
                case FacebookAuthProvider.PROVIDER_ID:
                    return new FacebookAuthProvider();
                case GithubAuthProvider.PROVIDER_ID:
                    return new GithubAuthProvider();
                default:
                    throw new Error(`No provider implemented for ${providerId}`);
            }
        }

        const supportedPopupSignInMethods = [
            GoogleAuthProvider.PROVIDER_ID,
            FacebookAuthProvider.PROVIDER_ID,
            GithubAuthProvider.PROVIDER_ID,
        ];
        //!provider.addScope('user_birthday');
        return this.afAuth
            .signInWithPopup(provider)
            .then(
                (result: any) => {
                    let user = result.user;
                    let credential = result.credential;
                    //this.router.navigate(['profile']);
                    //this.setUserData(user, {...user});
                    return user;
                },
                async (error) => {

                    if (error.email && error.credential && error.code === 'auth/account-exists-with-different-credential') {
                        const providers = await this.afAuth.fetchSignInMethodsForEmail(error.email)
                        const firstPopupProviderMethod = providers.find(p => supportedPopupSignInMethods.includes(p as any));

                        // Test: Could this happen with email link then trying social provider?
                        if (!firstPopupProviderMethod) {
                            throw new Error(`Your account is linked to a provider that isn't supported.`);
                        }

                        const linkedProvider = getProvider(firstPopupProviderMethod);
                        //!linkedProvider.addScope('user_birthday')
                        linkedProvider.setCustomParameters({ login_hint: error.email });

                        const result = await this.afAuth.signInWithPopup(linkedProvider);
                        result.user?.linkWithCredential(error.credential);
                    }

                    // Handle errors...
                    // toast.error(err.message || err.toString());
                }
);
    }

    public setUserData(user: any, formValue: any): void {
    const userData: User = {
        uid: user.uid,
        email: user.email,
        displayName: formValue.displayName,
        photoURL: formValue.photoUrl || '',
        emailVerified: user.emailVerified,
        dateOfBirth: formValue.dateOfBirth || null, // needs primitive
        firstName: formValue.firstName || '',
        lastName: formValue.lastName || '',
        phone: formValue.phone || ''
    };

    this.usersService.currentUser = userData;

    this.usersService.save(userData, true);
}

    public signOut(): Promise < boolean | void> {
    return this.afAuth.signOut().then(() => {
        this.usersService.currentUser = null;
        this.userData = null;
        localStorage.removeItem('user');
        this.router.navigate(['sign-in']);
    });
}
}
