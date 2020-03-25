import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { TreeComponent } from './../tree/tree.component';
import { Build, DataService } from './../data.service';
import { FormControl, NgModel } from '@angular/forms';
@Component({
  selector: 'app-tbluseractivity',
  templateUrl: './tbluseractivity.component.html',
  styleUrls: ['./tbluseractivity.component.css']
})

export class TbluseractivityComponent implements AfterViewInit {

  //============================  TABLE =========================================================//
  //filter-Listbox
  buildStatusList: any[] = [
    { value: 'Passed', viewValue: 'Passed' },
    { value: 'Failed', viewValue: 'Failed' },
  ];

  displayedColumns: string[] = ['Build_ID', 'Start_DateTimeStamp','Updated_On', 'Portfolio_Name', 'ValueStream_Name', 'CI_Application_Name', 'Test_Environment', 'Build_Status', 'Predicted_RCA', 'Actual_RCA', 'RCA_Review_Status'];
  exampleDatabase: BuildHttpDatabase | null;
  data: Build[] = [];
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

 
  //@ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  constructor(private _httpClient: HttpClient, private changeDetectorRefs: ChangeDetectorRef) { }

  //===============================================================================================
 
  ngAfterViewInit() {
    this.exampleDatabase = new BuildHttpDatabase(this._httpClient);
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe();
    merge(this.sort.sortChange)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase!.getBuilds(
            this.sort.active, this.sort.direction, 0, 0, "", "", "", "", "", "", "", "", "", "", "", "");
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

  refreshData() {
    //this.paginator.pageIndex = 0;
    this.sort.sortChange.subscribe();
    merge(this.sort.sortChange)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase!.getBuilds(
           // this.sort.active, this.sort.direction, this.paginator.pageIndex, this.pageSize, this.filter_Applications, this.filter_FromDate, this.filter_ToDate, this.filter_PredictedRCA, this.filter_ActualRCA, this.filter_Environemnt, this.filter_TestType, this.filter_TestingTool, this.filter_TriggerType, this.filter_ReviewStatus, this.filter_Owner, this.filter_BuildStatus);
           this.sort.active, this.sort.direction, 0, 0, "", "", "", "", "", "", "", "", "", "", "", "");
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


  onApprove(build_Id) {
    console.log(build_Id);
    this._httpClient.post<any>('http://localhost:8080/api/approve', { "id": build_Id }).subscribe(data => { this.refreshData(); })
  }
  onArchive(build_Id) {
    console.log(build_Id);
    this._httpClient.post<any>('http://localhost:8080/api/archive', { "id": build_Id }).subscribe(data => { this.refreshData(); })
  }

  onArchive_Bulk(){

  }

  tabClick(tab) {
    if(tab.index==1){
      console.log(tab.index);
    }
    
  }
}
interface BuildApi {
  builds: Build[];
  total_count: number;
}

class BuildHttpDatabase {
  constructor(private _httpClient: HttpClient) { }
  getBuilds(sort: string, order: string, page: number, size: number, apps: string, _date_from: string, _date_to: string, _predicted_rca: string, _actual_rca: string, _environment: string, _test_type: string, _test_tool: string, _trigger_type: string, _review_status: string, _owner: string, _build_status: string): Observable<BuildApi> {
    _review_status="Approved";
    const requestUrl = `http://localhost:8080/api/userbuilds/?sr=${sort}&od=${order}&pg=&sz=&ap=${apps}&df=${_date_from}&dt=${_date_to}&pc=${_predicted_rca}&ac=${_actual_rca}&ev=${_environment}&tp=${_test_type}&tt=${_test_tool}&tg=${_trigger_type}&rs=${_review_status}&ow=${_owner}&bs=${_build_status}`;
    console.log(requestUrl);
    return this._httpClient.get<BuildApi>(requestUrl);
  }
}
