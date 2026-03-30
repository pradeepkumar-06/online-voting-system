import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VotingService, Candidate } from '../services/voting.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full max-w-5xl mt-10 relative">
      <div *ngIf="authService.isAdmin()" class="absolute right-0 top-0 mt-2 flex gap-4">
        <button (click)="resetVoting()" class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-semibold transition-colors border border-yellow-500/50 shadow-lg shadow-yellow-500/20">
          Reset Voting
        </button>
        <button *ngIf="votingActive" (click)="endVoting()" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors border border-red-500/50 shadow-lg shadow-red-500/20">
          End Voting & Publish Results
        </button>
      </div>

      <div class="text-center mb-12">
        <h2 class="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Presidential Election 2026</h2>
        
        <p *ngIf="!hasVoted && votingActive && !authService.isAdmin()" class="text-xl text-blue-300 font-light">Please cast your single vote cautiously.</p>
        <p *ngIf="hasVoted && votingActive" class="text-xl text-green-400 font-light flex items-center justify-center gap-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          You have successfully voted.
        </p>
        <p *ngIf="!votingActive" class="text-xl text-yellow-400 font-light flex items-center justify-center gap-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          Voting has officially ended.
        </p>
      </div>

      <div *ngIf="loading" class="flex justify-center my-20">
         <span class="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></span>
      </div>

      <div *ngIf="!loading && (!hasVoted || votingActive)" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div *ngFor="let candidate of candidates" class="glass-panel p-6 card-hover flex flex-col justify-between group">
          <div>
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 flex items-center justify-center text-xl font-bold drop-shadow-lg">
              {{ candidate.name.charAt(0) }}
            </div>
            <h3 class="text-2xl font-semibold mb-2">{{ candidate.name }}</h3>
            <p class="text-gray-400 text-sm mb-6">{{ candidate.description }}</p>
          </div>
          <button *ngIf="votingActive && !hasVoted && !authService.isAdmin()" (click)="vote(candidate._id)" class="btn-primary w-full mt-auto opacity-90 group-hover:opacity-100">
            Vote for {{ candidate.name.split(' ')[0] }}
          </button>
        </div>
      </div>

      <div *ngIf="!loading && (authService.isAdmin() || resultsPublished)" class="glass-panel p-8 max-w-3xl mx-auto border-t border-t-white/20 mt-8 mb-12 animate-fade-in-up">
        <h3 class="text-2xl font-bold mb-8 text-center border-b border-white/10 pb-4 flex items-center justify-center gap-3">
          <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          Live Results
          <span *ngIf="!resultsPublished" class="text-xs font-normal px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full ml-2 border border-blue-500/30">Admin Only view</span>
        </h3>
        
        <div class="space-y-6">
          <div *ngFor="let candidate of candidates" class="relative">
            <div class="flex justify-between mb-2">
              <span class="font-medium text-lg">{{ candidate.name }}</span>
              <span class="text-blue-300 font-bold shrink-0">{{ candidate.votes || 0 }} votes ({{ getPercentage(candidate.votes) }}%)</span>
            </div>
            <div class="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div 
                class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                [style.width]="getPercentage(candidate.votes) + '%'">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  candidates: Candidate[] = [];
  hasVoted = false;
  loading = true;
  totalVotes = 0;
  votingActive = true;
  resultsPublished = false;

  constructor(private votingService: VotingService, public authService: AuthService) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.votingService.getCandidates().subscribe({
      next: (data: any) => {
        this.candidates = data.candidates;
        this.hasVoted = data.hasVoted;
        this.votingActive = data.votingActive;
        this.resultsPublished = data.resultsPublished;
        this.totalVotes = this.candidates.reduce((acc, curr) => acc + (curr.votes || 0), 0);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching data', err);
        this.loading = false;
      }
    });
  }

  vote(candidateId: string) {
    this.votingService.vote(candidateId).subscribe({
      next: () => {
        this.fetchData();
      },
      error: (err: any) => {
        alert('Error: ' + (typeof err.error === 'string' ? err.error : err.error?.error));
      }
    });
  }

  endVoting() {
    if (confirm('Are you sure you want to end the voting and publish results? This cannot be undone.')) {
      this.votingService.endVoting().subscribe({
        next: () => this.fetchData(),
        error: (err: any) => alert('Error: ' + err.error?.error)
      });
    }
  }

  resetVoting() {
    if (confirm('Are you sure you want to completely RESET the voting? All votes and user statuses will be cleared, and voting will be set back to active.')) {
      this.votingService.resetVoting().subscribe({
        next: () => this.fetchData(),
        error: (err: any) => alert('Error: ' + err.error?.error)
      });
    }
  }

  getPercentage(votes: number | undefined): string {
    if (!votes || this.totalVotes === 0) return '0.0';
    return ((votes / this.totalVotes) * 100).toFixed(1);
  }
}
