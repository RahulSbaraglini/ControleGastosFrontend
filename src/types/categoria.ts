export enum FinalidadeCategoria {
  Despesa = 0,
  Receita = 1,
  Ambas = 2,
}

export interface Categoria {
  id: number;
  descricao: string;
  finalidade: FinalidadeCategoria;
}

export interface CategoriaCreateDto {
  descricao: string;
  finalidade: FinalidadeCategoria;
}

export const finalidadeLabel: Record<FinalidadeCategoria, string> = {
  [FinalidadeCategoria.Despesa]: "Despesa",
  [FinalidadeCategoria.Receita]: "Receita",
  [FinalidadeCategoria.Ambas]: "Ambas",
};

export const FINALIDADES_OPTIONS = [
  { value: FinalidadeCategoria.Despesa, label: "Despesa" },
  { value: FinalidadeCategoria.Receita, label: "Receita" },
  { value: FinalidadeCategoria.Ambas, label: "Ambas" },
];