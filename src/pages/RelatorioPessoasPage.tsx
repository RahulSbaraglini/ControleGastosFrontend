import { useEffect, useState } from "react";
import { relatoriosService, type RelatorioPessoasResponse } from "../api/relatoriosService";
import { formatCurrency } from "../utils/format";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { getApiErrorMessage } from "../utils/apiError";

export default function RelatorioPessoasPage() {
  const [dados, setDados] = useState<RelatorioPessoasResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarRelatorio() {
    try {
      setLoading(true);
      setErro("");
      const response = await relatoriosService.totaisPorPessoa();
      setDados(response);
    } catch (e) {
      setErro(getApiErrorMessage(e));
      setDados(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarRelatorio();
  }, []);

  return (
    <section>
      <h3>Relatório por Pessoa</h3>
      <ErrorMessage message={erro} />
      <button type="button" onClick={carregarRelatorio} style={{ marginBottom: 16 }}>
        Atualizar relatório
      </button>

      {loading ? (
        <Loading text="Carregando relatório..." />
      ) : !dados ? (
        <EmptyState text="Sem dados para exibir." />
      ) : dados.pessoas.length === 0 ? (
        <EmptyState text="Nenhum dado encontrado no relatório." />
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
            <thead>
              <tr>
                <th align="left">Pessoa</th>
                <th align="left">Total Receitas</th>
                <th align="left">Total Despesas</th>
                <th align="left">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {dados.pessoas.map((item) => (
                <tr key={item.pessoaId}>
                  <td>{item.nome}</td>
                  <td>{formatCurrency(item.totalReceitas)}</td>
                  <td>{formatCurrency(item.totalDespesas)}</td>
                  <td>{formatCurrency(item.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, maxWidth: 420 }}>
            <strong>Total Geral</strong>
            <p style={{ margin: "8px 0 0" }}>Receitas: {formatCurrency(dados.totaisGerais.totalReceitas)}</p>
            <p style={{ margin: "4px 0 0" }}>Despesas: {formatCurrency(dados.totaisGerais.totalDespesas)}</p>
            <p style={{ margin: "4px 0 0" }}>Saldo Líquido: {formatCurrency(dados.totaisGerais.saldoLiquido)}</p>
          </div>
        </>
      )}
    </section>
  );
}