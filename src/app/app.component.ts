//https://medium.com/vendasta/wrapping-angular-material-table-styling-it-once-drag-drop-sorting-b1765c995b40
import { Component, OnInit, ViewChild,ViewChildren } from '@angular/core';
import { Build,DataService } from './data.service';
import {PageEvent} from '@angular/material/paginator';
import {TreeComponent} from './tree/tree.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  //@ViewChildren('AppComponent') tree: AppComponent;
  @ViewChild("userInformation",{static:true}) tree: TreeComponent;

  private startRow:number;
  private endrow:number;
  selectedRowCnt=0;
  builds : Build[] = [];
  selectedBuild: Build[] = [];
  public columns = ['Build_ID', 'Portfolio_Name', 'ValueStream_Name', 'CI_Application_Name', 'Test_Environment', 'Test_Type', 'Start_DateTimeStamp', 'Build_Status'];
  selectedBuildId="";
  constructor(private buildservice: DataService) { }
  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [10, 50, 100];
  ngOnInit() {
    this.startRow=1;
    this.endrow=10;
  }
  loadTable(){
    //console.log("selected#"+this.tree.getSelectedApps());
    console.log("selected#"+this.tree.getSelectedApps());
    this.buildservice.getBuilds(this.startRow,this.endrow).subscribe
    (
      (response)=>
      {
        this.builds = response
      },
      (error) => console.log(error) 
    )
    
    
  }
    // MatPaginator Output
    pageEvent: PageEvent;
    setPageSizeOptions(setPageSizeOptionsInput: string) {
      if (setPageSizeOptionsInput) {
        this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
      }
    }
  nextRecords(){
    this.startRow=this.startRow+9;
    this.endrow=this.endrow+9;
    this.loadTable();
  }
  prevRecords(){
    this.startRow=this.startRow-9;
    this.endrow=this.endrow-9;
    this.loadTable();
  }
  RowSelected(objBuild:Build){
    //console.log(objBuild);   // declare variable in component.
      var index = this.selectedBuild.findIndex(item => item.Build_ID === objBuild.Build_ID);
     if (index === -1) {
        this.selectedBuild.push(objBuild);
        this.selectedRowCnt=this.selectedBuild.length;
        console.log("added");
      }
      this.selectedBuildId=objBuild.Build_ID;
  }
  nextPage(){
  }

  ngAfterViewInit() {
    //console.log("selected#"+this.childComponentReference.getSelectedApps());
    //console.log("selected#"+this.tree);
  }

}