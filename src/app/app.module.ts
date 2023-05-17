import { LOCALE_ID, NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeBg from '@angular/common/locales/bg';
registerLocaleData(localeBg, 'bg');
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NotFoundComponent } from './404/404.component';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { TestComponent } from './test/test.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { AngularFireModule, FIREBASE_OPTIONS } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../environments/environment';
import { ProfileComponent } from './components/profile/profile.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './components/verify-email/verify-email.component';
// Auth service
import { AuthService } from './shared/services/auth.service';
import { PERSISTENCE } from '@angular/fire/compat/auth';

import { CourseListComponent } from './components/course-list/course-list.component';
import { CourseComponent } from './components/course/course.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MaterialExampleModule } from './material.module';
import { LoginModule } from './login/login.module';
import { CsvService } from './shared/services/csv.service';
import { WindowRef } from './shared/_window';
import { StringToHtmlPipe } from './shared/utils/string-to-html.pipe';
// Material
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { UploadFormComponent } from './components/upload-form/upload-form.component';
import { UploadDetailsComponent } from './components/upload-details/upload-details.component';
import { UploadListComponent } from './components/upload-list/upload-list.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ImageCropperDialog } from './components/image-cropper-dialog/image-cropper-dialog.component';
import { EventsListComponent } from './components/events-list/events-list.component';
import { getStorage, provideStorage } from '@angular/fire/storage';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        TestComponent,
        NotFoundComponent,
        ProfileComponent,
        SignInComponent,
        SignUpComponent,
        ForgotPasswordComponent,
        VerifyEmailComponent,
        CourseComponent,
        CourseListComponent,
        AdminPanelComponent,
        StringToHtmlPipe,
        UploadFormComponent,
        UploadListComponent,
        UploadDetailsComponent,
		ImageCropperDialog,
  EventsListComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
		provideFirebaseApp(() => initializeApp(environment.firebaseConfig,'okevents')),
    	// provideDatabase(() => getDatabase()),
        // AngularFireModule.initializeApp(
        //     environment.firebaseConfig,
        //     'okevents'
        // ),
        FormsModule,
        ReactiveFormsModule,
        AngularFireAuthModule,
        AngularFirestoreModule,
		provideStorage(() => getStorage()),
        //AngularFireStorageModule,
        AngularFireDatabaseModule,
        MaterialExampleModule,
        LoginModule,
        MatDatepickerModule,
        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
        NgxMatMomentModule,
        ImageCropperModule
    ],
    providers: [
        AuthService,
        CsvService,
        WindowRef,
        { provide: MAT_DATE_LOCALE, useValue: 'bg-BG' },
        { provide: PERSISTENCE, useValue: 'session' },
        {provide: LOCALE_ID, useValue: 'bg-BG' },
		{ provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig }
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
