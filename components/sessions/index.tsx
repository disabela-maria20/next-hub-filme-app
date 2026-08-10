/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/refs */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineLocationMarker, HiOutlineSearch } from "react-icons/hi";
import { BiMap } from "react-icons/bi";
import { getGeoLocation, getGeoStateCity } from "@/services/api";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import React from "react";
import Video from "../video";
import config from "@/data/config.json";
// Componente de Loading melhorado
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
    <div className="flex space-x-2">
      <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
      <div className="h-4 w-4 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
      <div className="h-4 w-4 animate-bounce rounded-full bg-primary"></div>
    </div>
    <p className="text-gray-400 text-sm animate-pulse">Carregando...</p>
  </div>
);

// Componente de Loading para cards
const CardLoadingSkeleton = () => (
  <div className="rounded-2xl border border-white/10 bg-[#111317] p-6 animate-pulse">
    <div className="mb-5 border-b border-white/10 pb-5">
      <div className="h-8 w-3/4 bg-gray-700 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-gray-700 rounded"></div>
    </div>
    <div className="space-y-8">
      {[1, 2].map((i) => (
        <div key={i}>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="h-6 w-32 bg-gray-700 rounded"></div>
            <div className="h-6 w-16 bg-gray-700 rounded"></div>
            <div className="h-6 w-16 bg-gray-700 rounded"></div>
          </div>
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-12 w-20 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const removeAcentos = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Hook personalizado para DataLayer
const useDataLayer = () => {
  const pushEvent = (event: any) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push(event);
    } else if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(event);
    }
  };

  const pushTicketingEvent = (
    action: string,
    label: string,
    additionalData?: any,
  ) => {
    const eventData = {
      event: action,
      event_category: "Ticketing Event",
      event_action: action,
      event_label: label,
      page_title: `${config.seo.title || "Filme"} Ticketing`,
      property_title: config.seo.title || "Filme",
      content_type: "microsite",
      site_country: "BR",
      ...additionalData,
    };
    pushEvent(eventData);
    console.log("DataLayer Event:", eventData); // Para debug
  };

  return { pushEvent, pushTicketingEvent };
};

export default function ProgramacaoFiltro() {
  const [estadoSelecionado, setEstadoSelecionado] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const [cinemaSelecionado, setCinemaSelecionado] = useState("");
  const [filtro, setFiltro] = useState({
    estado: "",
    cidade: "",
  });
  const [dataSelecionada, setDataSelecionada] = useState<string | null>(null);

  const [, setCurrentSlide] = useState(0);
  const [, setLoaded] = useState(false);
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    loop: false,
    slides: { perView: "auto", spacing: 20 },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
  });

  // Inicializa o DataLayer
  const { pushEvent, pushTicketingEvent } = useDataLayer();

  const { data: geoData, isLoading: isLoadingGeo } = useQuery({
    queryKey: ["geo-location"],
    queryFn: getGeoLocation,
  });

  const { data: programacao, isFetching: isFetchingProgramacao } = useQuery({
    queryKey: ["programacao", filtro.estado, filtro.cidade],
    queryFn: () =>
      getGeoStateCity(
        removeAcentos(filtro.estado),
        removeAcentos(filtro.cidade),
      ),
    enabled: !!filtro.cidade,
  });

  const estados = useMemo(() => {
    if (!geoData) return [];

    return [...new Set(geoData.estados.map((x) => x.ESTADO))].sort((a, b) =>
      a.localeCompare(b, "pt-BR"),
    );
  }, [geoData]);

  const cidades = useMemo(() => {
    if (!geoData || !estadoSelecionado) return [];

    return [
      ...new Set(
        geoData.estados
          .filter((x) => x.ESTADO === estadoSelecionado)
          .map((x) => x.CIDADE),
      ),
    ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [geoData, estadoSelecionado]);

  const handleBuscar = () => {
    if (!cidadeSelecionada) return;

    // Envia evento de cidade selecionada
    pushTicketingEvent("city", cidadeSelecionada, {
      estado: estadoSelecionado,
      cidade: cidadeSelecionada,
    });

    setFiltro({
      estado: estadoSelecionado,
      cidade: cidadeSelecionada,
    });
    setDataSelecionada(null);
    setCinemaSelecionado("");
  };

  // Função para formatar a data
  const formatarData = (dataStr: string) => {
    if (!dataStr) {
      return {
        diaSemana: "",
        dia: "",
        mes: "",
        completa: "",
      };
    }

    let dia: number, mes: number, ano: number;

    if (dataStr.includes("-")) {
      const partes = dataStr.split("-");
      if (partes.length === 3) {
        ano = Number(partes[0]);
        mes = Number(partes[1]);
        dia = Number(partes[2]);
      } else {
        return {
          diaSemana: "",
          dia: "",
          mes: "",
          completa: dataStr,
        };
      }
    } else if (dataStr.includes("/")) {
      const partes = dataStr.split("/");
      if (partes.length === 3) {
        dia = Number(partes[0]);
        mes = Number(partes[1]);
        ano = Number(partes[2]);
      } else {
        return {
          diaSemana: "",
          dia: "",
          mes: "",
          completa: dataStr,
        };
      }
    } else {
      return {
        diaSemana: "",
        dia: "",
        mes: "",
        completa: dataStr,
      };
    }

    if ([dia, mes, ano].some(Number.isNaN)) {
      return {
        diaSemana: "",
        dia: "",
        mes: "",
        completa: dataStr,
      };
    }

    const data = new Date(ano, mes - 1, dia);

    if (Number.isNaN(data.getTime())) {
      return {
        diaSemana: "",
        dia: "",
        mes: "",
        completa: dataStr,
      };
    }

    const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
    const meses = [
      "JAN",
      "FEV",
      "MAR",
      "ABR",
      "MAI",
      "JUN",
      "JUL",
      "AGO",
      "SET",
      "OUT",
      "NOV",
      "DEZ",
    ];

    return {
      diaSemana: diasSemana[data.getDay()],
      dia: String(dia).padStart(2, "0"),
      mes: meses[data.getMonth()],
      completa: dataStr,
    };
  };

  // Função para formatar horário (remove os segundos)
  const formatarHorario = (horario: string) => {
    if (!horario) return "";

    // Se tiver segundos (formato HH:MM:SS), remove os segundos
    if (horario.includes(":")) {
      const partes = horario.split(":");
      if (partes.length >= 2) {
        return `${partes[0]}:${partes[1]}`;
      }
    }

    return horario;
  };

  const datasOrdenadas = useMemo(() => {
    if (!programacao?.filme?.programacao) return [];

    return Object.keys(programacao.filme.programacao).sort((a, b) => {
      const parse = (data: string) => {
        let dia: number, mes: number, ano: number;

        if (data.includes("-")) {
          const partes = data.split("-");
          ano = Number(partes[0]);
          mes = Number(partes[1]);
          dia = Number(partes[2]);
        } else if (data.includes("/")) {
          const partes = data.split("/");
          dia = Number(partes[0]);
          mes = Number(partes[1]);
          ano = Number(partes[2]);
        } else {
          return 0;
        }

        return new Date(ano, mes - 1, dia).getTime();
      };

      return parse(a) - parse(b);
    });
  }, [programacao]);

  useEffect(() => {
    if (datasOrdenadas.length > 0 && !dataSelecionada) {
      setDataSelecionada(datasOrdenadas[0]);
    }
  }, [datasOrdenadas, dataSelecionada]);

  const cinemasPorData = useMemo(() => {
    if (!programacao || !dataSelecionada) return null;

    const diaSelecionado = programacao.filme.programacao[dataSelecionada];
    if (!diaSelecionado) return null;

    return diaSelecionado.CINEMAS;
  }, [programacao, dataSelecionada]);

  // Lista de cinemas para o select em ordem alfabética
  const listaCinemas = useMemo(() => {
    if (!cinemasPorData) return [];

    return Object.entries(cinemasPorData)
      .map(([key, cinema]) => ({
        key,
        nome: cinema.CINEMA,
        cidade: cinema.CIDADE,
        estado: cinema.ESTADO,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [cinemasPorData]);

  // Filtrar cinemas pelo selecionado
  const cinemasFiltrados = useMemo(() => {
    if (!cinemasPorData) return null;

    if (cinemaSelecionado) {
      // Se um cinema foi selecionado, mostra apenas ele
      const cinema = cinemasPorData[cinemaSelecionado];
      return cinema ? { [cinemaSelecionado]: cinema } : null;
    }

    // Se nenhum cinema foi selecionado, mostra todos
    return cinemasPorData;
  }, [cinemasPorData, cinemaSelecionado]);

  // Efeito para rastrear quando a programação é carregada
  useEffect(() => {
    if (programacao && filtro.cidade) {
      // Envia evento de visualização da programação
      pushEvent({
        event: "programacao_view",
        event_category: "Ticketing Event",
        event_action: "view_programacao",
        event_label: filtro.cidade,
        cidade: filtro.cidade,
        estado: filtro.estado,
        page_title: `${config.seo.title || "Filme"} Ticketing`,
        property_title: config.seo.title || "Filme",
        content_type: "microsite",
        site_country: "BR",
      });
    }
  }, [programacao, filtro.cidade, filtro.estado, pushEvent]);

  // Loading principal da página
  if (isLoadingGeo) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Se não tiver dados de geolocalização
  if (!geoData) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 text-lg">
              Não foi possível carregar os dados de localização
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verifica se já foi feita alguma pesquisa
  const hasPesquisa = filtro.estado !== "" && filtro.cidade !== "";

  return (
    <div className="flex flex-col h-full">
      {/* PARTE FIXA - Busca e Datas */}
      <div className="shrink-0">
        {/* Busca */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_120px] pt-6">
          <div className="relative">
            <BiMap className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-xl text-gray-400" />

            <select
              value={estadoSelecionado}
              onChange={(e) => {
                setEstadoSelecionado(e.target.value);
                setCidadeSelecionada("");
              }}
              className="h-14 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-12 pr-10 text-gray-700 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Estado</option>

              {estados.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>

            {/* Setinha do select Estado */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="relative">
            <HiOutlineLocationMarker className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-xl text-gray-400" />

            <select
              value={cidadeSelecionada}
              onChange={(e) => setCidadeSelecionada(e.target.value)}
              disabled={!estadoSelecionado}
              className="h-14 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-12 pr-10 text-gray-700 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">Cidade</option>

              {cidades.map((cidade) => (
                <option key={cidade} value={cidade}>
                  {cidade}
                </option>
              ))}
            </select>

            {/* Setinha do select Cidade */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                />
              </svg>
            </div>
          </div>

          <button
            onClick={handleBuscar}
            disabled={!cidadeSelecionada || isFetchingProgramacao}
            className="flex cursor-pointer h-14 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetchingProgramacao ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Buscando...
              </>
            ) : (
              <>
                <HiOutlineSearch className="text-xl" />
                Buscar
              </>
            )}
          </button>
        </div>

        {/* Datas e Select Cinema */}
        {programacao && (
          <div className="my-8 grid md:grid-cols-3 gap-4">
            <div className="w-full relative md:col-span-2">
              <div ref={sliderRef} className="keen-slider w">
                {datasOrdenadas.map((dataKey) => {
                  const dataFormatada = formatarData(dataKey);
                  const isSelected = dataSelecionada === dataKey;

                  return (
                    <div
                      className="keen-slider__slide overflow-visible! w-auto!"
                      key={dataKey}
                    >
                      <button
                        onClick={() => {
                          setDataSelecionada(dataKey);
                          setCinemaSelecionado("");
                          // Envia evento de data selecionada
                          pushTicketingEvent("date", dataKey, {
                            data_formatada: `${dataFormatada.diaSemana} ${dataFormatada.dia} ${dataFormatada.mes}`,
                          });
                        }}
                        className={`cursor-pointer flex flex-col items-center justify-center min-w-[80px] px-4 py-3 rounded-lg transition ${isSelected
                          ? "bg-primary text-white"
                          : "bg-[#111317] text-white hover:bg-[#1a1d24] border border-white/10"
                          }`}
                      >
                        <span className="text-xs font-medium uppercase tracking-wider">
                          {dataFormatada.diaSemana}
                        </span>
                        <span className="text-2xl font-bold leading-none mt-1">
                          {dataFormatada.dia}
                        </span>
                        <span className="text-xs font-medium uppercase mt-1">
                          {dataFormatada.mes}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-1">
              {/* Select para listar os cinemas em ordem alfabética */}
              {cinemasPorData && Object.keys(cinemasPorData).length > 0 && (
                <div className="relative">
                  <select
                    value={cinemaSelecionado}
                    onChange={(e) => {
                      const valor = e.target.value;
                      setCinemaSelecionado(valor);
                      if (valor) {
                        // Envia evento de filtro por cinema
                        pushTicketingEvent("theater select", valor, {
                          cidade: filtro.cidade,
                          estado: filtro.estado,
                        });
                      }
                    }}
                    className="w-full appearance-none rounded-lg border border-white/10 bg-[#111317] px-4 py-3 pr-10 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Filtrar por cinemas</option>
                    {listaCinemas.map((cinema) => (
                      <option key={cinema.key} value={cinema.key}>
                        {cinema.nome}
                      </option>
                    ))}
                  </select>

                  {/* Setinha do select Cinema */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white">
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PARTE ROLÁVEL - Programação */}
      {isFetchingProgramacao && !programacao ? (
        // Loading enquanto busca a programação
        <div className="flex-1 overflow-y-auto min-h-0 pt-7">
          <div className="space-y-6 pb-6">
            <CardLoadingSkeleton />
            <CardLoadingSkeleton />
          </div>
        </div>
      ) : programacao ? (
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Mostrar apenas as salas do dia selecionado */}
          {dataSelecionada && cinemasFiltrados && (
            <div className="space-y-6 pb-6">
              {Object.entries(cinemasFiltrados)
                .sort(([, a], [, b]) =>
                  a.CINEMA.localeCompare(b.CINEMA, "pt-BR"),
                )
                .map(([cinemaKey, cinema]) => {
                  if (!cinema.SALAS || Object.keys(cinema.SALAS).length === 0) {
                    return (
                      <div
                        key={cinemaKey}
                        className="rounded-2xl border border-white/10 bg-[#111317] p-6"
                      >
                        <div className="mb-5 border-b border-white/10 pb-5">
                          <h3 className="text-3xl font-semibold text-white">
                            {cinema.CINEMA || "Cinema sem nome"}
                          </h3>
                          <p className="mt-2 text-gray-400">
                            {cinema.CIDADE || ""}, {cinema.ESTADO || ""}
                          </p>
                        </div>
                        <p className="text-gray-400">Nenhuma sala disponível</p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={cinemaKey}
                      className="rounded-2xl border border-white/10 bg-[#111317] p-6"
                    >
                      <div className="mb-5 border-b border-white/10 pb-5">
                        <h3 className="text-3xl font-semibold text-white">
                          {cinema.CINEMA}
                        </h3>

                        <p className="mt-2 text-gray-400">
                          {cinema.CIDADE}, {cinema.ESTADO}
                        </p>
                      </div>

                      <div className="space-y-8">
                        {Object.entries(cinema.SALAS)
                          .sort(([, a], [, b]) =>
                            a.SALA.localeCompare(b.SALA, "pt-BR"),
                          )
                          .map(([salaKey, sala]) => (
                            <div key={salaKey}>
                              <div className="mb-4 flex flex-wrap items-center gap-3">
                                <span className="text-xl font-semibold text-white">
                                  {sala.SALA}
                                </span>

                                {sala.TIPO && (
                                  <span className="rounded bg-gray-700 px-3 py-1 text-xs text-white">
                                    {sala.TIPO}
                                  </span>
                                )}

                                {sala.LEGENDA && (
                                  <span className="rounded bg-gray-700 px-3 py-1 text-xs text-white">
                                    {sala.LEGENDA}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-3">
                                {sala.HORARIOS &&
                                  sala.HORARIOS.sort((a, b) =>
                                    a.HORARIO.localeCompare(b.HORARIO),
                                  ).map((horario, index) => (
                                    <a
                                      key={index}
                                      href={horario.URL_COMPRA}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => {
                                        // Envia evento de horário selecionado
                                        pushTicketingEvent(
                                          "time",
                                          horario.HORARIO,
                                          {
                                            cinema: cinema.CINEMA,
                                            sala: sala.SALA,
                                            data: dataSelecionada,
                                            url_compra: horario.URL_COMPRA,
                                          },
                                        );
                                      }}
                                      className="rounded-lg border border-primary hover:border-primary-dark px-6 py-3 text-lg font-semibold text-primary transition hover:bg-primary-dark hover:text-white"
                                    >
                                      {formatarHorario(horario.HORARIO)}
                                    </a>
                                  ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Mensagem quando nenhuma data está selecionada */}
          {!dataSelecionada && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                Selecione uma data para ver os horários disponíveis
              </p>
            </div>
          )}
        </div>
      ) : (
        // Mostra o Video apenas quando NÃO houver pesquisa
        <div className="flex-1 overflow-y-auto min-h-0 mt-8">
          <Video />

          <section className="mt-10 pb-10">
            <div className="rounded-2xl border border-white/10 bg-[#111317] p-6 md:p-8 shadow-lg">

              <div className="mb-8">
                <span className="text-lg font-semibold  text-primary">
                  Ficha técnica
                </span>

                <div className="mt-3 h-px w-full bg-white/10" />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Formato
                  </p>
                  <p className="text-base font-semibold text-white">
                    {config.fichaTecnica.formato}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Gêneros
                  </p>
                  <p className="text-base font-semibold text-white">
                    {config.fichaTecnica.generos.join(", ")}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Duração
                  </p>
                  <p className="text-base font-semibold text-white">
                    {config.fichaTecnica.duracao}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                    País / Ano
                  </p>
                  <p className="text-base font-semibold text-white">
                    {config.fichaTecnica.pais}, {config.fichaTecnica.ano}
                  </p>
                </div>

              </div>

              <div className="mt-8 border-t border-white/10 pt-8">
                <h2 className="mb-4 text-xl font-semibold text-white">
                  Sinopse
                </h2>

                <p className="max-w-4xl text-base leading-7 text-gray-400">
                  {config.sinopse}
                </p>
              </div>

            </div>
          </section>
        </div>
      )}
    </div>
  );
}
