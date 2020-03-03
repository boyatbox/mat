import {HttpClient} from '@angular/common/http';
import {Component, ViewChild, AfterViewInit,OnInit, Input} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {merge, Observable, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import {TreeComponent} from './../tree/tree.component';

import { Build,DataService } from './../data.service';
/**
 * @title Table retrieving data through HTTP
 */
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements AfterViewInit {
  displayedColumns: string[] = ['Build_ID', 'CI_Application_Name', 'Test_Environment', 'Build_Status'];
  exampleDatabase: ExampleHttpDatabase | null;
  data: Build[] = [];
  selectedTreeItems:string="";
  dtfrm:Date;
  dtto:Date;
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  filter_fromdate:string="";
  filter_todate:string="";
  @ViewChild(MatPaginator,{static: false}) paginator: MatPaginator;
  @ViewChild(MatSort,{static: false}) sort: MatSort;

  constructor(private _httpClient: HttpClient) {}

  ngAfterViewInit() {
    this.exampleDatabase = new ExampleHttpDatabase(this._httpClient);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase!.getRepoIssues(
            this.sort.active, this.sort.direction, this.paginator.pageIndex,"","","");
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.total_count;
          return data.builds;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          this.isRateLimitReached = true;
          return observableOf([]);
        })
      ).subscribe(data => this.data = data);
  }

  @Input() objtree: TreeComponent;
  filterData(){

    this.selectedTreeItems=this.objtree.getSelectedApps();
    //console.log(this.dtfrm); 
    var _month = this.dtfrm.getMonth()+1; //months from 1-12
    var month=(_month>9 ? '' : '0') + _month;
    var _day = this.dtfrm.getDate();
    var day=(_day>9 ? '' : '0') + _day;
    var year = this.dtfrm.getFullYear();
    this.filter_fromdate = year + "-" + month + "-" + day;

    var _month = this.dtto.getMonth()+1; //months from 1-12
    var month=(_month>9 ? '' : '0') + _month;
    var _day = this.dtto.getDate();
    var day=(_day>9 ? '' : '0') + _day;
    var year = this.dtto.getFullYear();
    this.filter_todate = year + "-" + month + "-" + day;

    
    this.paginator.pageIndex = 0
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase!.getRepoIssues(
            this.sort.active, this.sort.direction, this.paginator.pageIndex,this.selectedTreeItems,this.filter_fromdate,this.filter_todate);
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.total_count;
          return data.builds;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          this.isRateLimitReached = true;
          return observableOf([]);
        })
      ).subscribe(data => this.data = data);
  }

  refreshData(){

    this.paginator.pageIndex = 0
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase!.getRepoIssues(
            this.sort.active, this.sort.direction, this.paginator.pageIndex,this.selectedTreeItems,this.filter_fromdate,this.filter_todate);
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.total_count;
          return data.builds;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          this.isRateLimitReached = true;
          return observableOf([]);
        })
      ).subscribe(data => this.data = data);
  }




}

export interface BuildApi {
  builds: Build[];
  total_count: number;
}


/** An example database that the data source uses to retrieve data for the table. */
export class ExampleHttpDatabase {
  constructor(private _httpClient: HttpClient) {}
  getRepoIssues(sort: string, order: string, page: number,apps:string,_date_from:string,_date_to:string): Observable<BuildApi> {
    //http://localhost:8080/api/page/?sort=Build_ID&order=asc&pg=2&sz=3
    //const href = 'https://api.github.com/search/issues';

    //const requestUrl =`${href}?q=repo:angular/components&sort=${sort}&order=${order}&page=${page + 1}`;
    const requestUrl=`http://localhost:8080/api/page/?sort=${sort}&order=${order}&pg=${page + 1}&sz=3&app=${apps}&dtfrm=${_date_from}&dtto=${_date_to}`
    console.log(requestUrl);
    return this._httpClient.get<BuildApi>(requestUrl);
  }
}


/**  Copyright 2019 Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */