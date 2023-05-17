import { Component, Inject, Input } from '@angular/core';
import { $providers } from 'src/app/login/login-providers';


@Component({
	selector: 'app-course-component',
	templateUrl: 'course.component.html',
	styleUrls: ['course.component.css'],
})
export class CourseComponent {
	private _imageSrc: any;
	private _url: any;
	private _tickets: any;
	@Input('imageSrc')
	get imageSrc(): any {
		return this._imageSrc;
	}
	set imageSrc(value: any) {
		this._imageSrc = value || '../../../assets/images/events_logo.png'; // link to default event image
	}
	@Input('url')
	get url(): any {
		return this._url
	}
	set url(value: any) {
		this._url = value || ''; // link to default event image
	}
	@Input('tickets')
	get tickets(): any {
		return this._tickets
	}
	set tickets(value: any) {
		this._tickets = value || ''; // link to default event image
	}
	@Input() public imageAlt: string = 'Event image';
	@Input() public title: string = 'Event title';
	@Input() public location: string = 'Event location';
	@Input() public description: string = 'Event description';
	@Input() public isExpired: boolean = false;
	@Input() public startTime: string = '';
	@Input() public endTime: string = '';
	readonly providers = $providers;



	likeShareEtc(provider: string) {
		console.log(provider);
	}
}
