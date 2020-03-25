import { Component, Input, Optional, Host, EventEmitter, Output } from '@angular/core';
import { SatPopover } from '@ncstate/sat-popover';
import { filter } from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';

interface ActualRCA {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'inline-edit',
  templateUrl: './inline-edit.component.html',
  styleUrls: ['./inline-edit.component.css'],
})

export class InlineEditComponent {
  fieldvalue:string="";

  selectedActualRCA: string;
//['Script Issue', 'Application upgrade', 'Environment Issue', 'Configuration Issue'];
  arrActualRCA: ActualRCA[] = [
    {value: 'Script Issue', viewValue: 'Script Issue'},
    {value: 'Application upgrade', viewValue: 'Application upgrade'},
    {value: 'Environment Issue', viewValue: 'Environment Issue'},
    {value: 'Configuration Issue', viewValue: 'Configuration Issue'}
  ];



  @Output() myEvent = new EventEmitter<string>();
  @Input()
  get value(): string {return this._value;}
  set value(x: string) {this._value = x;}

  private _value = '';
  constructor(@Optional() @Host() public popover: SatPopover,private _httpClient: HttpClient) { }

  ngOnInit() {}

  onSave() {
    let build_Id=this.value;
    console.log("onSave=>fieldvalue:"+this.fieldvalue);
    console.log("onSave=>build_Id:"+build_Id);
    let field_value=this.fieldvalue;
    console.log("onSave=>build_Id.length:"+build_Id.length);
    if(build_Id.length){
      this._httpClient.post<any>('http://localhost:8080/api/update', {"id":build_Id,"rca":this.selectedActualRCA}).subscribe(data => {this.myEvent.emit('hello-save');})
    }else{
      this._httpClient.post<any>('http://localhost:8080/api/update', {"id":[build_Id],"rca":this.selectedActualRCA}).subscribe(data => {this.myEvent.emit('hello-save');})
    }
    
    if (this.popover) {
      this.popover.close();
    } 
  }
  onSaveAll() {
    let build_Id=this.value;
    console.log("onSave=>fieldvalue:"+this.fieldvalue);
    console.log("onSave=>build_Id:"+build_Id);
    let field_value=this.fieldvalue;
    this._httpClient.post<any>('http://localhost:8080/api/updateall', {"id":build_Id,"rca":field_value}).subscribe(data => {this.myEvent.emit('hello-save');})
    if (this.popover) {
      this.popover.close();
    }
  }
  onCancel() {
    if (this.popover) {
      this.popover.close();
    }
  }
}