import { http } from "./http";

export type Transacao = {
  id: number;
  descricao: string;
  valor: number;
  tipo: number;
  categoriaId: number;
  pessoaId: number;
};

export type TransacaoCreateDto = {
  descricao: string;
  valor: number;
  tipo: number;
  categoriaId: number;
  pessoaId: number;
};

type TransacaoApi = {
  id?: number; Id?: number;
  descricao?: string; Descricao?: string;
  valor?: number; Valor?: number;
  tipo?: number; Tipo?: number;
  categoriaId?: number; CategoriaId?: number;
  pessoaId?: number; PessoaId?: number;
};

function mapTransacao(raw: TransacaoApi): Transacao {
  return {
    id: Number(raw.id ?? raw.Id ?? 0),
    descricao: String(raw.descricao ?? raw.Descricao ?? ""),
    valor: Number(raw.valor ?? raw.Valor ?? 0),
    tipo: Number(raw.tipo ?? raw.Tipo ?? 0),
    categoriaId: Number(raw.categoriaId ?? raw.CategoriaId ?? 0),
    pessoaId: Number(raw.pessoaId ?? raw.PessoaId ?? 0),
  };
}

function mapLista(raw: unknown): Transacao[] {
  const list = Array.isArray(raw)
    ? raw
    : (raw as any)?.items ?? (raw as any)?.itens ?? (raw as any)?.data ?? [];

  if (!Array.isArray(list)) return [];
  return list.map((x) => mapTransacao(x as TransacaoApi));
}

export const transacoesService = {
  async listar(): Promise<Transacao[]> {
    const { data } = await http.get("/transacoes");
    return mapLista(data);
  },

  async criar(dto: TransacaoCreateDto): Promise<Transacao> {
    const payloadCamel = {
      descricao: dto.descricao.trim(),
      valor: Number(dto.valor),
      tipo: Number(dto.tipo),
      categoriaId: Number(dto.categoriaId),
      pessoaId: Number(dto.pessoaId),
    };

    const payloadPascal = {
      Descricao: dto.descricao.trim(),
      Valor: Number(dto.valor),
      Tipo: Number(dto.tipo),
      CategoriaId: Number(dto.categoriaId),
      PessoaId: Number(dto.pessoaId),
    };

    try {
      console.log("POST /transacoes payload (camel):", payloadCamel);
      const { data } = await http.post("/transacoes", payloadCamel, {
        headers: { "Content-Type": "application/json" },
      });
      return mapTransacao(data as TransacaoApi);
    } catch (e: any) {
      if (e?.response?.status === 400) {
        console.log("Fallback POST /transacoes payload (pascal):", payloadPascal);
        const { data } = await http.post("/transacoes", payloadPascal, {
          headers: { "Content-Type": "application/json" },
        });
        return mapTransacao(data as TransacaoApi);
      }
      throw e;
    }
  },
};