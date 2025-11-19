import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api';
import cytoscape from 'cytoscape';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  totalUsuarios: number = 0;
  totalConexoes: number = 0;
  cy: any; // Variável para controlar o grafo

  constructor(
    private api: ApiService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('Dashboard iniciado.');
  }

  // IMPORTANTE: O grafo só pode ser desenhado DEPOIS que a tela (View) carrega
  ngAfterViewInit() {
    console.log('HTML pronto. Buscando dados iniciais...');
    this.atualizarDados();
  }

  atualizarDados() {
    // 1. Busca Contagem de Usuários
    this.api.getUsuarios().subscribe({
      next: (lista) => {
        this.totalUsuarios = lista.length;
        this.cdr.detectChanges(); // Força atualização do número na tela
      },
      error: (err) => console.error('Erro ao buscar usuários:', err)
    });

    // 2. Busca o Grafo Completo
    this.api.getGrafo().subscribe({
      next: (dados) => {
        if (dados && dados.edges) {
          this.totalConexoes = dados.edges.length;
        } else {
          this.totalConexoes = 0;
        }
        this.cdr.detectChanges();

        // Desenha o grafo com os dados recebidos
        this.renderizarGrafo(dados);
      },
      error: (err) => console.error('Erro ao buscar grafo:', err)
    });
  }

renderizarGrafo(dadosAPI: any) {
    const container = document.getElementById('cy');
    if (!container || !dadosAPI || !dadosAPI.nodes) return;

    if (this.cy) {
      this.cy.destroy();
    }

    const elementosNodes = dadosAPI.nodes.map((u: any) => ({
      data: { id: u.id.toString(), label: u.label }
    }));

    const elementosEdges = dadosAPI.edges.map((c: any) => ({
      data: { source: c.source.toString(), target: c.target.toString() }
    }));

    this.cy = cytoscape({
      container: container,
      elements: [...elementosNodes, ...elementosEdges],

      // INTERAÇÃO
      userZoomingEnabled: false, // Zoom travado (não arrasta a tela)
      userPanningEnabled: true,  // Pan liberado
      boxSelectionEnabled: false,

      style: [
        // --- NÓ HEXAGONAL ---
        {
          selector: 'node',
          style: {
            'shape': 'hexagon',             // <--- FORMATO
            'background-color': '#8b5cf6',  // Roxo Violeta Moderno
            'border-width': 0,
            
            // TEXTO
            'label': 'data(label)',
            'color': '#f1f5f9',             // Texto branco gelo
            'font-size': '13px',
            'font-family': 'Inter, sans-serif',
            'font-weight': 'bold',
            
            // POSIÇÃO DO TEXTO (EMBAIXO)
            'text-valign': 'bottom',
            'text-margin-y': 8,
            
            // FUNDO DO TEXTO (Legibilidade)
            'text-background-color': '#1e293b',
            'text-background-opacity': 0.8,
            'text-background-padding': '4px',
            'text-background-shape': 'roundrectangle',

            'width': 55,
            'height': 55
          }
        },
        // --- ARESTAS ---
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#475569',       // Cinza azulado
            'curve-style': 'bezier'
          }
        },
        // --- SELEÇÃO ---
        {
          selector: ':selected',
          style: {
            'background-color': '#22d3ee', // Azul Ciano Neon
            'line-color': '#22d3ee'
          }
        }
      ],

      layout: {
        name: 'concentric',
        fit: true,
        padding: 50,
        minNodeSpacing: 60,
        concentric: (n: any) => n.degree(),
        levelWidth: () => 2
      }
    });
    
    // --- CORREÇÃO DO BUG DE TAMANHO ---
    // Força o Cytoscape a recalcular o tamanho do container novo
    setTimeout(() => {
      this.cy.resize(); // Lê o tamanho de 450px
      this.cy.fit();    // Centraliza os nós nesse espaço
    }, 200);
  }
  // --- AÇÕES DOS BOTÕES ---

  // --- CADASTRO DE USUÁRIO ---
  adicionarUsuario(nome: string) {
    if (!nome) return;

    this.api.adicionarUsuario(nome).subscribe({
      next: (res) => {
        alert(`Usuário '${res.nome}' criado!`);
        setTimeout(() => this.atualizarDados(), 200);
      },
      error: (err) => {
        // Tratamento para nome duplicado
        if (err.error && err.error.code === 'ER_DUP_ENTRY') {
            alert('Erro: Já existe um usuário com este nome!');
        } else {
            alert('Erro ao criar usuário.');
        }
      }
    });
  }

  // --- NOVA CONEXÃO (POR NOME) ---
  adicionarConexao(nomeA: string, nomeB: string) {
    if (!nomeA || !nomeB) {
      alert('Preencha os dois nomes!');
      return;
    }

    this.api.adicionarConexao(nomeA, nomeB).subscribe({
      next: (res) => {
        alert(res.message); // Mensagem vinda da API
        setTimeout(() => this.atualizarDados(), 200);
      },
      error: (err) => {
        console.error(err);
        // Mostra a mensagem de erro exata da API (ex: "Usuário não encontrado")
        alert('Erro: ' + (err.error.error || 'Falha ao conectar'));
      }
    });
  }
}