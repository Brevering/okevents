import { Component } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormGroupDirective,
    NgForm,
    Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { User } from 'src/app/shared/models/user';
import { UsersService } from 'src/app/shared/services/users.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(
        control: FormControl | null,
        form: FormGroupDirective | NgForm | null
    ): boolean {
        const isSubmitted = form && form.submitted;
        return !!(
            control &&
            control.invalid &&
            (control.dirty || control.touched || isSubmitted)
        );
    }
}

@Component({
    selector: 'app-admin-panel',
    templateUrl: './admin-panel.component.html',
})
export class AdminPanelComponent {
    displayedColumns: string[] = [
        'firstName',
        'lastName',
        'email',
        'command',
        // 'dateOfBirth',
        // 'phone',
    ];
    dataSource: User[] = [];
    editedElement: User | null = null;
    matcher: ErrorStateMatcher = new MyErrorStateMatcher();

    formGroup: any;

    constructor(private userService: UsersService) {
        userService.getUsers().subscribe((res) => {
            this.dataSource = res;
        });
    }

    onEdit(user: User): void {
        this.editedElement = user;
        this.formGroup = new FormGroup({
            uid: new FormControl(user.uid),
            firstName: new FormControl(user.firstName, [
                Validators.required,
                Validators.minLength(3),
            ]),
            lastName: new FormControl(user.lastName, [
                Validators.required,
                Validators.minLength(3),
            ]),
            email: new FormControl(user.email, [
                Validators.required,
                Validators.email,
            ]),
            dateOfBirth: new FormControl(user.dateOfBirth),
            phone: new FormControl(user.phone),
        });
    }

    onDelete(user: User): void {
        this.dataSource = this.dataSource.filter(
            (item) => item.uid !== user.uid
        );
    }

    onSave(user: User): void {
        const editedItem = this.formGroup?.value;

        if (this.formGroup?.valid) {
            this.dataSource.splice(
                this.dataSource.findIndex((item) => item.uid === user.uid),
                1,
                editedItem
            );
            this.dataSource = [...this.dataSource];
        }

        this.editedElement = null;
        this.formGroup = null;
    }

    onCancel(): void {
        this.editedElement = null;
        this.formGroup = null;
    }

    addNew(): void {
        // TODO: add new user
        this.formGroup = new FormGroup({
            firstName: new FormControl('name', [
                Validators.required,
                Validators.minLength(3),
            ]),
            lastName: new FormControl('lastName'),
            email: new FormControl('email'),
        });
        this.dataSource = [this.formGroup.value, ...this.dataSource];
        this.editedElement = this.formGroup.value;
    }
}
