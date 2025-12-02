import { Component, OnInit, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core'; // <--- 1. Importe NgZone
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
  cy: any;
  usuarioSelecionado: any = null;
  menuAberto: string = '';
  totalGrupos: number = 0;
  constructor(
    private api: ApiService, 
    private cdr: ChangeDetectorRef,
    private zone: NgZone // <--- 2. Injete o NgZone aqui
  ) {}

  ngOnInit() {
    console.log('Dashboard iniciado.');
  }

  ngAfterViewInit() {
    this.atualizarDados();
  }

  atualizarDados() {
    this.api.getUsuarios().subscribe(lista => {
      this.totalUsuarios = lista.length;
      this.cdr.detectChanges();
    });

    this.api.getGrafo().subscribe(dados => {
      this.totalConexoes = (dados && dados.edges) ? dados.edges.length : 0;
      
      this.renderizarGrafo(dados);
      
      // --- CÁLCULO DE GRUPOS (NOVO) ---
      // Só podemos calcular depois que o grafo foi desenhado no Cytoscape
      if (this.cy) {
        const componentes = this.cy.elements().components();
        this.totalGrupos = componentes.length;
        this.cdr.detectChanges();
      }
    });
  }

  // --- FUNÇÃO PARA COLORIR ILHAS (NOVO) ---
  colorirGrupos() {
    if (!this.cy) return;

    // 1. Pega as ilhas isoladas (Componentes Conexas)
    const componentes = this.cy.elements().components();

    if (componentes.length === 1) {
      alert('A rede está totalmente conectada! (Apenas 1 grupo)');
      return;
    }

    // 2. Paleta de Cores Neon para diferenciar
    const cores = ['#FF0055', '#00FF99', '#00CCFF', '#FFFF00', '#FF9900', '#CC00FF'];

    this.zone.run(() => {
      // Para cada grupo, aplica uma cor diferente
      componentes.forEach((grupo: any, index: number) => {
        const cor = cores[index % cores.length]; // Usa a cor ou repete se acabar
        
        // Aplica a cor nos nós
        grupo.nodes().style({
          'background-color': cor,
          'border-color': '#fff',
          'border-width': 2,
          'color': cor === '#FFFF00' || cor === '#00FF99' ? '#000' : '#fff' // Texto preto se a cor for clara
        });

        // Aplica a cor nas linhas
        grupo.edges().style({
          'line-color': cor,
          'width': 3
        });
      });
    });
  }

  // Função para voltar ao Preto e Branco original
  resetarCores() {
    if (!this.cy) return;
    
    this.zone.run(() => {
      // Remove todos os estilos manuais aplicados (volta para o stylesheet padrão)
      this.cy.elements().removeStyle(); 
    });
  }
// --- FUNÇÃO DE BUSCA (CORRIGIDA) ---
  buscarUsuario(nome: string) {
    if (!this.cy || !nome) return;

    // 1. Acha o nó pelo nome
    const alvo = this.cy.nodes(`[label = "${nome}"]`);

    if (alvo.length === 0) {
      alert('Usuário não encontrado!');
      return;
    }

    // 2. Seleciona ele (pinta de roxo e mostra detalhes)
    alvo.emit('tap');

    // 3. ANIMAÇÃO DE ZOOM CORRIGIDA
    // Em vez de 'fit', usamos 'zoom' e 'center' diretos.
    this.cy.animate({
      zoom: 1.5,  // Define o zoom para 150% (Aumenta)
      center: {   // Centraliza exatamente nas coordenadas do nó
        eles: alvo 
      }
    }, {
      duration: 1000,             // Leva 1 segundo
      easing: 'ease-in-out-cubic' // Movimento suave
    });
  }

  // --- FUNÇÃO PARA RESETAR A VISÃO ---
  resetarZoom() {
    if (!this.cy) return;

    // Limpa a seleção
    this.limparSelecao();

    // Volta a câmera para mostrar todo mundo
    this.cy.animate({
      fit: {
        eles: this.cy.elements(),
        padding: 50
      },
      duration: 800
    });
  }
  limparSelecao() {
    this.usuarioSelecionado = null;
    if (this.cy) {
      this.cy.elements().removeClass('faded highlighted');
    }
    this.cdr.detectChanges();
  }
toggleMenu(nome: string) {
    // Se clicou no que já está aberto, fecha ele (vira vazio)
    if (this.menuAberto === nome) {
      this.menuAberto = '';
    } else {
      // Se não, abre o novo (e automaticamente fecha o anterior)
      this.menuAberto = nome;
    }
  }
  // --- FUNÇÃO DE CAMINHO MAIS CURTO (DIJKSTRA) ---
  buscarCaminho(nomeOrigem: string, nomeDestino: string) {
    if (!this.cy || !nomeOrigem || !nomeDestino) {
        alert('Preencha os dois campos!');
        return;
    }

    // 1. Busca os nós pelo nome (Label)
    const noOrigem = this.cy.nodes(`[label = "${nomeOrigem}"]`);
    const noDestino = this.cy.nodes(`[label = "${nomeDestino}"]`);

    if (noOrigem.length === 0 || noDestino.length === 0) {
      alert('Usuário(s) não encontrado(s). Verifique se digitou o nome exato.');
      return;
    }

    // 2. Executa o algoritmo de Dijkstra (Nativo do Cytoscape)
    const dijkstra = this.cy.elements().dijkstra({
      root: noOrigem,
      weight: () => 1, // Peso 1 para todas as conexões
      directed: false
    });

    // 3. Pega o caminho
    const caminho = dijkstra.pathTo(noDestino);

    if (caminho.length === 0) {
      alert('Não existe conexão entre essas duas pessoas.');
      return;
    }

    // 4. Visualização
    this.zone.run(() => {
        // Limpa destaques anteriores
        this.cy.elements().removeClass('faded highlighted path-highlight');

        // Esmaece todo mundo que NÃO faz parte do caminho
        this.cy.elements().not(caminho).addClass('faded');
        
        // Adiciona classe de destaque no caminho encontrado
        caminho.addClass('path-highlight');

        // Animação de zoom no caminho
        this.cy.animate({
            fit: { eles: caminho, padding: 50 }
        }, { duration: 500 });
    });
  }

  
renderizarGrafo(dadosAPI: any) {
    const container = document.getElementById('cy');
    if (!container || !dadosAPI || !dadosAPI.nodes) return;

    if (this.cy) this.cy.destroy();

    const elementosNodes = dadosAPI.nodes.map((u: any) => ({
      data: { id: u.id.toString(), label: u.label }
    }));

    const elementosEdges = dadosAPI.edges.map((c: any) => ({
      data: { source: c.source.toString(), target: c.target.toString() }
    }));

    this.cy = cytoscape({
      container: container,
      elements: [...elementosNodes, ...elementosEdges],
      userZoomingEnabled: false,
      userPanningEnabled: true,
      boxSelectionEnabled: false,

      style: [
        // --- NÓ PADRÃO ---
        {
          selector: 'node',
          style: {
            'shape': 'hexagon',
            'background-color': '#ffffff', // Fundo Branco (Alto contraste)
            'border-width': 2,
            'border-color': '#000000',     // Borda Preta
            
            // --- TEXTO CORRIGIDO ---
            'label': 'data(label)',
            'color': '#ffffff',            // Texto BRANCO agora!
            'font-size': '14px',
            'font-weight': 'bold',
            'font-family': 'Segoe UI, sans-serif',
            
            // Contorno preto no texto para leitura perfeita no fundo escuro
            'text-outline-width': 2,
            'text-outline-color': '#151b26', // Mesma cor do fundo do container
            
            'text-valign': 'bottom',
            'text-margin-y': 8,
            
            'width': 50,
            'height': 50,
            'transition-duration': 300 
          }
        },
        
        // --- LINHAS PADRÃO ---
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#475569', // Cinza azulado discreto
            'curve-style': 'bezier',
            'opacity': 0.5
          }
        },

        // --- DESTAQUE DO NÓ (QUANDO CLICA) ---
        {
          selector: 'node.highlighted',
          style: {
            'background-color': '#7F00FF', // Roxo Neon
            'border-width': 0,             // Sem borda preta
            'width': 65,                   // Cresce um pouco
            'height': 65,
            'text-outline-color': '#7F00FF', // Contorno roxo no texto
            'transition-duration': 300
          }
        },

        // --- DESTAQUE DA LINHA (CORREÇÃO DA BARRA GIGANTE) ---
        {
          selector: 'edge.highlighted',
          style: {
            'line-color': '#7F00FF',       // Linha Roxa
            'width': 4,                    // <--- AQUI ESTAVA O ERRO (Antes era 60)
            'opacity': 1,
            'z-index': 999
          }
        },

        // --- ESMAECIDO (QUEM NÃO É AMIGO) ---
        {
          selector: '.faded',
          style: {
            'opacity': 0.1,
            'text-opacity': 0
          }
        },
        // ... (outros estilos anteriores)

        // --- CAMINHO MAIS CURTO (ROTA) ---
        {
          selector: '.path-highlight',
          style: {
            'line-color': '#f59e0b',       // Laranja Ouro
            'target-arrow-color': '#f59e0b',
            'width': 6,                    // Linha mais grossa
            'z-index': 9999,               // Fica por cima de tudo
            'transition-duration': 500
          }
        },
        // Destaque para os NÓS do caminho
        {
          selector: 'node.path-highlight',
          style: {
             'background-color': '#f59e0b', // Laranja Ouro
             'border-color': '#000',
             'border-width': 3,
             'width': 60,
             'height': 60
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

    // --- LÓGICA DE CLIQUE E SUGESTÃO ---
    this.cy.on('tap', 'node', (evt: any) => {
      const node = evt.target;
      
      this.zone.run(() => {
        // 1. Visual (Destaque)
        this.cy.elements().removeClass('faded highlighted');
        const vizinhos = node.neighborhood().add(node); // Amigos + Ele mesmo
        this.cy.elements().not(vizinhos).addClass('faded');
        vizinhos.addClass('highlighted');

        // 2. ALGORITMO DE SUGESTÃO (Novo!)
        // Pega os amigos dos amigos (vizinhos de vizinhos)
        const amigosDosAmigos = node.neighborhood().neighborhood();
        
        // Filtra: Remove quem já é amigo e remove o próprio usuário
        const sugestoesBrutas = amigosDosAmigos.not(node.neighborhood()).not(node);

        // Formata a lista para exibir na tela
        const listaSugestoes = sugestoesBrutas.map((sugestao: any) => {
          // Conta quantos amigos em comum (Interseção dos vizinhos)
          const emComum = node.neighborhood().intersection(sugestao.neighborhood()).length;
          
          return {
            id: sugestao.id(),
            nome: sugestao.data('label'),
            comum: emComum
          };
        });

        // Ordena por quem tem mais amigos em comum
        listaSugestoes.sort((a: any, b: any) => b.comum - a.comum);

        // 3. Atualiza os dados para o HTML
        this.usuarioSelecionado = {
          id: node.id(),
          nome: node.data('label'),
          grau: node.degree(),
          sugestoes: listaSugestoes // Guardamos a lista aqui
        };
        
        this.cdr.detectChanges();
      });
    });

    this.cy.on('tap', (evt: any) => {
      if (evt.target === this.cy) {
        this.zone.run(() => this.limparSelecao());
      }
    });

    setTimeout(() => {
      this.cy.resize();
      this.cy.fit();
    }, 200);
  }

  
// --- FUNÇÕES DE EXPORTAÇÃO ---

  baixarImagem() {
    if (!this.cy) return;

    // 1. Gera a imagem em base64 (PNG full scale)
    const pngContent = this.cy.png({
      output: 'base64uri',
      full: true,   // Pega o grafo todo, não só o que está na tela
      scale: 1.5,   // Aumenta qualidade
      bg: '#ffffff' // Força fundo branco (caso seja transparente)
    });

    // 2. Cria um link falso para download
    const link = document.createElement('a');
    link.href = pngContent;
    link.download = 'rede-social-grafo.png';
    link.click();
  }

  baixarJSON() {
    if (!this.cy) return;

    // 1. Pega os dados brutos do grafo
    const jsonContent = this.cy.json();
    
    // 2. Transforma em string bonitinha
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonContent));
    
    // 3. Download
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = 'rede-social-dados.json';
    link.click();
  }
  // --- MÉTODOS DE CADASTRO/EXCLUSÃO (Mantenha os seus iguais) ---
  adicionarUsuario(nome: string) {
    if(!nome) return;
    this.api.adicionarUsuario(nome).subscribe({
      next: () => { alert('Criado!'); setTimeout(() => this.atualizarDados(), 200); },
      error: () => alert('Erro.')
    });
  }

  adicionarConexao(nomeA: string, nomeB: string) {
    if(!nomeA || !nomeB) return;
    this.api.adicionarConexao(nomeA, nomeB).subscribe({
      next: (res) => { alert(res.message); setTimeout(() => this.atualizarDados(), 200); },
      error: (err) => alert('Erro: ' + (err.error.error || 'Falha'))
    });
  }
  
  excluirUsuario(nome: string) {
      if(!nome || !confirm('Excluir?')) return;
      this.api.removerUsuario(nome).subscribe({
          next: () => { alert('Excluído'); setTimeout(() => this.atualizarDados(), 200); },
          error: (err) => alert('Erro.')
      });
  }

  excluirConexao(nomeA: string, nomeB: string) {
      if(!nomeA || !nomeB || !confirm('Desconectar?')) return;
      this.api.removerConexao(nomeA, nomeB).subscribe({
          next: () => { alert('Desconectado'); setTimeout(() => this.atualizarDados(), 200); },
          error: (err) => alert('Erro.')
      });
  }
}