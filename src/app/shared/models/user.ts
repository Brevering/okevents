
export interface User {
    uid: string;
    email: string;
    dateOfBirth?: Date;
    displayName?: string;
    photoURL?: string;
    emailVerified: boolean;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
}
