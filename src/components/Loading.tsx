interface LoadingProps {
  text?: string;
}

export default function Loading({ text = "Carregando..." }: LoadingProps) {
  return <p className="state-text">{text}</p>;
}