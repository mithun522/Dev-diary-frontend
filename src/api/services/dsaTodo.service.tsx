import { DSA_TODOS, DSA_TODOS_BY_USER } from "../../constants/Api";
import type { DsaTodo } from "../../data/dsaTodoData";
import AxiosInstance from "../../utils/AxiosInstance";

export const fetchDsaTodos = async (): Promise<DsaTodo[]> => {
  const response = await AxiosInstance.get(DSA_TODOS_BY_USER);
  return response.data;
};

export const createDsaTodo = async (payload: DsaTodo): Promise<DsaTodo> => {
  const response = await AxiosInstance.post(DSA_TODOS, payload);
  return response.data;
};

export const updateDsaTodo = async (
  id: string,
  payload: DsaTodo
): Promise<DsaTodo> => {
  const response = await AxiosInstance.put(`${DSA_TODOS}/${id}`, payload);
  return response.data;
};

export const deleteDsaTodo = async (id: string): Promise<void> => {
  await AxiosInstance.delete(`${DSA_TODOS}/${id}`);
};
