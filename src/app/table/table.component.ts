import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit, OnInit,Input, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import {TreeComponent} from './../tree/tree.component';
import { Build, DataService } from './../data.service';
import {FormControl, NgModel} from '@angular/forms';
/**
 * @title Table retrieving data through HTTP
 */
/* export interface Element {
  name: string;
  symbol: string;
  action?: string;
} */
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements AfterViewInit {
  //filter-Listbox
  PredictedRCA = new FormControl();
  PredictedRCAList: string[] = ['Script Issue', 'Application upgrade', 'Environment Issue'];
  buildStatusList: any[] = [
    {value: 'Passed', viewValue: 'Passed'},
    {value: 'Failed', viewValue: 'Failed'},
  ];
  pageSizeOptions: number[] = [10, 25, 100];
  pageSize = 10;
  displayedColumns: string[] = ['Select', 'Build_ID', 'Portfolio_Name', 'ValueStream_Name', 'CI_Application_Name', 'Test_Environment', 'Build_Status', 'Start_DateTimeStamp', 'Predicted_RCA', 'Actual_RCA', 'RCA_Review_Status', 'action'];
  exampleDatabase: ExampleHttpDatabase | null;
  data: Build[] = [];
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  model_predicted_rca;
  selected_build_status:string="";
  //selected_predicted_rca:string="";
  //filter
  dtfrm:Date;
  dtto:Date;
  filter_fromdate:string="";
  filter_todate:string="";
  filter_predictedRCA:string="";
  filter_buildStatus:string="";
  //tree selection
  selectedTreeItems:string="";
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
    this.exampleDatabase = new ExampleHttpDatabase(this._httpClient);
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase!.getRepoIssues(
            this.sort.active, this.sort.direction, this.paginator.pageIndex,this.pageSize,"","","","","");
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
    //console.log(this.model_predicted_rca.join());
    if(this.model_predicted_rca){
      this.filter_predictedRCA=this.model_predicted_rca.join();
    }
    this.filter_buildStatus=this.selected_build_status;
      //YYYY-MM-DD HH:MI:SS
    this.selectedTreeItems=this.objtree.getSelectedApps();
    //console.log(this.dtfrm); 
    if(this.dtfrm && this.dtto){
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
    }
    this.paginator.pageIndex = 0
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase!.getRepoIssues(
            this.sort.active, this.sort.direction, this.paginator.pageIndex,this.pageSize,this.selectedTreeItems,this.filter_fromdate,this.filter_todate,this.filter_predictedRCA,this.filter_buildStatus);
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
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase!.getRepoIssues(
            this.sort.active, this.sort.direction, this.paginator.pageIndex,this.pageSize,this.selectedTreeItems,this.filter_fromdate,this.filter_todate,this.filter_predictedRCA,this.filter_buildStatus);
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
    this._httpClient.post<any>('http://localhost:8080/api/approve', { "id": build_Id }).subscribe(data => {this.refreshData();})
  }
}
export interface BuildApi {
  builds: Build[];
  total_count: number;
}
/** An example database that the data source uses to retrieve data for the table. */
export class ExampleHttpDatabase {
  constructor(private _httpClient: HttpClient) { }
  getRepoIssues(sort: string, order: string, page: number,size:number,apps:string,_date_from:string,_date_to:string,_predicted_rca:string,_build_status:string): Observable<BuildApi> {
    //localhost:8080/api/builds/?sort=Build_ID&order=ASC&pg=1&sz=3&app=CIApplication-ACA&dtfrm=2019-11-01&dtto=2019-11-30&prc=Script Issue&st=passed,failed
    const requestUrl=`http://localhost:8080/api/builds/?sort=${sort}&order=${order}&pg=${page + 1}&sz=${size}&app=${apps}&dtfrm=${_date_from}&dtto=${_date_to}&prc=${_predicted_rca}&st=${_build_status}`;
    console.log(requestUrl);
    return this._httpClient.get<BuildApi>(requestUrl);
  }
}