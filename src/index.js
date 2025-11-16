import { Room } from "./Room.js";
import { Spotify } from "./Spotify.js";

export default {
  async fetch(req, env, ctx) {
    console.log("");
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
      // Exemple de pathname : /rooms/{roomId}
      console.log("WebSocket connection to room " + url.pathname.split("/")[2]);
      const roomId = url.pathname.split("/")[2];
      const id = env.ROOM.idFromName(roomId);
      const room = env.ROOM.get(id);
      return room.fetch(req);
    }

    // route POST joueur -> room
    if (req.method === "POST" && url.pathname.endsWith("/add-song/")) {
      // Exemple de pathname : /rooms/{roomId}/add-song/
      const roomId = url.pathname.split("/")[2];
      const id = env.ROOM.idFromName(roomId);
      const room = env.ROOM.get(id);

      console.log("POST add-song to room " + roomId);
      return room.fetch(req);
    }

    // route GET joueur -> SPOTIFY search
    if (url.pathname.startsWith("/spotifySearch")) {
      // Exemple de pathname : /spotifySearch?query={query}&page={page}
      const id = env.SPOTIFY.idFromName("SPOTIFY");
      const spotify = env.SPOTIFY.get(id);

      const data = await req.json();
      const query = data.query;
      const page = data.page || "1";

      console.log("Spotify search parameters:", { query, page });
      
      const results = await spotify.search(query, page);
      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { "Content-Type": "application/json",
          ...corsHeaders()
         }
      });
    }

    // route OPTIONS for CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    console.log("Route not found");
    return new Response("Not found", { status: 404, headers: corsHeaders() });
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

export { Room, Spotify };