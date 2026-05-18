type RangoHorario = {
  apertura: string;
  cierre: string;
};

type HorariosDia = RangoHorario[] | null;

type HorariosPorDia = Record<number, HorariosDia>;

type LocalResponse = {
  id: string;
  name: string;
  is_open: number;
  opening_hours: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://burgerli.com.ar/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Burgerli/api';


function parseHorarios(openingHours: string): HorariosPorDia {
  try {
    return JSON.parse(openingHours) as HorariosPorDia;
  } catch {
    return {};
  }
}

function estaDentroDeRango(
  ahora: Date,
  rango: RangoHorario,
  baseDate: Date = ahora
): boolean {
  const [hA, mA] = rango.apertura.split(":").map(Number);
  const [hC, mC] = rango.cierre.split(":").map(Number);

  const apertura = new Date(baseDate);
  apertura.setHours(hA, mA, 0, 0);

  const cierre = new Date(baseDate);
  cierre.setHours(hC, mC, 0, 0);

  // Si el cierre es menor o igual a la apertura,
  // significa que el rango cruza medianoche.
  // Ej: 20:00 a 03:00
  if (cierre <= apertura) {
    cierre.setDate(cierre.getDate() + 1);
  }

  return ahora >= apertura && ahora <= cierre;
}

function checkIsOpenByHorarios(horarios: HorariosPorDia): boolean {
  const ahora = new Date();
  const dia = ahora.getDay(); // 0 = Domingo, 6 = Sábado

  const rangosHoy = horarios[dia] ?? [];

  if (
    rangosHoy.length > 0 &&
    rangosHoy.some((rango) => estaDentroDeRango(ahora, rango))
  ) {
    return true;
  }

  // Revisa el día anterior por si el horario cruzó medianoche.
  // Ej: sábado 20:00 a domingo 03:00
  const diaAnterior = dia === 0 ? 6 : dia - 1;
  const rangosAyer = horarios[diaAnterior] ?? [];

  return rangosAyer.some((rango) => {
    const [hA, mA] = rango.apertura.split(":").map(Number);
    const [hC, mC] = rango.cierre.split(":").map(Number);

    const apertura = new Date(ahora);
    apertura.setHours(hA, mA, 0, 0);

    const cierre = new Date(ahora);
    cierre.setHours(hC, mC, 0, 0);

    const cruzaMedianoche = cierre <= apertura;

    if (!cruzaMedianoche) {
      return false;
    }

    const ayer = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate() - 1
    );

    return estaDentroDeRango(ahora, rango, ayer);
  });
}

async function getLocalByName(localName: string): Promise<LocalResponse | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/getLocal/${encodeURIComponent(localName)}`
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as LocalResponse;
  } catch {
    return null;
  }
}

export async function checkShopIsOpen(localName: string): Promise<boolean> {
  const local = await getLocalByName(localName);

  if (!local) {
    return false;
  }

  if (local.is_open !== 1) {
    return false;
  }

  const horarios = parseHorarios(local.opening_hours);

  return checkIsOpenByHorarios(horarios);
}

export default checkShopIsOpen;