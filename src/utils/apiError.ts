export function getApiErrorMessage(error: unknown): string {
  const err = error as any;

  // Falha de rede API Fora, CORS etc
  if (err?.code === "ERR_NETWORK") {
    return "Não foi possível conectar com a API. Verifique se o backend está ativo e se a URL/CORS estão corretos.";
  }

  // Mensagens comuns vindas do .NET
  const apiMessage =
    err?.response?.data?.message ||
    err?.response?.data?.title ||
    err?.response?.data?.detail;

  if (apiMessage) return String(apiMessage);

  // Erro padrão JavaScript
  if (error instanceof Error && error.message) return error.message;

  return "Ocorreu um erro inesperado.";
}