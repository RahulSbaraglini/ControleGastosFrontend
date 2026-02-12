import { http } from "./http";

function n(v: unknown): number {
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
}

export type RelatorioPessoaItem = {
  pessoaId: number;
  nome: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
};

export type RelatorioPessoasResponse = {
  pessoas: RelatorioPessoaItem[];
  totaisGerais: {
    totalReceitas: number;
    totalDespesas: number;
    saldoLiquido: number;
  };
};

export type RelatorioCategoriaItem = {
  categoriaId: number;
  descricao: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
};

export type RelatorioCategoriasResponse = {
  categorias: RelatorioCategoriaItem[];
  totaisGerais: {
    totalReceitas: number;
    totalDespesas: number;
    saldoLiquido: number;
  };
};

function mapTotais(raw: any) {
  return {
    totalReceitas: n(raw?.totalReceitas ?? raw?.TotalReceitas),
    totalDespesas: n(raw?.totalDespesas ?? raw?.TotalDespesas),
    saldoLiquido: n(raw?.saldoLiquido ?? raw?.SaldoLiquido),
  };
}

export const relatoriosService = {
  async totaisPorPessoa(): Promise<RelatorioPessoasResponse> {
    const { data } = await http.get("/relatorios/totais-por-pessoa");
    return {
      pessoas: Array.isArray(data?.pessoas)
        ? data.pessoas.map((x: any) => ({
            pessoaId: n(x?.pessoaId ?? x?.PessoaId),
            nome: String(x?.nome ?? x?.Nome ?? ""),
            totalReceitas: n(x?.totalReceitas ?? x?.TotalReceitas),
            totalDespesas: n(x?.totalDespesas ?? x?.TotalDespesas),
            saldo: n(x?.saldo ?? x?.Saldo),
          }))
        : [],
      totaisGerais: mapTotais(data?.totaisGerais),
    };
  },

  async totaisPorCategoria(): Promise<RelatorioCategoriasResponse> {
    const { data } = await http.get("/relatorios/totais-por-categoria");
    return {
      categorias: Array.isArray(data?.categorias)
        ? data.categorias.map((x: any) => ({
            categoriaId: n(x?.categoriaId ?? x?.CategoriaId),
            descricao: String(x?.descricao ?? x?.Descricao ?? ""),
            totalReceitas: n(x?.totalReceitas ?? x?.TotalReceitas),
            totalDespesas: n(x?.totalDespesas ?? x?.TotalDespesas),
            saldo: n(x?.saldo ?? x?.Saldo),
          }))
        : [],
      totaisGerais: mapTotais(data?.totaisGerais),
    };
  },

  porPessoa() {
    return this.totaisPorPessoa();
  },
  porCategoria() {
    return this.totaisPorCategoria();
  },
};