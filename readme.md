# WebSocket Worker for BlindTestMaker
Cloudflare worker used to create a room, then send the songs chosen by the players to the host via a web socket

## Routes
Host --[HTTP]--> Worker --> (binding) Durable Object (Room)  
Player --[HTTP]--> Worker --[WS]--> Host

## Deployement URL
https://websocket-worker.loumarv.workers.dev

## How to run localy
run
```bash
wrangler dev
```

It will provide a url link (usually http://127.0.0.1:8787/)  

### Overwrite URLS
In the target projet, overwrite the values of **WORKER_URL** and **WEBSOCKET_URL** for `http://127.0.0.1:8787/` and `ws://127.0.0.1:8787/` in **config.ts**

Note that we are only able to use HTTP and WS instead of HTTPS and WSS  
Therefore a few more changes must be done to allow the connection

### Force HTTP connection  
In the target projet, add this line to **vite.config.js** :
```js
server: {
    https: false,
  }
```

### Modifier l'entête des réponses
To allow cross-origin requests, you must add the CORS header Access-Control-Allow-Origin.  
In this projet, go to **index.js** and **Room.js** and add to every `return new Response("Server response")` the following as the second parameter :
```js
{
    status: 200,
    headers: { "Content-Type": "application/json",
          ...corsHeaders()
         }
}
```

NB : corsHeaders is defined as the following :
```js
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
```