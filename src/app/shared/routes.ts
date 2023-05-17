import { Routes } from '@angular/router';
import { NotFoundComponent } from '../404/404.component';
import { ProfileComponent } from '../components/profile/profile.component';
import { ForgotPasswordComponent } from '../components/forgot-password/forgot-password.component';
import { SignInComponent } from '../components/sign-in/sign-in.component';
import { SignUpComponent } from '../components/sign-up/sign-up.component';
import { VerifyEmailComponent } from '../components/verify-email/verify-email.component';
import { HomeComponent } from '../home/home.component';
import { LoginComponent } from '../login/login.component';
import { TestComponent } from '../test/test.component';
import { CourseListComponent } from '../components/course-list/course-list.component';
import { AdminPanelComponent } from '../components/admin-panel/admin-panel.component';
import { AuthGuard } from './guard/auth.guard';
import { EventsListComponent } from '../components/events-list/events-list.component';

export const routes: Routes = [
    { path: 'home', component: EventsListComponent },
	{ path: 'events/:id', component: EventsListComponent },
    { path: 'sign-in', component: SignInComponent, canActivate: [AuthGuard] },
    { path: 'register-user', component: SignUpComponent },
    { path: 'userAdmin', component: AdminPanelComponent, canActivate: [AuthGuard] },
    { path: 'admin', component: CourseListComponent, canActivate: [AuthGuard] },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'verify-email-address', component: VerifyEmailComponent },
    { path: 'profile', component: ProfileComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', component: NotFoundComponent }, // Wildcard route for a 404 page
];
