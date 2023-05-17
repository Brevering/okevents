import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UsersService {
    public currentUser: User | null = null;
    constructor(public db: AngularFireDatabase) {}

    public getUsers(): Observable<any> {
        return this.db.list('users').valueChanges();
    }

    public getById(id?: string): Promise<any> {
        return this.db.database
            .ref()
            .child('users/')
            .child(id || '')
            .get();
    }

    public save(userData: any, isNew?: boolean) {
        if (isNew) {
            this.db.database.ref('users/' + userData.uid).set(userData);
        } else {
            this.db.database.ref('users/' + userData.uid).update(userData);
        }
    }

    public remove(data: any) {
        const token = data.getIdToken();
        this.db.database.ref('users/' + token).remove();
    }
}
