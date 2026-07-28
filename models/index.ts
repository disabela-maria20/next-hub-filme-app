export interface Estado {
  CIDADE: string;
  ESTADO: string;
}

export interface EstadosResponse {
  estados: Estado[];
}

export interface Horario {
  HORARIO: string;
  URL_COMPRA: string;
  IMAX: number;
  "3D": number;
  LEGENDADO: number;
}

export interface Sala {
  SALA: string;
  LEGENDA: string;
  TIPO: string;
  HORARIOS: Horario[];
}

export interface Cinema {
  DATA: string;
  CINEMA: string;
  ESTADO: string;
  CIDADE: string;
  ENDERECO: string;
  NUMERO: string;
  BAIRRO: string | null;
  SALAS: Record<string, Sala>;
}

export interface ProgramacaoDia {
  DATA: string;
  TITULO: string;
  CINEMAS: Record<string, Cinema>;
}

export interface Filme {
  programacao: Record<string, ProgramacaoDia>;
}

export interface ProgramacaoResponse {
  filme: Filme;
}
