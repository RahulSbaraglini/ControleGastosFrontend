import { useEffect, useState } from "react";
import { pessoasService } from "../api/pessoasService";
import type { Pessoa } from "../types/pessoa";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { getApiErrorMessage } from "../utils/apiError";

export default function PessoasPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState<number | "">("");

  async function carregarPessoas() {
    try {
      setLoading(true);
      setErro("");
      const lista = await pessoasService.listar();
      setPessoas(lista);
    } catch (e) {
      setErro(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarPessoas();
  }, []);

  function limparFormulario() {
    setEditandoId(null);
    setNome("");
    setIdade("");
  }

  function validarFormulario(): string | null {
    if (!nome.trim()) return "Nome é obrigatório.";
    if (nome.trim().length > 200) return "Nome deve ter no máximo 200 caracteres.";
    if (idade === "") return "Idade é obrigatória.";
    if (Number(idade) < 0) return "Idade não pode ser negativa.";
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

      const payload = {
        nome: nome.trim(),
        idade: Number(idade),
      };

      if (editandoId === null) {
        await pessoasService.criar(payload);
      } else {
        await pessoasService.atualizar(editandoId, payload);
      }

      limparFormulario();
      await carregarPessoas();
    } catch (e) {
      setErro(getApiErrorMessage(e));
    }
  }

  function iniciarEdicao(p: Pessoa) {
    setEditandoId(p.id);
    setNome(p.nome);
    setIdade(p.idade);
  }

  async function excluirPessoa(id: number) {
    const confirmar = window.confirm("Deseja realmente excluir esta pessoa?");
    if (!confirmar) return;

    try {
      setErro("");
      await pessoasService.excluir(id);
      await carregarPessoas();
    } catch (e) {
      setErro(getApiErrorMessage(e));
    }
  }

  return (
    <section>
      <h3>Pessoas</h3>

      <ErrorMessage message={erro} />

      <form onSubmit={onSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          type="number"
          placeholder="Idade"
          value={idade}
          onChange={(e) => setIdade(e.target.value === "" ? "" : Number(e.target.value))}
        />

        <button type="submit">
          {editandoId === null ? "Adicionar" : "Salvar"}
        </button>

        {editandoId !== null && (
          <button type="button" onClick={limparFormulario}>
            Cancelar edição
          </button>
        )}
      </form>

      {loading ? (
        <Loading text="Carregando pessoas..." />
      ) : pessoas.length === 0 ? (
        <EmptyState text="Nenhuma pessoa cadastrada." />
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">ID</th>
              <th align="left">Nome</th>
              <th align="left">Idade</th>
              <th align="left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pessoas.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nome}</td>
                <td>{p.idade}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => iniciarEdicao(p)}>
                    Editar
                  </button>
                  <button type="button" onClick={() => excluirPessoa(p.id)}>
                    Excluir
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