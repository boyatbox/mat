import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'Rxjs'

export interface Build {
  Build_ID: string;
  Portfolio_Name: string;
  ValueStream_Name: string;
  CI_Application_Name: string;
  Test_Environment: string;
  Test_Type: string;
  Build_Status: string;
  Start_DateTimeStamp: string;
}
@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) { }
  getBuilds(startIndex: number, endIndex: number): Observable<Build[]> {
    var serviceUrl: string = `http://localhost:8080/api/builds?start=${startIndex}&end=${endIndex}`;
    return this.http.get<Build[]>(serviceUrl);
  }

  getAppTree(): Observable<any[]> {
    var serviceUrl: string = `http://localhost:8080/api/apps`;
    return this.http.get<any[]>(serviceUrl);
  }
}