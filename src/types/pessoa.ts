export interface Pessoa {
  id: number;
  nome: string;
  idade: number;
}

export interface PessoaCreateDto {
  nome: string;
  idade: number;
}

export interface PessoaUpdateDto {
  nome: string;
  idade: number;
}