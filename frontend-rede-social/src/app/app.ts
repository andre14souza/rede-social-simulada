import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// 1. Importe o Dashboard aqui
import { DashboardComponent } from './dashboard/dashboard'; 

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. Adicione o DashboardComponent nesta lista de imports
  imports: [RouterOutlet, DashboardComponent], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'frontend-rede-social';
}