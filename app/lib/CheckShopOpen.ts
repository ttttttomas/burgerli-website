type Horario = { apertura: string; cierre: string } | null;

const horarios: Record<number, Horario> = {
  0: { apertura: "10:00", cierre: "23:30" },
  1: { apertura: "10:00", cierre: "23:30" },
  2: { apertura: "10:00", cierre: "23:30" },
  3: { apertura: "10:00", cierre: "23:30" },
  4: { apertura: "10:00", cierre: "23:30" },
  5: { apertura: "10:00", cierre: "01:00" },
  6: { apertura: "10:00", cierre: "01:00" },
};
  
  const checkIsOpen = () => {
    const ahora = new Date();
    const dia = ahora.getDay(); // 0=Domingo, 6=Sábado
    const horario = horarios[dia];
    if (!horario) return false; // cerrado
  
    const [hA, mA] = horario.apertura.split(":").map(Number);
    const [hC, mC] = horario.cierre.split(":").map(Number);
  
    const apertura = new Date(ahora);
    apertura.setHours(hA, mA, 0, 0);
  
    const cierre = new Date(ahora);
    cierre.setHours(hC, mC, 0, 0);
  
    // Si cierre es "menor" que apertura, significa que pasa a día siguiente
    if (cierre <= apertura) {
      cierre.setDate(cierre.getDate() + 1);
    }
  
    return ahora >= apertura && ahora <= cierre;
  };

  export default checkIsOpen;