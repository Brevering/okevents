import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CsvService } from 'src/app/shared/services/csv.service';
import { WindowRef } from 'src/app/shared/_window';
import { OKEvent } from './../../shared/models/event';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { CoursesService } from 'src/app/shared/services/courses.service';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
	AbstractControl,
	FormControl,
	FormGroup,
	FormGroupDirective,
	NgForm,
	ValidationErrors,
	ValidatorFn,
	Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import * as moment from 'moment';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import { FileUpload } from 'src/app/shared/models/fileUpload.model';
import { ImageCropperDialog } from '../image-cropper-dialog/image-cropper-dialog.component';

export class MyErrorStateMatcher implements ErrorStateMatcher {
	isErrorState(
		control: FormControl | null,
		form: FormGroupDirective | NgForm | null
	): boolean {
		const isSubmitted = form && form.submitted;
		let isDateIssue = false;
		if (control && control.parent && control.parent.controls) {
			const controlName = (Object.keys(control.parent.controls).find((key) => {
				const controls = control?.parent?.controls as { [key: string]: AbstractControl; };
				return controls[key] === control;
			}))
			if ((controlName === 'dtstart') || (controlName === 'dtend')) {
				if (control.parent.hasError('timeMismatch')) {
					isDateIssue = true;
				}
			}
		}

		return !!(
			(control &&
				control.invalid &&
				(control.dirty || control.touched || isSubmitted)) || isDateIssue
		);
	}
}

export function creatDateRangeValidator(): ValidatorFn {
	return (form: AbstractControl): ValidationErrors | null => {
		const start = moment((form as FormGroup).controls['dtstart'].value);
		const end = moment((form as FormGroup).controls['dtend'].value);

		if (start && end) {
			const isRangeValid = end.isSameOrAfter(start);

			return isRangeValid ? null : { timeMismatch: true };
		}

		return null;
	}
}

@Component({
	selector: 'app-course-list',
	templateUrl: './course-list.component.html',
	styleUrls: ['./course-list.component.css'],
})
export class CourseListComponent implements OnInit, AfterViewInit {
	selection: SelectionModel<{}>;
	dataSource = new MatTableDataSource<OKEvent>;
	private dbCourses = [];
	private expiredCourses: OKEvent[] = [];
	private currentCourses: OKEvent[] = [];
	private imagesForUpload: File[] = [];
	editedElement: OKEvent | null = null;
	matcher: ErrorStateMatcher = new MyErrorStateMatcher();
	formGroup: any;

	@ViewChild('pickerStart') pickerStart: any;
	@ViewChild('pickerEnd') pickerEnd: any;
	public showSpinners = true;
	public showSeconds = false;
	public touchUi = false;
	public stepHour = 1;
	public stepMinute = 15;
	public stepSecond = 1;
	public minEndDate = new Date();

	constructor(private _csvService: CsvService, private fuService: FileUploadService, private winRef: WindowRef, private coursesService: CoursesService, private _liveAnnouncer: LiveAnnouncer, public dialog: MatDialog) {
		const initialSelection: {}[] | undefined = [];
		const allowMultiSelect = true;
		this.selection = new SelectionModel<{}>(allowMultiSelect, initialSelection);
		this.selection.changed.subscribe(s => console.log(s, this.selection));
		coursesService.getCourses().subscribe((res) => {
			this.dbCourses = JSON.parse(JSON.stringify(res));
			this.dataSource.data = res.slice(0);
			this.dataSource.sort = null;
			this.dataSource.sort = this.sort;
			console.log(this.dbCourses)
			const timdnow = moment();
			this.dataSource.data.forEach((row) => {
				const dte = moment(row.dtend);
				if (timdnow.diff(dte, 'days') >= 14) {
					this.expiredCourses.push(row);
					row['isExpired'] = true;
				} else {
					this.currentCourses.push(row);
				}
			})
			//!this.dataSource.data.forEach(row => this.selection.select(row));
		});
	}
	@ViewChild(MatSort) sort: MatSort = new MatSort;
	displayedColumns: string[] = [
		'select',
		'dtstart',
		'dtend',
		'location',
		'summary',
		'tickets',
		'image',
		'fullSize',
		'description',
		'command'
	];
	public importedData: Array<any> = [];

	@ViewChild(MatPaginator) paginator: MatPaginator | null = null;

	public importedData2: any;
	// all property has a string data type
	public arrayWithSimpleData: Array<OKEvent> = [];
	ngAfterViewInit() {
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
	}

	startDateChange(event: any) {
		this.minEndDate = event.value.toDate();
	}

	/** Whether the number of selected elements matches the total number of rows. */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.dataSource.data.length;
		return numSelected == numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	toggleAllRows() {
		this.isAllSelected() ?
			this.selection.clear() :
			this.dataSource.data.forEach(row => this.selection.select(row));
	}

	public saveDataInCSV(name: string, data: Array<any>): void {
		let csvContent = this._csvService.saveDataInCSV(data);

		var hiddenElement = document.createElement('a');
		hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
		hiddenElement.target = '_blank';
		hiddenElement.download = name + '.csv';
		hiddenElement.click();
	}

	public async importDataFromCSV(event: any) {
		let fileContent = await this.getTextFromFile(event);
		this.importedData = this._csvService.importDataFromCSV(fileContent);
	}

	public async importDataFromICS(event: any) {
		const resto = await this.coursesService.importCalendarData(event, this.dbCourses);
		this.importedData = resto;
		let arr = [...new Map([...this.dataSource.data, ...resto].map((item: any, ix: number) => {
			let key = (item['uid'] ? item['uid'] : item['okuniquekey'] ? item['okuniquekey'] : ix)
			return [key, item]
		})).values()];

		this.dataSource.data = arr;
		this.selection.clear();
		this.dataSource.paginator = this.paginator;
		this.dataSource.paginator?.lastPage();
	}

	public async importDataFromJSON(event: any): Promise<void> {
		let fileContent = await this.getTextFromFile(event);
		let contentJson: [] = [];
		try {
			contentJson = JSON.parse(fileContent);
		} catch (error) {
			console.log(error);
		}
		const updates: any = {};

		this.dataSource.data.map((x: any) => {
			let matchingOb = contentJson.find(ob => {
				const str: string = ob['eventLink'];
				return x.url.includes(str);
			});
			if (matchingOb && x.okuniquekey) {

				if (matchingOb['imgThumb'] && (!x.thumb || (x.thumb !== matchingOb['imgThumb']))) {
					//!this.download(matchingOb['imgThumb'], 'thumbs', x.okuniquekey);
					updates['/courses/' + x.okuniquekey + '/thumb'] = matchingOb['imgThumb'];
				}
				if (matchingOb['imgFullSize'] && (!x.imgFullSize || (x.imgFullSize !== matchingOb['imgFullSize']))) {
					updates['/courses/' + x.okuniquekey + '/imgFullSize'] = matchingOb['imgFullSize'];
				}
			}
		})

		this.coursesService.update(updates);
	}

	private download(url: string, subPath: string, okuniquekey: string) {
		var xhr = new XMLHttpRequest()
		xhr.responseType = 'blob';
		xhr.onreadystatechange = (event: any) => {
			if (event.target.readyState == 4) {
				if (event.target.status == 200 || event.target.status == 0) {
					//Status 0 is setup when protocol is "file:///" or "ftp://"
					var blob = xhr.response;
					const currentFileUpload = new FileUpload(blob);
					this.fuService.pushFileToStorage(currentFileUpload, okuniquekey, subPath)
					//this.upload(blob, subPath);
					//Use blob to upload the file
				} else {
					console.error('Unable to download the blob');
				}
			}
		};
		xhr.open('GET', url, true);
		xhr.send();
	}
	private async getTextFromFile(event: any) {
		const file: File = event.target.files[0];
		let fileContent = await file.text();

		return fileContent;
	}
	ngOnInit(): void { }
	/** Announce the change in sort state for assistive technology. */
	announceSortChange(sortState: Sort) {
		// This example uses English messages. If your application supports
		// multiple language, you would internationalize these strings.
		// Furthermore, you can customize the message to add additional
		// details about the values being sorted.
		if (sortState.direction) {
			this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
		} else {
			this._liveAnnouncer.announce('Sorting cleared');
		}
	}
	onEdit(event: OKEvent): void {
		this.editedElement = { ...event };
		this.minEndDate = new Date(event.dtstart);
		this.formGroup = new FormGroup({
			dtstart: new FormControl(event.dtstart),
			dtend: new FormControl(event.dtend),
			uid: new FormControl(event.uid),
			description: new FormControl(event.description, [
				Validators.required,
				Validators.minLength(5),
			]),
			location: new FormControl(event.location, [
				Validators.required,
				Validators.minLength(3),
			]),
			summary: new FormControl(event.summary),
			//!tickets: new FormControl(event.tickets || 'Tickets URL', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]),
			tickets: new FormControl(''),
			url: new FormControl(event.url, [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]),
			//!thumb: new FormControl('https://', [Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]),
		}, {
			validators: [creatDateRangeValidator()]
		});
	}
	onDelete(event: OKEvent): void {
		this.dataSource.data = this.dataSource.data.filter(
			(item) => item.uid !== event.uid
		);
	}
	onSave(event: OKEvent): void {

		const editedItem = { ...event, ...this.formGroup?.value };

		if (this.formGroup?.valid) {
			this.dataSource.data.splice(
				this.dataSource.data.findIndex((item) => item.uid === event.uid),
				1,
				editedItem
			);
			this.dataSource.data = [...this.dataSource.data];
			const toclk = this.dataSource.data.find(
				(item) => item.uid === event.uid
			);
			if (toclk) {
				this.selection.select(toclk);
				//!toclk.isEdited = true;
			}
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
			dtstart: new FormControl(new Date()),
			dtend: new FormControl(new Date()),
			description: new FormControl('description', [
				Validators.required,
				Validators.minLength(5),
			]),
			location: new FormControl('location', [
				Validators.required,
				Validators.minLength(3),
			]),
			summary: new FormControl('summary'),
			tickets: new FormControl('www.abv.bg'),
			url: new FormControl('www.google.com'),
		});
		const nu: OKEvent = { ...this.formGroup.value }
		this.dataSource.data = [nu, ...this.dataSource.data];
		this.editedElement = nu;
	}
	openImageCropperDialog(incoming: any): void {
		let dialogRef = this.dialog.open(ImageCropperDialog, {
			width: '500px',
			data: { okuniquekey: incoming.okuniquekey, imgFullSize: incoming.imgFullSize }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				if (result.b64s.thumb) {
					incoming.thumb = result.b64s.thumb;
				}
				if (result.blobs.thumb) {
					if (!incoming.blobs) {
						incoming.blobs = {}
					}
					incoming.blobs.thumb = result.blobs.thumb;
				}
				if (result.b64s.imgFullSize) {
					incoming.imgFullSize = result.b64s.imgFullSize;
				}
				if (result.blobs.imgFullSize) {
					if (!incoming.blobs) {
						incoming.blobs = {}
					}
					incoming.blobs.imgFullSize = result.blobs.imgFullSize;
				}
			}
		});
	}

	public async saveAllToDB() {
		const updates: any = {};
		const additions: any = [];
		this.selection.selected.forEach(async (selectedItem: any) => {
			if (selectedItem['okuniquekey']) { //!item retrieved from db and edited
				const dbEntry = this.dbCourses.find(x => x['okuniquekey'] === selectedItem['okuniquekey']);
				if (!dbEntry) {
					selectedItem.dtstart = selectedItem.dtstart.toJSON();
					selectedItem.dtend = selectedItem.dtend.toJSON();
					additions.push(selectedItem);
				} else {
					for (const key in selectedItem) {
						if (Object.prototype.hasOwnProperty.call(selectedItem, key)) {
							if ((key === 'isExpired') || (key === 'blobs')) {
								continue;
							}
							let newElement = selectedItem[key];
							let oldElement = dbEntry[key];

							if (key === 'dtstart' || key === 'dtend') {
								newElement = moment(newElement);
								if (!oldElement || !moment(oldElement).isSame(newElement)) {
									updates['/courses/' + selectedItem.okuniquekey + '/' + key] = newElement.toJSON();
								}
							} else {
								if (!oldElement || (oldElement !== newElement)) {
									updates['/courses/' + selectedItem.okuniquekey + '/' + key] = (typeof newElement === 'string') ? newElement : JSON.stringify(newElement);
								}
							}
						}
					}
					if (selectedItem.blobs) {
						if (selectedItem.blobs.thumb) {
							const resUrl = await this.coursesService.saveBlob('thumb', selectedItem.blobs.thumb, selectedItem.okuniquekey);
							if (resUrl) {
								updates['/courses/' + selectedItem.okuniquekey + '/thumb'] = resUrl
							}
						}
						if (selectedItem.blobs.imgFullSize) {
							const resUrl = await this.coursesService.saveBlob('imgFullSize', selectedItem.blobs.imgFullSize, selectedItem.okuniquekey);
							if (resUrl) {
								updates['/courses/' + selectedItem.okuniquekey + '/imgFullSize'] = resUrl
							}
						}
						delete updates['/courses/' + selectedItem.okuniquekey + '/blobs']
					}
				}
			} else {
				selectedItem.dtstart = selectedItem.dtstart.toJSON();
				selectedItem.dtend = selectedItem.dtend.toJSON();
				additions.push(selectedItem);
			}

			if (Object.entries(updates).length) {
				this.coursesService.update(updates);
			}
			if (additions.length) {
				for (let i = 0; i < additions.length; i++) {
					const element = additions[i];
					this.coursesService.save(element);
				}
			}
			console.log('updates: ', updates);
			console.log('additions: ', additions);
		});
		this.selection.clear();
	}
}