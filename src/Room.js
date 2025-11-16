export class Room {
  constructor(state, env) {
    this.state = state;
    this.env = env;

    // stockage en mémoire (recréé si idle)
    this.hostSocket = null;
  }

  async fetch(request) {
    const upgrade = request.headers.get("Upgrade");

    // WebSocket connection
    if (upgrade === "websocket") {
      const { 0: client, 1: server } = Object.values(new WebSocketPair());
      server.accept();
      this.hostSocket = server;

      server.addEventListener("close", () => {
        this.hostSocket = null;
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    // route POST joueur -> room
    if (request.method === "POST") {
      const song = await request.json();
      console.log("Received song to add:", song);

      if (this.hostSocket) {
        console.log("Sending song to MJ:", song);
        this.hostSocket.send(JSON.stringify(song));
      } else {
        console.log("No MJ socket connected to receive the song.");
      }

      return new Response("OK", { status: 200, headers: corsHeaders() });
    }

    return new Response("Durable Object ready.", { status: 200 });
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
