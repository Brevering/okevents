import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { CoursesService } from 'src/app/shared/services/courses.service';
import { OKEvent } from './../../shared/models/event';
import { CourseComponent } from './../course/course.component';

@Component({
    selector: 'app-events-list',
    templateUrl: './events-list.component.html',
    styleUrls: ['./events-list.component.css']
})
export class EventsListComponent implements OnInit {
    private courses: any[] = [];
    public breakpoint!: number;
    private expiredCourses: OKEvent[] = [];
    private currentCourses: any[] = [];
    public coursesToShow: any[] = [];
    public dateFilterStrings = [
        { val: 1, lbl: 'today' },
        { val: 7, lbl: 'this week' },
        { val: 30, lbl: 'this month' }
    ]
    public activeCourseId: string | null = null;
    private courseChangesub: any;
    private courseActivesub: any;
    @ViewChild('eventTemplate') dialogTemplate!: TemplateRef<any>;

    constructor(private coursesService: CoursesService, private route: ActivatedRoute, public dialog: MatDialog) {
        moment.locale('bg')
        this.courseChangesub = this.coursesService.getCourses().subscribe((res) => {
            this.courses = JSON.parse(JSON.stringify(res));
            const timdnow = moment();
            this.courses = this.courses.map((event: any) => {
                const dts = moment(event.dtstart);
                const dte = moment(event.dtend);
                const startString = dts.calendar() //!dts.isBefore(timdnow) ? dts.toNow() : dts.fromNow();
                const endString = dte.calendar() //!dte.isBefore(timdnow) ? dte.toNow() : dte.fromNow();
                event['dateStrings'] = { start: startString, end: endString }
                return event;
            })

            this.courses.forEach((row) => {
                const dte = moment(row.dtend);
                //if (timdnow.diff(dte, 'days') >= 14) {
                if (dte.isBefore(moment())) {
                    this.expiredCourses.push(row);
                    row['isExpired'] = true;
                } else {
                    this.currentCourses.push(row);
                }
            })
            this.coursesToShow = JSON.parse(JSON.stringify(this.courses));
            if (this.activeCourseId) {
                this.openSelectedEvent('' + this.activeCourseId);
                this.activeCourseId = null;
            }
            //!this.dataSource.data.forEach(row => this.selection.select(row));
        });
    }

    private openSelectedEvent(id: string) {
        const incoming = this.courses.find(x => x.okuniquekey === id)
        if (incoming) {
            const dialogRef = this.dialog.open(this.dialogTemplate, {
                width: '500px',
                data: incoming
            });
        }

    }

    public openEventOnClick(event:OKEvent){
        const dialogRef = this.dialog.open(this.dialogTemplate, {
            data: event
        });
    }

    filterByDates(date: number): void {
        const allCourses = JSON.parse(JSON.stringify(this.courses));
        let filterStartDate = moment().startOf('year');
        let filterEndDate = moment().endOf('year');
        switch (date) {
            case 1:
                filterStartDate = moment().startOf('day');
                filterEndDate = moment().endOf('day');
                break;
            case 7:
                filterStartDate = moment().startOf('week');
                filterEndDate = moment().endOf('week');
                break;
            case 30:
                filterStartDate = moment().startOf('month');
                filterEndDate = moment().endOf('month');
                break;

            default:
                break;
        }
        this.coursesToShow = allCourses.filter((x: OKEvent) => {
            const eventStartDate = moment(x.dtstart);
            return eventStartDate.isBetween(filterStartDate, filterEndDate, undefined, '[]');
        })

    }
    ngOnInit(): void {
        this.breakpoint = Math.floor(window.innerWidth / 450) || 1;
        this.courseActivesub = this.route.params.subscribe(params => {
            this.activeCourseId = params['id']; // (+) converts string 'id' to a number
        });
    }

    onResize(event: any) {
        this.breakpoint = Math.floor(event.target.innerWidth / 450) || 1;
    }

    ngOnDestroy() {
        this.courseChangesub.unsubscribe();
        this.courseActivesub.unsubscribe();
    }

}
