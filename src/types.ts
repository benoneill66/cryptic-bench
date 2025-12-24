export type Clue = {
  id: string;
  clue: string;
  answer: string;
  notes?: string;
};

export type ModelResult = {
  model: string;
  clueId: string;
  answer: string;
  raw?: string;
  score?: number;
  pass: boolean;
};
