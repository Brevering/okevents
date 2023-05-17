import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { $animations } from './login-animations';
import { $providers } from './login-providers';
import { $pages } from './login-pages';
import { AuthService } from '../shared/services/auth.service';

export type loginAction =
    | 'register'
    | 'sign-in'
    | 'forgotPassword'
    | 'changePassword'
    | 'changeEmail'
    | 'delete'
    | 'admin'
    | 'default';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    animations: $animations,
})
export class LoginComponent {
    readonly providers = $providers;
    private pages = $pages;

    public page: loginAction;

    readonly form: FormGroup;
    public name: FormControl;
    public email: FormControl;
    public password: FormControl;
    public newEmail: FormControl;
    public newPassword: FormControl;

    public hidePassword = true;
    public error: string | null = null;
    public progress = false;

    get auth() {
        return this.profile.authenticated;
    }

    constructor(
        private profile: AuthService,
        private ref: MatDialogRef<LoginComponent>,
        @Inject(MAT_DIALOG_DATA) private action: loginAction
    ) {
        // Form controls
        this.name = new FormControl(null, Validators.required);
        this.email = new FormControl(null, [
            Validators.required,
            Validators.email,
        ]);
        this.password = new FormControl(null, Validators.required);
        this.newEmail = new FormControl(null, [
            Validators.required,
            Validators.email,
        ]);
        this.newPassword = new FormControl(null, Validators.required);

        // Empty form group
        this.form = new FormGroup({});

        // Populates the form according to the page
        this.switchPage((this.page = action));
    }

    get currentPage() {
        return this.pages[this.page || 'sign-in'];
    }

    public switchPage(page: loginAction) {
        // Removes all the controls from the form group
        Object.keys(this.form.controls).forEach((control) => {
            this.form.removeControl(control);
        });
    console.log($pages);
        // Add the relevant controls to the form according to selected page
        switch ((this.page = $pages[page] ? page : 'default')) {
            case 'register':
                this.form.addControl('name', this.name);
                this.form.addControl('email', this.email);
                this.form.addControl('password', this.password);
                break;
            case 'admin':
                this.form.addControl('email', this.email);
                this.form.addControl('password', this.password);
                break;

            case 'sign-in':
                this.form.addControl('email', this.email);
                this.form.addControl('password', this.password);
                break;

            case 'forgotPassword':
                this.form.addControl('email', this.email);
                break;
            /*
          case 'resetPassword':
          this.form.addControl('newPassword', this.newPassword);
          break;
    */
            case 'changePassword':
                this.form.addControl('password', this.password);
                this.form.addControl('newPassword', this.newPassword);
                break;

            case 'changeEmail':
                this.form.addControl('password', this.password);
                this.form.addControl('newEmail', this.newEmail);
                break;

            case 'delete':
                this.form.addControl('password', this.password);
                break;
            default:

                this.form.addControl('email', this.email);
                this.form.addControl('password', this.password);

                break;

        }
    }

    public showError(error: string) {
        this.error = error;
        this.progress = false;
        setTimeout(() => (this.error = null), 5000);
    }

    public activate(action: loginAction) {
        this.progress = true;

        switch (action) {
            default:
            case 'sign-in':
                this.signIn(this.email.value, this.password.value);
                break;

            case 'register':
                this.registerNew(
                    this.email.value,
                    this.password.value,
                    this.name.value
                );
                break;

            case 'forgotPassword':
                this.forgotPassword(this.email.value);
                break;
            /*
          case 'resetPassword':
          this.resetPassword( this.code, this.newPassword.value );
          break;
    */
            case 'changePassword':
                this.updatePassword(
                    this.password.value,
                    this.newPassword.value
                );
                break;

            case 'changeEmail':
                //   this.updateEmail( this.password.value, this.newEmail.value );
                break;

            case 'delete':
                this.deleteAccount(this.password.value);
                break;
        }
    }

    public registerNew(email: string, password: string, name: string) {
        // Registering a new user with a email/password
        this.profile
            .signUp({ email: email, password: password, name: name })

            // Closes the dialog returning the user
            .then((user) => this.ref.close(user))
            // Dispays the error code, eventually
            .catch((error) => this.showError(error.code));
    }

    public signIn(email: string, password: string) {
        // Sign-in using email/password
        this.profile
            .signIn(email, password)
            // Closes the dialog returning the user
            .then((user) => this.ref.close(user))
            // Dispays the error code, eventually
            .catch((error) => this.showError(error.code));
    }

    public signInWith(provider: string) {
        // Signing-in with a provider
        switch (provider) {
            case 'google':
                this.profile
            .googleAuth()
            // Closes the dialog returning the user
            .then(
                (user) => this.ref.close(user)
                // Closes the dialog returning the user
            )
            // Dispays the error code, eventually
            .catch((error) => this.showError(error.code));
                
                break;
            case 'facebook':
                this.profile
            .facebookAuth()
            // Closes the dialog returning the user
            .then(
                (user) => this.ref.close(user)
                // Closes the dialog returning the user
            )
            // Dispays the error code, eventually
            .catch((error) => this.showError(error.code));
                
                break;
        
            default:
                break;
        }
        
    }

    public forgotPassword(email: string) {
        this.profile
            .sendPasswordResetEmail(email)
            // Closes the dialog returning null
            .then(() => this.ref.close(null))
            // Dispays the error code, eventually
            .catch((error) => this.showError(error.code));
    }

    public updateEmail(password: string, newEmail: string) {
        // // Refreshes the authentication
        // this.profile.refresh(password)
        //   // Updates the email returning the new user object
        //   .then( user => user.updateEmail(newEmail).then( () => this.ref.close(user) ) )
        //   // Dispays the error code, eventually
        //   .catch( error => this.showError(error.code) );
    }

    public updatePassword(password: string, newPassword: string) {
        // // Refreshes the authentication
        // this.profile.refresh(password)
        //   // Updates the password returning the new user object
        //   .then( user => user.updatePassword(newPassword).then( () => this.ref.close(user) ) )
        //   // Dispays the error code, eventually
        //   .catch( error => this.showError(error.code) );
    }

    public deleteAccount(password: string) {
        // // Refreshes the authentication
        // this.profile.refresh(password)
        //    // Deletes the user profile first
        //   .then( user => this.profile.delete()
        //     // Deletes the user object next
        //     .then( () => user.delete() )
        //   )
        //   // Closes the dialog returning null
        //   .then( () => this.ref.close(null) )
        //   // Dispays the error code, eventually
        //   .catch( error => this.showError(error.code) );
    }
}
