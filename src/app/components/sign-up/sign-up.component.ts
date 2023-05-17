import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormType } from 'src/app/shared/models/formType';
import { UsersService } from 'src/app/shared/services/users.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent {
    public userForm: FormGroup = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]), // TODO: add custom rule for unique
        password: new FormControl('', Validators.required), // TODO: add custom rule for matching confirm password
        confirm: new FormControl('', [Validators.required]),
        dateOfBirth: new FormControl(null),
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        displayName: new FormControl('', Validators.required),
        phone: new FormControl(''),
        photoUrl: new FormControl(''),
    });

    constructor(
        private authService: AuthService,
        private router: Router,
        private userService: UsersService
    ) {}

    public get formType(): FormType {
        return this.router.url.includes('sign-in') ? 'signIn' : 'signUp';
    }

    public register(): void {
        this.authService.signUp(this.userForm.value);
    }

    public onClick(): void {
        const newUser = {
            ...this.userService.currentUser,
            dateOfBirth: new Date().getTime(),
            rating: [1, 2, 3], // TODO: does not save empty arrays ??
        };
        this.userService.save(newUser, false);
    }
}
