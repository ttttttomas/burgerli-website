import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var _redis: Redis | undefined;
}

export function getRedis(): Redis {
  if (!global._redis) {
    const url = process.env.REDIS_URL ?? "redis://127.0.0.1:6379/0";
    global._redis = new Redis(url, {
      enableAutoPipelining: true,
      // si tu proveedor es TLS (Upstash/Redis Cloud con rediss://), esto activa TLS:
      tls: url.startsWith("rediss://") ? {} : undefined,
      // mientras debugueás, permití más reintentos o desactivalo:
      // maxRetriesPerRequest: null, // <- opcional mientras probás
      retryStrategy: (times) => Math.min(times * 200, 2000),
      family: 4, // fuerza IPv4
    });
    global._redis.on("ready", () => console.log("[redis] ready", url));
    global._redis.on("error", (e) => console.error("[redis] error:", e?.message));
  }
  return global._redis;
}
