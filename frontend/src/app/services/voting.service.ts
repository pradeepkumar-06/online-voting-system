import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface Candidate {
  _id: string;
  name: string;
  description: string;
  votes: number;
}

export interface VotingData {
  candidates: Candidate[];
  hasVoted: boolean;
  votingActive: boolean;
  resultsPublished: boolean;
}

@Injectable({ providedIn: 'root' })
export class VotingService {
  private apiUrl = 'https://online-voting-system-mks2.onrender.com/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
  }

  getCandidates() {
    return this.http.get<VotingData>(`${this.apiUrl}/candidates`, { headers: this.getHeaders() });
  }

  vote(candidateId: string) {
    return this.http.post<any>(`${this.apiUrl}/vote`, { candidateId }, { headers: this.getHeaders() });
  }

  endVoting() {
    return this.http.post<any>(`${this.apiUrl}/admin/end-voting`, {}, { headers: this.getHeaders() });
  }

  resetVoting() {
    return this.http.post<any>(`${this.apiUrl}/admin/reset-voting`, {}, { headers: this.getHeaders() });
  }
}
