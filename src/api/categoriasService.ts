import { http } from "./http";
import type { Categoria, CategoriaCreateDto, FinalidadeCategoria } from "../types/categoria";

type CategoriaApi = {
  id?: number;
  Id?: number;
  descricao?: string;
  Descricao?: string;
  finalidade?: number;
  Finalidade?: number;
};

function toFinalidade(value: unknown): FinalidadeCategoria {
  const n = Number(value);
  if (n === 0 || n === 1 || n === 2) return n as FinalidadeCategoria;
  return 0;
}

function mapCategoria(raw: CategoriaApi): Categoria {
  return {
    id: Number(raw.id ?? raw.Id ?? 0),
    descricao: String(raw.descricao ?? raw.Descricao ?? ""),
    finalidade: toFinalidade(raw.finalidade ?? raw.Finalidade),
  };
}

function mapLista(raw: unknown): Categoria[] {
  const list = Array.isArray(raw)
    ? raw
    : (raw as any)?.items ?? (raw as any)?.itens ?? (raw as any)?.data ?? [];

  if (!Array.isArray(list)) return [];
  return list.map((x) => mapCategoria(x as CategoriaApi));
}

export const categoriasService = {
  async listar(): Promise<Categoria[]> {
    const { data } = await http.get("/categorias");
    return mapLista(data);
  },

  async criar(dto: CategoriaCreateDto): Promise<Categoria> {
    const payload = {
      descricao: dto.descricao.trim(),
      finalidade: Number(dto.finalidade),
    };

    const { data } = await http.post("/categorias", payload, {
      headers: { "Content-Type": "application/json" },
    });

    return mapCategoria(data as CategoriaApi);
  },

  async atualizar(id: number, dto: CategoriaCreateDto): Promise<Categoria> {
    const payload = {
      descricao: dto.descricao.trim(),
      finalidade: Number(dto.finalidade),
    };

    const { data } = await http.put(`/categorias/${id}`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    return mapCategoria(data as CategoriaApi);
  },

  async excluir(id: number): Promise<void> {
    await http.delete(`/categorias/${id}`);
  },
};