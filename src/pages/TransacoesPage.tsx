import { useEffect, useMemo, useState } from "react";
import { pessoasService, type PessoaOption } from "../api/pessoasService";
import { categoriasService } from "../api/categoriasService";
import { transacoesService } from "../api/transacoesService";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { getApiErrorMessage } from "../utils/apiError";

enum TipoTransacao {
  Despesa = 0,
  Receita = 1,
}

type CategoriaOption = {
  id: number;
  descricao: string;
  finalidade: number; // 0=Despesa,1=Receita,2=Ambas
};

type Transacao = {
  id: number;
  descricao: string;
  valor: number;
  tipo: number; // 0/1
  categoriaId: number;
  pessoaId: number;
};

export default function TransacoesPage() {
  const [erro, setErro] = useState("");

  const [loadingLookups, setLoadingLookups] = useState(false);
  const [loadingLista, setLoadingLista] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [pessoas, setPessoas] = useState<PessoaOption[]>([]);
  const [categorias, setCategorias] = useState<CategoriaOption[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<TipoTransacao>(TipoTransacao.Despesa);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [pessoaId, setPessoaId] = useState<number | null>(null);

  async function carregarLookups() {
    try {
      setLoadingLookups(true);
      setErro("");

      const [pessoasData, categoriasData] = await Promise.all([
        pessoasService.listar(),
        categoriasService.listar(),
      ]);

      setPessoas(pessoasData);
      setCategorias(
        categoriasData.map((c: any) => ({
          id: Number(c.id),
          descricao: String(c.descricao),
          finalidade: Number(c.finalidade),
        }))
      );
    } catch (e) {
      setErro(getApiErrorMessage(e));
      console.error("Erro ao carregar lookups:", e);
    } finally {
      setLoadingLookups(false);
    }
  }

  async function carregarTransacoes() {
    try {
      setLoadingLista(true);
      setErro("");
      const lista = await transacoesService.listar();
      setTransacoes(lista);
    } catch (e) {
      setErro(getApiErrorMessage(e));
      console.error("Erro ao carregar transações:", e);
    } finally {
      setLoadingLista(false);
    }
  }

  useEffect(() => {
    carregarLookups();
    carregarTransacoes();
  }, []);

  // Pessoa selecionada (precisamos da idade para validação de menor)
  const pessoaSelecionada = useMemo(
    () => pessoas.find((p: any) => Number(p.id) === Number(pessoaId)),
    [pessoas, pessoaId]
  );

  const menorDeIdade = useMemo(() => {
    if (!pessoaSelecionada) return false;
    const idade = Number((pessoaSelecionada as any).idade);
    return Number.isFinite(idade) && idade < 18;
  }, [pessoaSelecionada]);

  // Se escolher menor de idade e tipo estiver Receita, força para Despesa e avisa
  useEffect(() => {
    if (menorDeIdade && tipo === TipoTransacao.Receita) {
      setTipo(TipoTransacao.Despesa);
      setErro("Para menor de idade, apenas despesas são permitidas.");
    }
  }, [menorDeIdade, tipo]);

  // Regra de categoria por tipo:
  // tipo Despesa -> categorias finalidade Despesa(0) ou Ambas(2)
  // tipo Receita -> categorias finalidade Receita(1) ou Ambas(2)
  const categoriasFiltradas = useMemo(() => {
    return categorias.filter((c) => {
      if (tipo === TipoTransacao.Despesa) return c.finalidade === 0 || c.finalidade === 2;
      return c.finalidade === 1 || c.finalidade === 2;
    });
  }, [categorias, tipo]);

  useEffect(() => {
    if (!categoriaId) return;
    const existe = categoriasFiltradas.some((c) => c.id === categoriaId);
    if (!existe) setCategoriaId(null);
  }, [tipo, categoriasFiltradas, categoriaId]);

  function validarFormulario(): string | null {
    if (!descricao.trim()) return "Descrição é obrigatória.";
    if (descricao.trim().length > 400) return "Descrição deve ter no máximo 400 caracteres.";

    const valorNum = Number(valor.replace(",", "."));
    if (!Number.isFinite(valorNum) || valorNum <= 0) return "Valor deve ser um número positivo.";

    if (categoriaId == null) return "Selecione uma categoria.";
    if (pessoaId == null) return "Selecione uma pessoa.";

    if (menorDeIdade && tipo === TipoTransacao.Receita) {
      return "Para menor de idade, apenas despesas são permitidas.";
    }

    const categoria = categorias.find((c) => c.id === categoriaId);
    if (!categoria) return "Categoria inválida.";

    if (tipo === TipoTransacao.Despesa && !(categoria.finalidade === 0 || categoria.finalidade === 2)) {
      return "Categoria incompatível com o tipo Despesa.";
    }
    if (tipo === TipoTransacao.Receita && !(categoria.finalidade === 1 || categoria.finalidade === 2)) {
      return "Categoria incompatível com o tipo Receita.";
    }

    return null;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const erroValidacao = validarFormulario();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    try {
      setErro("");
      setSalvando(true);

      await transacoesService.criar({
        descricao: descricao.trim(),
        valor: Number(valor.replace(",", ".")),
        tipo: Number(tipo),
        categoriaId: Number(categoriaId),
        pessoaId: Number(pessoaId),
      });

      setDescricao("");
      setValor("");
      setTipo(TipoTransacao.Despesa);
      setCategoriaId(null);
      setPessoaId(null);

      await carregarTransacoes();
    } catch (e) {
      setErro(getApiErrorMessage(e));
      console.error("Erro ao criar transação:", e);
    } finally {
      setSalvando(false);
    }
  }

  const mapaPessoa = useMemo(() => {
    const m = new Map<number, string>();
    pessoas.forEach((p: any) => m.set(Number(p.id), p.nome));
    return m;
  }, [pessoas]);

  const mapaCategoria = useMemo(() => {
    const m = new Map<number, string>();
    categorias.forEach((c) => m.set(Number(c.id), c.descricao));
    return m;
  }, [categorias]);

  const loading = loadingLookups || loadingLista;

  return (
    <section>
      <h3>Transações</h3>

      <ErrorMessage message={erro} />

      <form
        onSubmit={onSubmit}
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}
      >
        <input
          type="text"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          style={{ minWidth: 240 }}
          maxLength={400}
        />

        <input
          type="text"
          placeholder="Valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          style={{ width: 120 }}
        />

        <select
          value={Number(tipo)}
          onChange={(e) => {
            const novoTipo = Number(e.target.value) as TipoTransacao;
            if (menorDeIdade && novoTipo === TipoTransacao.Receita) {
              setErro("Para menor de idade, apenas despesas são permitidas.");
              return;
            }
            setTipo(novoTipo);
          }}
        >
          <option value={TipoTransacao.Despesa}>Despesa</option>
          <option value={TipoTransacao.Receita} disabled={menorDeIdade}>
            Receita{menorDeIdade ? " (bloqueada para menor)" : ""}
          </option>
        </select>

        <select
          value={categoriaId ?? ""}
          onChange={(e) => setCategoriaId(e.target.value === "" ? null : Number(e.target.value))}
        >
          <option value="">Selecione categoria</option>
          {categoriasFiltradas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.descricao}
            </option>
          ))}
        </select>

        <select
          value={pessoaId ?? ""}
          onChange={(e) => setPessoaId(e.target.value === "" ? null : Number(e.target.value))}
        >
          <option value="">Selecione pessoa</option>
          {pessoas.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>

        <button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Adicionar"}
        </button>
      </form>

      {loading ? (
        <Loading text="Carregando transações..." />
      ) : transacoes.length === 0 ? (
        <EmptyState text="Nenhuma transação cadastrada." />
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">ID</th>
              <th align="left">Descrição</th>
              <th align="left">Valor</th>
              <th align="left">Tipo</th>
              <th align="left">Categoria</th>
              <th align="left">Pessoa</th>
            </tr>
          </thead>
          <tbody>
            {transacoes.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.descricao}</td>
                <td>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Number(t.valor))}
                </td>
                <td>{Number(t.tipo) === 0 ? "Despesa" : "Receita"}</td>
                <td>{mapaCategoria.get(Number(t.categoriaId)) ?? `#${t.categoriaId}`}</td>
                <td>{mapaPessoa.get(Number(t.pessoaId)) ?? `#${t.pessoaId}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}