type RangoHorario = { apertura: string; cierre: string };
type HorariosDia = RangoHorario[] | null; // null = cerrado

const horarios: Record<number, HorariosDia> = {
  0: [
    { apertura: "12:05", cierre: "15:30" },
    { apertura: "20:05", cierre: "23:30" },
  ],
  1: [
    { apertura: "12:05", cierre: "15:30" },
    { apertura: "20:05", cierre: "23:30" },
  ],
  2: [
    { apertura: "12:05", cierre: "15:30" },
    { apertura: "20:05", cierre: "23:30" },
  ],
  3: [
    { apertura: "12:05", cierre: "15:30" },
    { apertura: "20:05", cierre: "23:30" },
  ],
  4: [
    { apertura: "12:05", cierre: "15:30" },
    { apertura: "20:05", cierre: "23:30" },
  ],
  5: [
    { apertura: "12:05", cierre: "15:30" },
    { apertura: "20:05", cierre: "23:30" },
  ],
  6: [
    { apertura: "12:05", cierre: "15:30" },
    { apertura: "20:05", cierre: "23:30" },
  ],
};

function estaDentroDeRango(ahora: Date, rango: RangoHorario): boolean {
  const [hA, mA] = rango.apertura.split(":").map(Number);
  const [hC, mC] = rango.cierre.split(":").map(Number);

  const apertura = new Date(ahora);
  apertura.setHours(hA, mA, 0, 0);

  const cierre = new Date(ahora);
  cierre.setHours(hC, mC, 0, 0);

  // Si cierra "antes" que abre, cruza medianoche
  if (cierre <= apertura) {
    cierre.setDate(cierre.getDate() + 1);
  }

  return ahora >= apertura && ahora <= cierre; // inclusive (igual que tu lógica)
}

const checkIsOpen = (): boolean => {
  const ahora = new Date();
  const dia = ahora.getDay(); // 0=Domingo, 6=Sábado
  const rangos = horarios[dia];

  if (!rangos || rangos.length === 0) return false;

  return rangos.some((r) => estaDentroDeRango(ahora, r));
};

export default checkIsOpen;
