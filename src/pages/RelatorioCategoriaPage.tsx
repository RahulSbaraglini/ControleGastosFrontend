import { useEffect, useState } from "react";
import { relatoriosService } from "../api/relatoriosService";
import { formatCurrency } from "../utils/format";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { getApiErrorMessage } from "../utils/apiError";

type RelatorioCategoriaItem = {
  categoriaId: number;
  descricao: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
};

type RelatorioCategoriasResponse = {
  categorias: RelatorioCategoriaItem[];
  totaisGerais: {
    totalReceitas: number;
    totalDespesas: number;
    saldoLiquido: number;
  };
};

export default function RelatorioCategoriasPage() {
  const [dados, setDados] = useState<RelatorioCategoriasResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarRelatorio() {
    try {
      setLoading(true);
      setErro("");

      const response = await relatoriosService.totaisPorCategoria();
      setDados(response);
    } catch (e: any) {
      if (e?.response?.status === 404) {
        setErro("Relatório por categoria ainda não está implementado no backend.");
      } else {
        setErro(getApiErrorMessage(e));
      }
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
      <h3>Relatório por Categoria</h3>

      <ErrorMessage message={erro} />

      <button type="button" onClick={carregarRelatorio} style={{ marginBottom: 16 }}>
        Atualizar relatório
      </button>

      {loading ? (
        <Loading text="Carregando relatório..." />
      ) : !dados ? (
        <EmptyState text="Sem dados para exibir." />
      ) : dados.categorias.length === 0 ? (
        <EmptyState text="Nenhum dado encontrado no relatório." />
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
            <thead>
              <tr>
                <th align="left">Categoria</th>
                <th align="left">Total Receitas</th>
                <th align="left">Total Despesas</th>
                <th align="left">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {dados.categorias.map((item) => (
                <tr key={item.categoriaId}>
                  <td>{item.descricao}</td>
                  <td>{formatCurrency(item.totalReceitas)}</td>
                  <td>{formatCurrency(item.totalDespesas)}</td>
                  <td>{formatCurrency(item.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 8,
              maxWidth: 420,
            }}
          >
            <strong>Total Geral</strong>
            <p style={{ margin: "8px 0 0" }}>
              Receitas: {formatCurrency(dados.totaisGerais.totalReceitas)}
            </p>
            <p style={{ margin: "4px 0 0" }}>
              Despesas: {formatCurrency(dados.totaisGerais.totalDespesas)}
            </p>
            <p style={{ margin: "4px 0 0" }}>
              Saldo Líquido: {formatCurrency(dados.totaisGerais.saldoLiquido)}
            </p>
          </div>
        </>
      )}
    </section>
  );
}