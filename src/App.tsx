"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle } from "lucide-react";

interface ValidationCard {
  id: string;
  numero: string;
  plantilla: string;
  tipo: "Int" | "Int + repetidor" | "Mant" | "Post Venta" | "";
  estado: "pendiente" | "completado" | "rechazado";
}

interface ConfirmacionCard {
  id: string;
  contenido: string;
  tipoPlantilla: "confirmacion" | "ciclo_llamada" | "reagendado";
  plantillaGenerada: string;
}

export default function PlantillasHitss() {
  const [activeModule, setActiveModule] = useState<
    "confirmacion" | "rechazos" | "validaciones"
  >("validaciones");
  const [cards, setCards] = useState<ValidationCard[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [currentPlantilla, setCurrentPlantilla] = useState("");
  const [currentTipo, setCurrentTipo] = useState<
    "Int" | "Int + repetidor" | "Mant" | "Post Venta" | ""
  >("");
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [showPlantillaInput, setShowPlantillaInput] = useState(false);
  const [confirmacionCards, setConfirmacionCards] = useState<
    ConfirmacionCard[]
  >([]);
  const [confirmacionInput, setConfirmacionInput] = useState("");
  const [confirmacionTipo, setConfirmacionTipo] = useState<
    "confirmacion" | "ciclo_llamada" | "reagendado"
  >("confirmacion");

  // Cargar datos del localStorage
  useEffect(() => {
    const saved = localStorage.getItem("validationCards");
    if (saved) {
      setCards(JSON.parse(saved));
    }
    const savedConfirmacion = localStorage.getItem("confirmacionCards");
    if (savedConfirmacion) {
      setConfirmacionCards(JSON.parse(savedConfirmacion));
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem("validationCards", JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem(
      "confirmacionCards",
      JSON.stringify(confirmacionCards),
    );
  }, [confirmacionCards]);

  const handleAddCard = () => {
    if (currentInput.trim()) {
      const newCard: ValidationCard = {
        id: Date.now().toString(),
        numero: currentInput,
        plantilla: "",
        tipo: currentTipo || "",
        estado: "pendiente",
      };
      setCards([...cards, newCard]);
      setCurrentInput("");
      setCurrentTipo("");
      setEditingCardId(newCard.id);
      setShowPlantillaInput(true);
    }
  };

  const handleSavePlantilla = (cardId: string) => {
    setCards(
      cards.map((card) =>
        card.id === cardId
          ? {
              ...card,
              plantilla: currentPlantilla,
              tipo: currentTipo || card.tipo,
            }
          : card,
      ),
    );
    setCurrentPlantilla("");
    setCurrentTipo("");
    setEditingCardId(null);
    setShowPlantillaInput(false);
  };

  const handleChangeState = (
    cardId: string,
    estado: "completado" | "rechazado",
  ) => {
    setCards(
      cards.map((card) => (card.id === cardId ? { ...card, estado } : card)),
    );
  };

  const handleEditCard = (card: ValidationCard) => {
    setEditingCardId(card.id);
    setCurrentPlantilla(card.plantilla);
    setCurrentTipo(card.tipo);
    setShowPlantillaInput(true);
  };

  const completedCount = cards.filter((c) => c.estado === "completado").length;
  const rejectedCount = cards.filter((c) => c.estado === "rechazado").length;
  const totalCount = cards.length;

  /* proceso de confirmacion */

  const [textoBruto, setTextoBruto] = useState("");
  const [plantillaGenerada, setPlantillaGenerada] = useState("");
  const [copiado, setCopiado] = useState(false);

  const extraer = (texto: string, regex: RegExp) => {
    const match = texto.match(regex);
    return match ? match[1].replace(/\s+/g, " ").trim() : '""';
  };

  function obtenerFechaYFranja(): string {
    const ahora = new Date();

    const dia = String(ahora.getDate()).padStart(2, "0");
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const anio = ahora.getFullYear();

    const horas = ahora.getHours();
    const minutos = ahora.getMinutes();
    const horaDecimal = horas + minutos / 60;

    let franja = "";

    if (horaDecimal >= 9 && horaDecimal < 11) {
      franja = "AM1";
    } else if (horaDecimal >= 11 && horaDecimal < 13) {
      franja = "AM2";
    } else if (horaDecimal >= 13 && horaDecimal < 16) {
      franja = "PM1";
    } else if (horaDecimal >= 16 && horaDecimal < 18) {
      franja = "PM2";
    } else {
      franja = ""; // fuera de rango
    }

    return `${dia}/${mes}/${anio}, ${franja}`;
  }

  const generarPlantilla = () => {
    const fechaYFranja = obtenerFechaYFranja()
    const numero = extraer(textoBruto, /Telefono\s*(\d+)/i);
    const cliente = extraer(
      textoBruto,
      /Nombre\s*([\s\S]*?)\s*(?=Tipo de Documento)/i,
    );
    const sot = extraer(textoBruto, /SOT\s*(\d+)/i);

    let resultado = "";

    if (confirmacionTipo === "confirmacion") {
      resultado = `***MESA DE PROGRAMACIONES HITSS - CONFIRMA VISITA*
SOT: ${sot}
DÍA Y FRANJA: ${fechaYFranja}
CLIENTE: ${cliente}
NUMERO: ${numero}
ID DE LLAMADA: 
REALIZADO POR: Anderson Alfaro - ADP MULTISKILL HITSS`;
    }

    if (confirmacionTipo === "ciclo_llamada") {
      resultado = `***MESA DE PROGRAMACIONES HITSS  - CICLO DE LLAMADAS***
CICLO DE LLAMADA NRO: 1
CANTIDAD DE LLAMADAS: 4
NUMERO: ${numero}
MOTIVO: FALTA DE CONTACTO
SUB-MOTIVO: - no contesta-
ID DE LLAMADA: 
REALIZADO POR: Anderson Alfaro - ADP MULTISKILL HITSS`;
    }

    if (confirmacionTipo === "reagendado") {
      resultado = `**MESA DE PROGRAMACIONES HITSS**
REPROGRAMADO EN MESA / REAGENDADO POR CLIENTE
CLIENTE: ${cliente}
NUMERO: ${numero}
NUEVA FECHA Y FRANJA DE VISITA: ${fechaYFranja}
ID DE LLAMADA: 
OBSERVACIÓN: 
REALIZADO POR: Anderson Alfaro - ADP MULTISKILL HITSS`;
    }

    setPlantillaGenerada(resultado);
  };

  const copiarPlantilla = async () => {
    const lineal = plantillaGenerada
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    await navigator.clipboard.writeText(lineal);

    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Plantillas Hitss
          </h1>
          <p className="text-slate-300">
            Gestiona tus plantillas de validación, confirmación y rechazos
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeModule}
          onValueChange={(value: any) => setActiveModule(value)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-800">
            <TabsTrigger value="confirmacion" className="text-white">
              Confirmación
            </TabsTrigger>
            <TabsTrigger value="rechazos" className="text-white">
              Rechazos
            </TabsTrigger>
            <TabsTrigger value="validaciones" className="text-white">
              Validaciones
            </TabsTrigger>
          </TabsList>

          {/* Módulo Confirmación */}
          <TabsContent value="confirmacion">
            <div className="space-y-6">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">
                    Generar Plantilla de Confirmación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={textoBruto}
                    onChange={(e) => setTextoBruto(e.target.value)}
                    placeholder="Pega aquí todo el texto completo del sistema..."
                    className="
    bg-slate-600 border-slate-500 text-white 
    placeholder:text-slate-400
    h-40 max-h-40 min-h-40
    resize-none overflow-y-auto
  "
                  />

                  <select
                    value={confirmacionTipo}
                    onChange={(e) => setConfirmacionTipo(e.target.value as any)}
                    className="w-full bg-slate-600 border border-slate-500 text-white rounded px-3 py-2"
                  >
                    <option value="confirmacion">Confirmar visita</option>
                    <option value="ciclo_llamada">Ciclo de llamada</option>
                    <option value="reagendado">Reagendado</option>
                  </select>

                  <Button
                    onClick={generarPlantilla}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Generar plantilla
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-blue-900 border-blue-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Resultado (editable)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={plantillaGenerada}
                    onChange={(e) => setPlantillaGenerada(e.target.value)}
                    placeholder="Aquí aparecerá la plantilla generada..."
                    className="bg-blue-800 border-blue-700 text-white min-h-48"
                  />

                  <Button
                    onClick={copiarPlantilla}
                    className={`w-full flex items-center justify-center gap-2 transition ${
                      copiado
                        ? "bg-green-600 hover:bg-green-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {copiado ? (
                      <>
                        <CheckCircle className="w-5 h-5" /> Copiado
                      </>
                    ) : (
                      "Copiar"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Módulo Rechazos */}
          <TabsContent value="rechazos">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Módulo de Rechazos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-300 text-center py-12">
                  <p className="text-lg">Este módulo está en desarrollo...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Módulo Validaciones */}
          <TabsContent value="validaciones">
            <div className="space-y-6">
              {/* Estadísticas */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-blue-600 border-blue-500">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-blue-100 text-sm mb-2">
                        Total Registrados
                      </p>
                      <p className="text-4xl font-bold text-white">
                        {totalCount}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-600 border-green-500">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-green-100 text-sm mb-2">Completados</p>
                      <p className="text-4xl font-bold text-white">
                        {completedCount}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-red-600 border-red-500">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-red-100 text-sm mb-2">Rechazados</p>
                      <p className="text-4xl font-bold text-white">
                        {rejectedCount}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Input para nuevo número */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">
                    Agregar Nueva Validación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Ingresa un número"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddCard()}
                      className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400"
                    />
                    <Button
                      onClick={handleAddCard}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Agregar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Grid de Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => (
                  <Card
                    key={card.id}
                    className={`border-2 transition-all ${
                      card.estado === "completado"
                        ? "bg-green-900 border-green-600"
                        : card.estado === "rechazado"
                          ? "bg-red-900 border-red-600"
                          : "bg-slate-700 border-slate-600"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <CardTitle className="text-white text-xl">
                            #{card.numero}
                          </CardTitle>
                          {card.tipo && (
                            <p className="text-slate-300 text-xs mt-1 font-medium bg-slate-600 px-2 py-1 rounded inline-block">
                              {card.tipo}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {card.estado === "completado" && (
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          )}
                          {card.estado === "rechazado" && (
                            <XCircle className="w-6 h-6 text-red-400" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Plantilla */}
                      <div className="bg-slate-600 p-3 rounded min-h-20 max-h-32 overflow-y-auto">
                        <p className="text-slate-300 text-sm whitespace-pre-wrap">
                          {card.plantilla || "Sin plantilla asignada"}
                        </p>
                      </div>

                      {/* Botones */}
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleEditCard(card)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          variant="default"
                        >
                          Editar Plantilla
                        </Button>

                        {card.estado === "pendiente" && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              onClick={() =>
                                handleChangeState(card.id, "completado")
                              }
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Completado
                            </Button>
                            <Button
                              onClick={() =>
                                handleChangeState(card.id, "rechazado")
                              }
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Rechazado
                            </Button>
                          </div>
                        )}

                        {card.estado !== "pendiente" && (
                          <Button
                            onClick={() =>
                              setCards(
                                cards.map((c) =>
                                  c.id === card.id
                                    ? { ...c, estado: "pendiente" }
                                    : c,
                                ),
                              )
                            }
                            className="w-full bg-slate-500 hover:bg-slate-600 text-white"
                            variant="outline"
                          >
                            Restaurar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Modal de edición de Plantilla */}
              {showPlantillaInput && editingCardId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                  <Card className="bg-slate-700 border-slate-600 max-w-2xl w-full">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Editar Plantilla - #
                        {cards.find((c) => c.id === editingCardId)?.numero}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-white text-sm font-medium mb-2 block">
                          Tipo de Validación
                        </label>
                        <select
                          value={currentTipo}
                          onChange={(e) =>
                            setCurrentTipo(e.target.value as any)
                          }
                          className="w-full bg-slate-600 border border-slate-500 text-white rounded px-3 py-2"
                        >
                          <option value="">Seleccionar tipo...</option>
                          <option value="Int">Int</option>
                          <option value="Int + repetidor">
                            Int + repetidor
                          </option>
                          <option value="Mant">Mant</option>
                          <option value="Post Venta">Post Venta</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm font-medium mb-2 block">
                          Contenido de Plantilla
                        </label>
                        <Textarea
                          value={currentPlantilla}
                          onChange={(e) => setCurrentPlantilla(e.target.value)}
                          placeholder="Ingresa el contenido de la plantilla aquí..."
                          className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400 min-h-64"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => {
                            setEditingCardId(null);
                            setShowPlantillaInput(false);
                            setCurrentPlantilla("");
                            setCurrentTipo("");
                          }}
                          className="bg-slate-600 hover:bg-slate-700 text-white"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => handleSavePlantilla(editingCardId)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Guardar Plantilla
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
