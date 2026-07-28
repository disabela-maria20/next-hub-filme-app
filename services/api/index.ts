import axios from "axios";
import { handleRequest } from "../http";
import config from "@/data/config.json";
import { EstadosResponse, ProgramacaoResponse } from "@/models";

export function getGeoLocation(): Promise<EstadosResponse | null> {
  return handleRequest(
    axios.get(`https://api.vibezz.com/progApi/getEstadosFilme/${config.code}`),
  );
}

export function getGeoStateCity(
  state: string,
  city: string,
): Promise<ProgramacaoResponse | null> {
  const removeAcentos = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return handleRequest(
    axios.get(
      `https://api.vibezz.com/progApi/movie/${config.code}/${removeAcentos(state)}/${removeAcentos(city)}`,
    ),
  );
}
