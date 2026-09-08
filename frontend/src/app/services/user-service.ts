import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, Role, UserStats } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(role?: Role): Observable<User[]> {
    let params = new HttpParams();
    if (role) {
      params = params.set('role', role);
    }
    return this.http.get<User[]>(this.apiUrl, { params });
  }

  updateRole(id: string, role: Role): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/role`, { role });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStats(id: string): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/${id}/stats`);
  }
}