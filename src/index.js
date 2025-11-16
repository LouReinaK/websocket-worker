import { Room } from "./Room.js";

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);

    console.log(`Incoming request: ${req.method} ${url.pathname}`);

    // route création de room
    if (url.pathname === "/create-room") {
      const roomId = crypto.randomUUID();
      const id = env.ROOM.idFromName(roomId);
      const room = env.ROOM.get(id);

      console.log("Creating new room " + roomId);
      return new Response(JSON.stringify({ roomId }), {
        status: 200,
        headers: { "Content-Type": "application/json",
          ...corsHeaders()
         }
      });
    }

    // route websocket MJ -> room
    if (url.pathname.startsWith("/rooms/") && req.headers.get("Upgrade") === "websocket") {
      console.log("WebSocket connection to room " + url.pathname.split("/")[2]);
      const roomId = url.pathname.split("/")[2];
      const id = env.ROOM.idFromName(roomId);
      const room = env.ROOM.get(id);
      return room.fetch(req);
    }

    // route POST joueur -> room
    if (req.method === "POST" && url.pathname.endsWith("/add-song")) {
      console.log("POST add-song to room " + url.pathname.split("/")[2]);
      const roomId = url.pathname.split("/")[2];
      const id = env.ROOM.idFromName(roomId);
      const room = env.ROOM.get(id);
      return room.fetch(req);
    }

    console.log("Route not found");
    return new Response("Not found", { status: 404 });
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

export { Room };