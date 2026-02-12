import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import PessoasPage from "./pages/PessoasPage";
import CategoriasPage from "./pages/CategoriasPage";
import TransacoesPage from "./pages/TransacoesPage";
import RelatorioPessoasPage from "./pages/RelatorioPessoasPage";
import RelatorioCategoriasPage from "./pages/RelatorioCategoriaPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/pessoas" replace />} />
        <Route path="pessoas" element={<PessoasPage />} />
        <Route path="categorias" element={<CategoriasPage />} />
        <Route path="transacoes" element={<TransacoesPage />} />
        <Route path="relatorios/pessoas" element={<RelatorioPessoasPage />} />
        <Route path="relatorios/categorias" element={<RelatorioCategoriasPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}