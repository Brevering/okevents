import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { BehaviorSubject, finalize, Observable } from 'rxjs';
import { getDatabase, ref, child, push, update, get, orderByKey, endBefore } from "firebase/database";
import { Storage, ref as ref_storage, uploadBytes, getStorage, getDownloadURL } from '@angular/fire/storage';
import { WindowRef } from 'src/app/shared/_window';
import { OKEvent } from '../models/event';
import { orderByChild, query, limitToFirst, equalTo } from '@angular/fire/database';

@Injectable({ providedIn: 'root' })
export class CoursesService {
	private sampleCourses: OKEvent[] = []

	public courses: BehaviorSubject<OKEvent[]> = new BehaviorSubject<OKEvent[]>(
		this.sampleCourses
	);
	private basePath = '/uploads'
	constructor(public db: AngularFireDatabase, private storage: Storage, private winRef: WindowRef,) {
		db.list('courses', ref => {
			return ref.orderByChild('dtstart')
		  }).valueChanges().subscribe((res) => {
			console.log(res);
			this.courses.next(JSON.parse(JSON.stringify(res)).reverse());
		});

		// const ggg = query(ref(db.database, 'courses/'),  endBefore('2023-03-25T20:00:00Z'))
		// get(ggg).then((snapshot) => {
		// 	snapshot.forEach((child) => {
		// 	  console.log(child.key, child.val().uid);
		// 	});
		//   }).catch((error) => {
		// 	console.error(error);
		//   });
	}

	private async getTextFromFile(event: any) {
		const file: File = event.target.files[0];
		let fileContent = await file.text();

		return fileContent;
	}

	public async importCalendarData(event: any, dbCoursesRef: any[]): Promise<[]> {
		let fileContent = await this.getTextFromFile(event);
		var jcalData = this.winRef.nativeWindow.ICAL.parse(fileContent);
		var vcalendar = new this.winRef.nativeWindow.ICAL.Component(jcalData);
		var vevent = vcalendar.getFirstSubcomponent('vevent');
		var vevents = vcalendar.getAllSubcomponents('vevent');
		var x;
		var csv;
		var alltitles = [];
		var csvheader;
		var isFirstLine = true;
		var csvfile;
		var csvColumnNames = <any>[];
		var resto = <any>[];
		csvColumnNames = ['dtstart', 'dtend', 'uid', 'description', 'location', 'status', 'summary', 'url']
		for (x of vevents) {
			alltitles = [];
			csv = csv + x.getFirstPropertyValue('summary') + '<br>';

			var allProps = [];

			// go through all properties in checkMap and only push ones that match to an array
			var eventProperties = x.getAllProperties();
			var valuesMap = Object();
			for (const csvCol of csvColumnNames) {
				for (const prop of x.getAllProperties()) {
					if (csvCol == prop.jCal[0].toLowerCase()) {
						if (csvCol in valuesMap) {
							valuesMap[csvCol] = valuesMap[csvCol] + ";" + JSON.stringify(prop.jCal[3]).replace(/\\\"/g, '').replace(/\"/g, '');
						}
						else {
							valuesMap[csvCol] = JSON.stringify(prop.jCal[3]).replace(/\\\"/g, '').replace(/\"/g, '');
						}
					}
				}
			}
			if (valuesMap.uid) {
				const dbUid = dbCoursesRef.find(x => x['uid'] === valuesMap.uid);
				if (dbUid) {
					valuesMap['okuniquekey'] = dbUid['okuniquekey'];
				}
			}
			if (valuesMap.url) {
				valuesMap.url = valuesMap.url.split('?')[0];
			}
			resto.push(valuesMap)
			for (const csvCol of csvColumnNames) {
				if (csvCol in valuesMap) {
					allProps.push(valuesMap[csvCol]);
				}
				else {
					allProps.push('');
				}
			}


			var csvstring = "\"" + allProps.join("\",\"") + "\"";
			var csvheader = csvColumnNames.join(",");
			if (isFirstLine) {
				csvfile = csvstring;
			}
			else {
				csvfile = csvfile + "\n" + csvstring;
			}
			isFirstLine = false;
		}
		csvfile = csvheader + "\n" + csvfile;

		return resto;
	}

	public getCourses(): Observable<any> {
		return this.courses.asObservable();
	}

	public getById(id?: string): Promise<any> {
		return this.db.database
			.ref()
			.child('courses/')
			.child(id || '')
			.get();
	}

	public save(courseData: any, isNew?: boolean) {
		if (!courseData.okuniquekey || isNew) {
			const newPostKey = push(child(ref(this.db.database), 'courses')).key;
			courseData.okuniquekey = newPostKey;
			this.db.database.ref('courses/' + newPostKey).set(courseData);
		} else {
			this.db.database.ref('courses/' + courseData.okuniquekey).update(courseData);
		}
	}

	public update(updates: {}) {
		return update(ref(this.db.database), updates);
	}

	public async saveBlob(type: string, payload: Blob, key: string): Promise<any> {
		const filePath = `events/images/${key}/${type}`;
		const storageRef = ref_storage(this.storage, filePath);
		let uploadResult;
		await uploadBytes(storageRef, payload).then(async (snapshot) => {
			await getDownloadURL(snapshot.ref).then((downloadURL) => {
				console.log('File available at', downloadURL);
				uploadResult = downloadURL
			});
		  });
		console.log(uploadResult);
		return Promise.resolve(uploadResult);
	}


}
