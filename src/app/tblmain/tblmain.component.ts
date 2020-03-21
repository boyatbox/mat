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
  selector: 'app-tblmain',
  templateUrl: './tblmain.component.html',
  styleUrls: ['./tblmain.component.css']
})
export class TblmainComponent implements AfterViewInit {

  //TEST-SUITE-TYPE
  listItem_PredictedRCA: string[] = ['Script Issue', 'Application upgrade', 'Environment Issue', 'Configuration Issue'];
  listItem_ActualRCA: string[] = ['Script Issue', 'Application upgrade', 'Environment Issue', 'Configuration Issue'];
  listItem_TestType: string[] = ['Sanity', 'Smoke', 'Regression'];
  listItem_Environemnt: string[] = ['Dev', 'QA', 'Stage', 'Prod'];
  listItem_TestingTool: string[] = ['UFT', 'CITS', 'Other'];
  listItem_TriggerType: string[] = ['Auto', 'Manual'];
  listItem_BuildStatus: string[] = ['Passed', 'Failed'];
  listItem_ReviewStatus: string[] = ['Approved', 'Updated', 'Pending'];
  listItem_Owner: string[] = ['user1@app.com', 'user2@app.com', 'user3@app.com'];

  selectedOptions_PredictedRCA = [];
  selectedOptions_ActualRCA = [];
  selectedOptions_TestType = [];
  selectedOptions_Environemnt = [];
  selectedOptions_TestingTool = [];
  selectedOptions_TriggerType = [];
  selectedOptions_BuildStatus = [];
  selectedOptions_ReviewStatus = [];
  selectedOptions_Owner = [];
  //============================  TABLE =========================================================//
  //filter-Listbox
  buildStatusList: any[] = [
    { value: 'Passed', viewValue: 'Passed' },
    { value: 'Failed', viewValue: 'Failed' },
  ];
  pageSizeOptions: number[] = [10, 25, 100];
  pageSize = 10;
  displayedColumns: string[] = ['Select', 'Build_ID', 'Portfolio_Name', 'ValueStream_Name', 'CI_Application_Name', 'Test_Environment', 'Build_Status', 'Start_DateTimeStamp', 'Predicted_RCA', 'Actual_RCA', 'RCA_Review_Status', 'action'];
  exampleDatabase: BuildHttpDatabase | null;
  data: Build[] = [];
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  selectedPredictedRCA;
  selected_build_status: string = "";
  //selected_predicted_rca:string="";
  //filter
  dtfrm: Date;
  dtto: Date;

  filter_FromDate: string = "";
  filter_ToDate: string = "";
  filter_PredictedRCA: string = "";
  filter_ActualRCA: string = "";
  filter_TestType: string = "";
  filter_Environemnt: string = "";
  filter_TestingTool: string = "";
  filter_TriggerType: string = "";
  filter_BuildStatus: string = "";
  filter_ReviewStatus: string = "";
  filter_Owner: string = "";

  //tree selection
  filter_Applications: string = "";
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  constructor(private _httpClient: HttpClient, private changeDetectorRefs: ChangeDetectorRef) { }
  /*  update(el: Element, action: string) {
     if (action == null) { return; }
     // copy and mutate
     //const copy = this.dataSource.data().slice()
     el.action = action;
     //this.dataSource.update(copy);
   } */
  //===============================================================================================
  initialSelection: string[] = [];
  allowMultiSelect: boolean = true;
  selection = new SelectionModel<string>(this.allowMultiSelect, this.initialSelection);
  docsOnThisPage: any[] = [];
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.docsOnThisPage.length;
    const numRows = this.data.length;
    //console.log("numRows"+numRows+"//numSelected:"+numSelected);
    return (numSelected === numRows);
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.data.forEach(row => this.selection.select(row.Build_ID));
    this.isAllSelected() ?
      (
        this.docsOnThisPage.length = 0,
        this.data.forEach(row => this.selection.deselect(row['Build_ID']))
      ) :
      this.data.forEach(
        row => {
          this.selection.select(row['Build_ID']);
          this.docsOnThisPage.push(row['Build_ID']);
        }
      );
  }
  /** The label for the checkbox on the passed row */
  /*   checkboxLabel(row?: Build): string {
      if (!row) {
        return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
      }
      return `${this.selection.isSelected(row.Build_ID) ? 'deselect' : 'select'} row ${row.Build_ID + 1}`;
    }
   */
  //===============================================================================================
  changePage(event) {
    this.pageSize = event.pageSize;
    console.log(this.pageSize);
    console.log(this.selection.selected);
  }
  ngAfterViewInit() {
    this.exampleDatabase = new BuildHttpDatabase(this._httpClient);
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase!.getBuilds(
            //this.sort.active, this.sort.direction, this.paginator.pageIndex, this.pageSize, "", "", "", "", "");
            this.sort.active, this.sort.direction, this.paginator.pageIndex, this.pageSize, "", "", "", "", "", "", "", "", "", "", "", "");
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

  onNgModelChange_PredictedRCA($event) {
    console.log($event);
    this.selectedOptions_PredictedRCA = $event;
  }
  onNgModelChange_ActualRCA($event) {
    console.log($event);
    this.selectedOptions_PredictedRCA = $event;
  }
  onNgModelChange_Environemnt($event) {
    console.log($event);
    this.selectedOptions_Environemnt = $event;
  }
  onNgModelChange_TestType($event) {
    console.log($event);
    this.selectedOptions_TestType = $event;
  }
  onNgModelChange_TestingTool($event) {
    console.log($event);
    this.selectedOptions_TestingTool = $event;
  }
  onNgModelChange_TriggerType($event) {
    console.log($event);
    this.selectedOptions_TestingTool = $event;
  }
  onNgModelChange_BuildStatus($event) {
    console.log($event);
    this.selectedOptions_BuildStatus = $event;
  }
  onNgModelChange_ReviewStatus($event) {
    console.log($event);
    this.selectedOptions_ReviewStatus = $event;
  }
  onNgModelChange_Owner($event) {
    console.log($event);
    this.selectedOptions_Owner = $event;
  }

  clearfilters() {
    this.childapptree.clearSelection();
    this.selectedOptions_PredictedRCA = [];
    this.selectedOptions_ActualRCA = [];
    this.selectedOptions_TestType = [];
    this.selectedOptions_Environemnt = [];
    this.selectedOptions_TestingTool = [];
    this.selectedOptions_TriggerType = [];
    this.selectedOptions_BuildStatus = [];
    this.selectedOptions_ReviewStatus = [];
    this.selectedOptions_Owner=[];
    this.refreshData();
  }

  @ViewChild('childAppTree', { static: false }) childapptree;
  filterData() {

    //get filters
    if (this.selectedOptions_PredictedRCA) {
      this.filter_PredictedRCA = this.selectedOptions_PredictedRCA.join();
    }
    if (this.selectedOptions_ActualRCA) {
      this.filter_ActualRCA = this.selectedOptions_ActualRCA.join();
    }
    if (this.selectedOptions_TestType) {
      this.filter_TestType = this.selectedOptions_TestType.join();
    }
    if (this.selectedOptions_Environemnt) {
      this.filter_Environemnt = this.selectedOptions_Environemnt.join();
    }
    if (this.selectedOptions_TestingTool) {
      this.filter_TestingTool = this.selectedOptions_TestingTool.join();
    }
    if (this.selectedOptions_TriggerType) {
      this.filter_TriggerType = this.selectedOptions_TriggerType.join();
    }
    if (this.selectedOptions_BuildStatus) {
      this.filter_BuildStatus = this.selectedOptions_BuildStatus.join();
    }
    if (this.selectedOptions_ReviewStatus) {
      this.filter_BuildStatus = this.selectedOptions_ReviewStatus.join();
    }
    if (this.selectedOptions_Owner) {
      this.filter_Owner = this.selectedOptions_Owner.join();
    }

    this.filter_Applications = this.childapptree.getSelectedApps();

    if (this.dtfrm && this.dtto) {
      var _month = this.dtfrm.getMonth() + 1; //months from 1-12
      var month = (_month > 9 ? '' : '0') + _month;
      var _day = this.dtfrm.getDate();
      var day = (_day > 9 ? '' : '0') + _day;
      var year = this.dtfrm.getFullYear();
      this.filter_FromDate = year + "-" + month + "-" + day;
      var _month = this.dtto.getMonth() + 1; //months from 1-12
      var month = (_month > 9 ? '' : '0') + _month;
      var _day = this.dtto.getDate();
      var day = (_day > 9 ? '' : '0') + _day;
      var year = this.dtto.getFullYear();
      this.filter_ToDate = year + "-" + month + "-" + day;
    }
    this.paginator.pageIndex = 0
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase!.getBuilds(
            this.sort.active, this.sort.direction, this.paginator.pageIndex, this.pageSize, this.filter_Applications, this.filter_FromDate, this.filter_ToDate, this.filter_PredictedRCA, this.filter_ActualRCA, this.filter_Environemnt, this.filter_TestType, this.filter_TestingTool, this.filter_TriggerType, this.filter_ReviewStatus, this.filter_Owner, this.filter_BuildStatus);
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
          // Catch if reached rate limit. Return empty data.
          this.isRateLimitReached = true;
          return observableOf([]);
        })
      ).subscribe(data => this.data = data);
  }

  refreshData() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase!.getBuilds(
           // this.sort.active, this.sort.direction, this.paginator.pageIndex, this.pageSize, this.filter_Applications, this.filter_FromDate, this.filter_ToDate, this.filter_PredictedRCA, this.filter_ActualRCA, this.filter_Environemnt, this.filter_TestType, this.filter_TestingTool, this.filter_TriggerType, this.filter_ReviewStatus, this.filter_Owner, this.filter_BuildStatus);
           this.sort.active, this.sort.direction, this.paginator.pageIndex, this.pageSize, "", "", "", "", "", "", "", "", "", "", "", "");
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
    //this._httpClient.post<any>('http://localhost:8080/api/approve', { "id": build_Id }).subscribe(data => { })
    this._httpClient.post<any>('http://localhost:8080/api/approve', { "id": build_Id }).subscribe(data => { this.refreshData(); })
  }
}
export interface BuildApi {
  builds: Build[];
  total_count: number;
}

export class BuildHttpDatabase {
  constructor(private _httpClient: HttpClient) { }
  getBuilds(sort: string, order: string, page: number, size: number, apps: string, _date_from: string, _date_to: string, _predicted_rca: string, _actual_rca: string, _environment: string, _test_type: string, _test_tool: string, _trigger_type: string, _review_status: string, _owner: string, _build_status: string): Observable<BuildApi> {
    //localhost:8080/api/builds/?sort=Build_ID&order=ASC&pg=1&sz=3&app=CIApplication-ACA&dtfrm=2019-11-01&dtto=2019-11-30&prc=Script Issue&st=passed,failed
    //http://localhost:8080/api/builds/?sr=Build_ID&od=ASC&pg=1&sz=3&ap=&df=&dt=&pc=&ac=&ev=&tp=&tt=&tg=&rs=&ow=&bs=
    const requestUrl = `http://localhost:8080/api/builds/?sr=${sort}&od=${order}&pg=${page + 1}&sz=${size}&ap=${apps}&df=${_date_from}&dt=${_date_to}&pc=${_predicted_rca}&ac=${_actual_rca}&ev=${_environment}&tp=${_test_type}&tt=${_test_tool}&tg=${_trigger_type}&rs=${_review_status}&ow=${_owner}&bs=${_build_status}`;
    console.log(requestUrl);
    return this._httpClient.get<BuildApi>(requestUrl);
  }
  //============================  TABLE =========================================================//

  //============================  APP TREE =========================================================//
  //============================  APP TREE =========================================================//
}
