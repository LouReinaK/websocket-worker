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
    if (request.method === "POST" && url.pathname.endsWith("/add-song")) {
      const song = await request.json();

      if (this.mjSocket) {
        this.mjSocket.send(song);
      }

      return new Response("OK");
    }

    return new Response("Durable Object ready.", { status: 200 });
  }
}
