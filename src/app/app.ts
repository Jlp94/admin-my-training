import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit{
  protected readonly title = signal('admin-my-training');
  protected readonly primeNg: PrimeNG = inject(PrimeNG);

  ngOnInit(): void {
    this.primeNg.ripple.set(true);
  }
}
