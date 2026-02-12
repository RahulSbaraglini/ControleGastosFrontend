import { useEffect, useState } from "react";
import { categoriasService } from "../api/categoriasService";
import {
  type Categoria,
  FinalidadeCategoria,
  FINALIDADES_OPTIONS,
  finalidadeLabel,
} from "../types/categoria";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { getApiErrorMessage } from "../utils/apiError";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);

  const [descricao, setDescricao] = useState("");
  const [finalidade, setFinalidade] = useState<FinalidadeCategoria>(FinalidadeCategoria.Despesa);

  // modo edição
  const [editandoId, setEditandoId] = useState<number | null>(null);

  async function carregarCategorias() {
    try {
      setLoading(true);
      setErro("");
      const lista = await categoriasService.listar();
      setCategorias(lista);
    } catch (e) {
      setErro(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarCategorias();
  }, []);

  function validarFormulario(): string | null {
    if (!descricao.trim()) return "Descrição é obrigatória.";
    if (descricao.trim().length > 400) return "Descrição deve ter no máximo 400 caracteres.";
    if (![0, 1, 2].includes(Number(finalidade))) return "Finalidade inválida.";
    return null;
  }

  function limparFormulario() {
    setDescricao("");
    setFinalidade(FinalidadeCategoria.Despesa);
    setEditandoId(null);
  }

  function iniciarEdicao(categoria: Categoria) {
    setErro("");
    setEditandoId(categoria.id);
    setDescricao(categoria.descricao);
    setFinalidade(categoria.finalidade);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

      if (editandoId === null) {
        await categoriasService.criar({
          descricao: descricao.trim(),
          finalidade,
        });
      } else {
        await categoriasService.atualizar(editandoId, {
          descricao: descricao.trim(),
          finalidade,
        });
      }

      limparFormulario();
      await carregarCategorias();
    } catch (e) {
      setErro(getApiErrorMessage(e));
    } finally {
      setSalvando(false);
    }
  }

  async function onExcluir(categoria: Categoria) {
    const ok = window.confirm(
      `Deseja excluir a categoria "${categoria.descricao}"?`
    );
    if (!ok) return;

    try {
      setErro("");
      setExcluindoId(categoria.id);
      await categoriasService.excluir(categoria.id);

      // Se estava editando ela, limpa formulário
      if (editandoId === categoria.id) {
        limparFormulario();
      }

      await carregarCategorias();
    } catch (e) {
      setErro(getApiErrorMessage(e));
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <section>
      <h3>Categorias</h3>

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
          style={{ minWidth: 280 }}
        />

        <select
          value={Number(finalidade)}
          onChange={(e) =>
            setFinalidade(Number(e.target.value) as FinalidadeCategoria)
          }
        >
          {FINALIDADES_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <button type="submit" disabled={salvando}>
          {salvando
            ? (editandoId === null ? "Adicionando..." : "Salvando...")
            : (editandoId === null ? "Adicionar" : "Salvar alteração")}
        </button>

        {editandoId !== null && (
          <button
            type="button"
            onClick={limparFormulario}
            disabled={salvando}
          >
            Cancelar edição
          </button>
        )}
      </form>

      {loading ? (
        <Loading text="Carregando categorias..." />
      ) : categorias.length === 0 ? (
        <EmptyState text="Nenhuma categoria cadastrada." />
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">ID</th>
              <th align="left">Descrição</th>
              <th align="left">Finalidade</th>
              <th align="left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.descricao}</td>
                <td>{finalidadeLabel[c.finalidade] ?? c.finalidade}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => iniciarEdicao(c)}>
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => onExcluir(c)}
                    disabled={excluindoId === c.id}
                  >
                    {excluindoId === c.id ? "Excluindo..." : "Excluir"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}