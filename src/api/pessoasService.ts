import { http } from "./http";

export type Pessoa = {
  id: number;
  nome: string;
  idade: number;
};

export type PessoaCreateDto = {
  nome: string;
  idade: number;
};

export type PessoaOption = {
  id: number;
  nome: string;
};

function n(v: unknown): number {
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
}

function mapPessoa(raw: any): Pessoa {
  return {
    id: n(raw?.id ?? raw?.Id),
    nome: String(raw?.nome ?? raw?.Nome ?? ""),
    idade: n(raw?.idade ?? raw?.Idade),
  };
}

function mapLista(raw: any): Pessoa[] {
  const arr = Array.isArray(raw)
    ? raw
    : raw?.items ?? raw?.itens ?? raw?.data ?? [];
  return Array.isArray(arr) ? arr.map(mapPessoa) : [];
}

export const pessoasService = {
  async listar(): Promise<Pessoa[]> {
    const { data } = await http.get("/pessoas");
    return mapLista(data);
  },

  async obterPorId(id: number): Promise<Pessoa> {
    const { data } = await http.get(`/pessoas/${id}`);
    return mapPessoa(data);
  },

  async criar(dto: PessoaCreateDto): Promise<Pessoa> {
    const payloadCamel = {
      nome: dto.nome.trim(),
      idade: Number(dto.idade),
    };

    try {
      const { data } = await http.post("/pessoas", payloadCamel);
      return mapPessoa(data);
    } catch (e: any) {
      if (e?.response?.status === 400) {
        const payloadPascal = {
          Nome: dto.nome.trim(),
          Idade: Number(dto.idade),
        };
        const { data } = await http.post("/pessoas", payloadPascal);
        return mapPessoa(data);
      }
      throw e;
    }
  },

  async atualizar(id: number, dto: PessoaCreateDto): Promise<void> {
    const payloadCamel = {
      nome: dto.nome.trim(),
      idade: Number(dto.idade),
    };

    try {
      await http.put(`/pessoas/${id}`, payloadCamel);
    } catch (e: any) {
      if (e?.response?.status === 400) {
        const payloadPascal = {
          Nome: dto.nome.trim(),
          Idade: Number(dto.idade),
        };
        await http.put(`/pessoas/${id}`, payloadPascal);
        return;
      }
      throw e;
    }
  },

  async excluir(id: number): Promise<void> {
    await http.delete(`/pessoas/${id}`);
  },

  create(dto: PessoaCreateDto) {
    return this.criar(dto);
  },
  add(dto: PessoaCreateDto) {
    return this.criar(dto);
  },
  remover(id: number) {
    return this.excluir(id);
  },
  deletar(id: number) {
    return this.excluir(id);
  },
};