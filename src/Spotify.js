import { DurableObject } from "cloudflare:workers";

export class Spotify extends DurableObject {
  constructor(state, env) {
    super(state, env);
    this.env = env;
    this.state = state;
  }

  async generateToken() {
    const id = this.env?.SPOTIFY_CLIENT_ID;
    const secret = this.env?.SPOTIFY_CLIENT_SECRET;
    if (!id || !secret) throw new Error('Missing Spotify credentials in env');

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: "grant_type=client_credentials&client_id=" + id + "&client_secret=" + secret
    });
    const data = await res.json();
    return {
      access_token: data.access_token,
      expirationDate: Date.now() + data.expires_in * 1000 - 180000 // 3 minutes before actual expiration,
    };
  }

  async search(query, page = "1") {
    // prevent regeretating token on each request
    let token = await this.state.storage.get('spotify_token');
    if (!token || token.expirationDate < Date.now()) {
      const newToken = await this.generateToken();
      await this.state.storage.put('spotify_token', newToken);
      token = newToken;
    }
    const accessToken = token.access_token;

    const offset = (parseInt(page) - 1) * 10;
    const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10&offset=${offset}`, { //normalement on a pas besoin d'encodeURIComponent ici
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const data = await res.json();
    return data;
  }
}
