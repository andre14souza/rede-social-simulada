import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // O endereço do seu Back-end Node.js
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // 1. Buscar todos os usuários (GET)
  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios`);
  }

  // 2. Criar usuário (POST)
  adicionarUsuario(nome: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, { nome });
  }

  // 3. Criar conexão (POST)
  // MUDANÇA: Agora recebe string (nomes) em vez de number (IDs)
  adicionarConexao(nomeA: string, nomeB: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/conexoes`, { 
      nome_usuario_a: nomeA, 
      nome_usuario_b: nomeB 
    });
  }
  
  // 4. Buscar dados do grafo (GET)
  getGrafo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/grafo`);
  }
}