import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { $cardsData } from './cardsData';
import * as moment from 'moment';

@Component({
	selector: 'app-day-card',
	templateUrl: './day-card.component.html',
	styleUrls: ['./day-card.component.css']
})
export class DayCardComponent implements OnInit {
	public cardDrawn: number;
	public imageName: string;
	public cardTitle: string;
	public cardText: string;

	private isOldCookie: boolean;

	constructor(private cookieService: CookieService) {
		moment.locale('bg');

		const cookieCodeExists: boolean = cookieService.check('dayC');
		const cookieTimeExists: boolean = cookieService.check('timeC');
		let cookieCode: string = cookieCodeExists ? cookieService.get('dayC') : '0';

		if (cookieTimeExists) {
			const startOfDay = moment().startOf('day');
			const cookieTime = moment(1000*(cookieService.get('timeC') as any));
			this.isOldCookie = cookieTime.isBefore(startOfDay);
		} else {
			this.isOldCookie = true;
			cookieCode = '0';
		}
		this.cardDrawn = parseInt((Number(cookieCode) as unknown) as string);
		if (this.isOldCookie) {
			this.deleteCookies();
		}
		
		const cardIndex = ('0' + this.cardDrawn).slice(-2);
		this.imageName = '../../../assets/images/cards/card' + ('0' + this.cardDrawn).slice(-2) + '.jpg';
		this.cardTitle = this.cardDrawn ? ($cardsData as any)[cardIndex].name : '';
		this.cardText = this.cardDrawn ? ($cardsData as any)[cardIndex].txt : '';
	}

	private randomInt(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	private randomObjFromArray (array: Array<any>) :any  {
		let index = Math.floor(Math.random() * array.length);
		let obj = array[index];
		return obj;
	}

	public drawCard() {
		const key = this.randomObjFromArray(Object.keys($cardsData));
		const obj = ($cardsData as any)[key];
		this.imageName = '../../../assets/images/cards/card' + key + '.jpg';
		this.cardDrawn = key;
		this.cardTitle = obj.name;
		this.cardText = obj.txt;
		this.setCookie(key.toString());
	}
	private setCookie(key:string) {
		const currentDate = moment().unix().toString();
		const endOfDay = moment().endOf('day').unix()*1000;
		this.cookieService.set('dayC', key, {expires: new Date(endOfDay)});
		this.cookieService.set('timeC', currentDate, {expires: new Date(endOfDay)});
	}

	public deleteCookies(){
		this.cookieService.delete('dayC');
		this.cookieService.delete('timeC');
		this.cardDrawn = 0;
		this.imageName = '../../../assets/images/cards/card' + ('0' + this.cardDrawn).slice(-2) + '.jpg';
		this.cardTitle =  '';
		this.cardText =  '';
	}



	ngOnInit(): void {
	}

}
