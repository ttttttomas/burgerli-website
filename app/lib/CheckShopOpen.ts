type RangoHorario = { apertura: string; cierre: string };
type HorariosDia = RangoHorario[] | null; // null = cerrado

const horarios: Record<number, HorariosDia> = {
  0: [
    { apertura: "12:05", cierre: "03:30" },
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
    { apertura: "20:05", cierre: "03:00" },
  ],
  6: [
    { apertura: "12:05", cierre: "03:30" },
    { apertura: "20:05", cierre: "03:00" },
  ],
};

function estaDentroDeRango(ahora: Date, rango: RangoHorario, baseDate: Date = ahora): boolean {
  const [hA, mA] = rango.apertura.split(":").map(Number);
  const [hC, mC] = rango.cierre.split(":").map(Number);

  const apertura = new Date(baseDate);
  apertura.setHours(hA, mA, 0, 0);

  const cierre = new Date(baseDate);
  cierre.setHours(hC, mC, 0, 0);

  // Si cierra "antes" que abre, cruza medianoche
  if (cierre <= apertura) {
    cierre.setDate(cierre.getDate() + 1);
  }

  return ahora >= apertura && ahora <= cierre;
}

const checkIsOpen = (): boolean => {
  const ahora = new Date();
  const dia = ahora.getDay(); // 0=Domingo, 6=Sábado
  const rangos = horarios[dia] ?? [];

  if (rangos.length > 0 && rangos.some((r) => estaDentroDeRango(ahora, r))) {
    return true;
  }

  const diaAnterior = dia === 0 ? 6 : dia - 1;
  const rangosAnterior = horarios[diaAnterior] ?? [];

  return rangosAnterior.some((r) => {
    const [hA, mA] = r.apertura.split(":").map(Number);
    const [hC, mC] = r.cierre.split(":").map(Number);
    const apertura = new Date(ahora);
    apertura.setHours(hA, mA, 0, 0);
    const cierre = new Date(ahora);
    cierre.setHours(hC, mC, 0, 0);

    if (cierre <= apertura) {
      return estaDentroDeRango(ahora, r, new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - 1));
    }

    return false;
  });
};

export default checkIsOpen;
