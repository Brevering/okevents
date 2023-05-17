import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormType } from 'src/app/shared/models/formType';
import { AuthService } from '../../shared/services/auth.service';

@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.css'],
})
export class SignInComponent {
    public userForm: FormGroup = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]), // TODO: add custom rule for unique
        password: new FormControl('', Validators.required), // TODO: add custom rule for matching confirm password
    });

    constructor(private authService: AuthService, private router: Router) {}

    public get formType(): FormType {
        return this.router.url.includes('sign-in') ? 'signIn' : 'signUp';
    }

    public signIn(): void {
        const { email, password } = this.userForm.value;
        this.authService.signIn(email, password);
    }

    public authWithGoogle(): void {
        this.authService.googleAuth();
    }
}
