import { NOTES } from "../../constants/Api";
import type { KnowledgeNote } from "../../data/knowledgeData";
import AxiosInstance from "../../utils/AxiosInstance";

interface FetchNotesResponse {
  notes: KnowledgeNote[];
  totalLength: number;
}

export const fetchNotes = async (
  pageNumber: number,
  search?: string
): Promise<FetchNotesResponse> => {
  const query = new URLSearchParams({ page: String(pageNumber) });
  if (search) query.append("search", search);

  const response = await AxiosInstance.get(`${NOTES}?${query.toString()}`);
  return response.data;
};

export interface NoteInput {
  title: string;
  content: string;
  tags: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
}

export const createNote = async (input: NoteInput): Promise<KnowledgeNote> => {
  const response = await AxiosInstance.post(NOTES, input);
  return response.data;
};

export const updateNote = async (
  id: string,
  input: NoteInput
): Promise<KnowledgeNote> => {
  const response = await AxiosInstance.put(`${NOTES}/${id}`, input);
  return response.data;
};

export const deleteNote = async (id: string): Promise<void> => {
  await AxiosInstance.delete(`${NOTES}/${id}`);
};
