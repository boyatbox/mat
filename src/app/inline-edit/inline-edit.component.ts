import { Component, Input, Optional, Host, EventEmitter, Output } from '@angular/core';
import { SatPopover } from '@ncstate/sat-popover';
import { filter } from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
@Component({
  selector: 'inline-edit',
  templateUrl: './inline-edit.component.html',
  styleUrls: ['./inline-edit.component.css'],
})
/* <input matInput maxLength="140" name="comment" [(ngModel)]="comment">
        <mat-hint align="end">{{comment?.length || 0}}/140</mat-hint> */

 
export class InlineEditComponent {
  fieldvalue:string="";

  @Output() myEvent = new EventEmitter<string>();
  @Input()
  get value(): string {return this._value;}
  set value(x: string) {this._value = x;}
  // set value(x: string) {this.comment = this._value = x;}
  private _value = '';
  /** Form model for the input. */
  // comment = '';
  constructor(@Optional() @Host() public popover: SatPopover,private _httpClient: HttpClient) { }
  ngOnInit() {
    // subscribe to cancellations and reset form value
    // if (this.popover) {
    //   this.popover.closed.pipe(filter(val => val == null))
    //     .subscribe(() => this.comment = this.value || '');
    // }
  }
  onSave() {
    // if (this.popover) {
    //   this.popover.close(this.comment);
    // }
    
    let build_Id=this.value;
    console.log("onSave=>fieldvalue:"+this.fieldvalue);
    console.log("onSave=>build_Id:"+build_Id);
    let field_value=this.fieldvalue;
    this._httpClient.post<any>('http://localhost:8080/api/update', {"id":build_Id,"rca":field_value}).subscribe(data => {this.myEvent.emit('hello-save');})
    if (this.popover) {
      this.popover.close();
    }
    
    
  }
  onCancel() {
    //console.log("onCancel");
    //this.myEvent.emit('hello-cancel');
    if (this.popover) {
      this.popover.close();
    }
  }
}