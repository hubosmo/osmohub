export type Opcao = {
  id: string;
  texto: string;
  imagem_url: string | null;
  correta: boolean;
  ordem: number;
};

export type Questao = {
  id: string;
  enunciado: string;
  tipo: string;
  imagem_url: string | null;
  explicacao: string | null;
  termo: string | null;
  ordem: number;
  opcoes: Opcao[];
};

export type QuizData = {
  id: string;
  titulo: string;
  descricao: string | null;
  capa_url: string | null;
  publicado: boolean;
  questoes: Questao[];
};

export const TIPO_LABELS: Record<string, string> = {
  MULTIPLA_ESCOLHA: "Múltiple opción",
  VERDADEIRO_FALSO: "Verdadero / Falso",
  ESCOLHA_IMAGEM: "Elegir imagen",
};
