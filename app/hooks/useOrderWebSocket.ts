import { useEffect, useRef, useState, useCallback } from "react";

type OrderStatus = "confirmed" | "in_preparation" | "on_the_way" | "delivered";

interface UseOrderWebSocketReturn {
  status: OrderStatus | null;
  isConnected: boolean;
  error: string | null;
  local: string | null;
}

// Mapeo de estados del backend a estados del frontend
// const STATUS_MAP: Record<string, OrderStatus> = {
//   "confirmed": "confirmed",
//   "in_preparation": "in_preparation",
//   "on_the_way": "on_the_way",
//   "delivered": "delivered",
// };

export function useOrderWebSocket(orderId: string): UseOrderWebSocketReturn {
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [local, setLocal] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(async () => {
    try {
      // Determinar la URL del WebSocket según el entorno
      // const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL

      const ws = new WebSocket(`ws://localhost:8000/ws/orders/${orderId}`);

      // const ws = new WebSocket(
      //   `wss://api-burgerli.iwebtecnology.com/api/ws/orders/${orderId}`
      // );

      ws.onopen = () => {
        console.log("[WebSocket] Conexión establecida para orden:", orderId);
        console.log(
          "[WebSocket] URL:", ws.url
        );
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Enviar un mensaje de prueba para confirmar que la conexión está activa
        console.log("[WebSocket] Enviando mensaje de prueba...");
        try {
          ws.send(JSON.stringify({ type: "ping", order_id: orderId }));
          console.log("[WebSocket] Mensaje de prueba enviado");
        } catch (err) {
          console.error("[WebSocket] Error al enviar mensaje de prueba:", err);
        }
      };

      ws.onmessage = (event) => {
        try {
          console.log("[WebSocket] Mensaje RAW recibido:", event.data);
          const data = JSON.parse(event.data);
          console.log("[WebSocket] Mensaje parseado:", data);
          console.log("[WebSocket] Tipo de evento:", data.event);
          console.log(
            "[WebSocket] Order ID del mensaje:",
            data.order_id || data.id_order
          );
          console.log("[WebSocket] Order ID esperado:", orderId);

          // Verificar que sea el evento correcto
          // Soportar tanto order_id como id_order por compatibilidad
          const messageOrderId = data.order_id || data.id_order;

          if (data.event === "order_deleted") {
            if (messageOrderId === orderId) {
              console.log("Pedido cancelado:", messageOrderId);
      
              // marcamos el pedido como cancelado en el estado
              setStatus("cancelled" as OrderStatus);
      
              // opcional: bandera específica
              // setIsCanceled(true);
      
              // opcional: cerrar el websocket porque ya no tiene sentido seguir escuchando
              // ws.close(1000, "order deleted");
            } else {
              console.log(
                "[WebSocket] order_deleted de otra orden. Esperado:",
                orderId,
                "Recibido:",
                messageOrderId
              );
            }
            return; // ya manejamos este mensaje
          }

          if (data.event === "status_update") {
            console.log(`[WebSocket] Evento status_update detectado`);

            if (messageOrderId === orderId) {
              // El backend envía 'new_status' en lugar de 'status'
              const newStatus = data.new_status || data.status;
              console.log(
                `[WebSocket] ✅ Actualización de estado para orden ${orderId}:`,
                newStatus
              );
              console.log(`[WebSocket] 🔄 Llamando setStatus con:`, newStatus);
              setStatus(newStatus as OrderStatus);
              setLocal(data.local);
              console.log(`[WebSocket] 🔄 setStatus y setLocal ejecutados`);
            } else {
              console.log(
                `[WebSocket] ⚠️ Mensaje para otra orden. Esperado: ${orderId}, Recibido: ${messageOrderId}`
              );
            }
          } 
        } catch (err) {
          console.error("[WebSocket] ❌ Error al parsear mensaje:", err);
          console.error("[WebSocket] Datos del evento:", event.data);
        }
      };

      ws.onerror = (event) => {
        console.error("[WebSocket] Error de conexión:", event);
        setError("Error de conexión con el servidor");
      };

      ws.onclose = (event) => {
        console.log("[WebSocket] Conexión cerrada:", event.code, event.reason);
        setIsConnected(false);

        // Intentar reconectar si no fue un cierre intencional
        if (
          event.code !== 1000 &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );
          console.log(
            `[WebSocket] Reintentando conexión en ${delay}ms (intento ${
              reconnectAttemptsRef.current + 1
            }/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError("No se pudo establecer conexión después de varios intentos");
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("[WebSocket] Error al crear conexión:", err);
      setError("Error al conectar con el servidor");
    }
  }, [orderId]);

  useEffect(() => {
    // Establecer conexión al montar el componente
    connect();

    // Limpiar al desmontar
    return () => {
      console.log("[WebSocket] Limpiando conexión");

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        // Cerrar con código 1000 (cierre normal) para evitar reconexión
        wsRef.current.close(1000, "Componente desmontado");
        wsRef.current = null;
      }
    };
  }, [connect]);

  return {
    status,
    isConnected,
    error,
    local,
  };
}
