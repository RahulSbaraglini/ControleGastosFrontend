export interface RelatorioPessoaItem {
  pessoaId: number;
  pessoaNome: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

export interface RelatorioPessoasResponse {
  itens: RelatorioPessoaItem[];
  totalReceitas: number;
  totalDespesas: number;
  saldoLiquido: number;
}

export interface RelatorioCategoriaItem {
  categoriaId: number;
  categoriaDescricao: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

export interface RelatorioCategoriasResponse {
  itens: RelatorioCategoriaItem[];
  totalReceitas: number;
  totalDespesas: number;
  saldoLiquido: number;
}