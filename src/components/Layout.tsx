import { Link, NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <h1 className="app-title">Controle de Gastos Residenciais</h1>
        </Link>

        <nav className="app-nav">
          <NavLink to="/pessoas">Pessoas</NavLink>
          <NavLink to="/categorias">Categorias</NavLink>
          <NavLink to="/transacoes">Transações</NavLink>
          <NavLink to="/relatorios/pessoas">Relatório por Pessoa</NavLink>
          <NavLink to="/relatorios/categorias">Relatório por Categoria</NavLink>
        </nav>
      </header>

      <main className="page-card">
        <Outlet />
      </main>
    </div>
  );
}