// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();

//     const url = `http://localhost:8000/createOrder`;
//     const upstream = await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//       // nada de credentials en server
//     });

//     const text = await upstream.text(); // <- nunca rompe aunque no sea JSON
//     const ct = upstream.headers.get("content-type") ?? "application/json";

//     // LOG útil en server (ver terminal de Next)
//     console.log(
//       "[CashPayment] upstream",
//       upstream.status,
//       url,
//       "body:",
//       body,
//       "resp:",
//       text,
//     );

//     return new NextResponse(text, {
//       status: upstream.status,
//       headers: { "content-type": ct },
//     });
//   } catch (e: any) {
//     console.error("[CashPayment] ERROR:", e?.stack || e);
//     return NextResponse.json(
//       { error: "proxy-failed", detail: String(e?.message ?? e) },
//       { status: 500 },
//     );
//   }
// }
