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

const removeAcentos = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function ProgramacaoFiltro() {
  const [estadoSelecionado, setEstadoSelecionado] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const [filtro, setFiltro] = useState({
    estado: "",
    cidade: "",
  });
  const [dataSelecionada, setDataSelecionada] = useState<string | null>(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
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

  const { data: geoData, isLoading } = useQuery({
    queryKey: ["geo-location"],
    queryFn: getGeoLocation,
  });

  const { data: programacao, isFetching } = useQuery({
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

    setFiltro({
      estado: estadoSelecionado,
      cidade: cidadeSelecionada,
    });
    setDataSelecionada(null);
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

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  function Arrow(props: {
    disabled: boolean;
    left?: boolean;
    onClick: (e: any) => void;
  }) {
    const disabled = props.disabled ? " arrow--disabled" : "";
    return (
      <svg
        onClick={props.onClick}
        className={`arrow w-5 h-5 text-white bg ${
          props.left ? "arrow--left" : "arrow--right"
        } ${disabled}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        color="#fff"
      >
        {props.left && (
          <path
            fill="#fff"
            d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z"
          />
        )}
        {!props.left && (
          <path fill="#fff" d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />
        )}
      </svg>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* PARTE FIXA - Busca e Datas */}
      <div className="flex-shrink-0">
        {/* Busca */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_120px]">
          <div className="relative">
            <BiMap className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-xl text-gray-400" />

            <select
              value={estadoSelecionado}
              onChange={(e) => {
                setEstadoSelecionado(e.target.value);
                setCidadeSelecionada("");
              }}
              className="h-14 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-12 pr-5 text-gray-700 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Estado</option>

              {estados.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <HiOutlineLocationMarker className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-xl text-gray-400" />

            <select
              value={cidadeSelecionada}
              onChange={(e) => setCidadeSelecionada(e.target.value)}
              disabled={!estadoSelecionado}
              className="h-14 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-12 pr-5 text-gray-700 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">Cidade</option>

              {cidades.map((cidade) => (
                <option key={cidade} value={cidade}>
                  {cidade}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleBuscar}
            disabled={!cidadeSelecionada || isFetching}
            className="flex cursor-pointer h-14 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <HiOutlineSearch className="text-xl" />
            {isFetching ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {/* Datas */}
        {programacao && (
          <div className="my-8">
            <div className="w-full relative">
              <div ref={sliderRef} className="keen-slider w">
                {datasOrdenadas.map((dataKey) => {
                  const dataFormatada = formatarData(dataKey);
                  const isSelected = dataSelecionada === dataKey;

                  return (
                    <div
                      className="keen-slider__slide overflow-visible! md:w-auto!"
                      key={dataKey}
                    >
                      <button
                        onClick={() => setDataSelecionada(dataKey)}
                        className={`cursor-pointer flex flex-col items-center justify-center min-w-[80px] px-4 py-3 rounded-lg transition ${
                          isSelected
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
              {loaded && instanceRef.current && (
                <div className="absolute top-0 h-full flex items-center justify-between z-50 w-full">
                  <Arrow
                    left
                    onClick={(e: any) =>
                      e.stopPropagation() || instanceRef.current?.prev()
                    }
                    disabled={currentSlide === 0}
                  />

                  <Arrow
                    onClick={(e: any) =>
                      e.stopPropagation() || instanceRef.current?.next()
                    }
                    disabled={
                      currentSlide ===
                      instanceRef.current.track.details.slides.length - 1
                    }
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PARTE ROLÁVEL - Programação */}
      {programacao && (
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Mostrar apenas as salas do dia selecionado */}
          {dataSelecionada && cinemasPorData && (
            <div className="space-y-6 pb-6">
              {Object.entries(cinemasPorData).map(([cinemaKey, cinema]) => {
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
                      {Object.entries(cinema.SALAS).map(([salaKey, sala]) => (
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
                              sala.HORARIOS.map((horario, index) => (
                                <a
                                  key={index}
                                  href={horario.URL_COMPRA}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-lg border border-primary hover:border-primary-dark px-6 py-3 text-lg font-semibold text-primary transition hover:bg-primary-dark hover:text-white"
                                >
                                  {horario.HORARIO}
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
      )}
    </div>
  );
}
