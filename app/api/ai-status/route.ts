import { env } from 'cloudflare:workers';
import { json, ready } from '../../../lib/gemini.mjs';
export async function GET() { return json({ready:ready(env),provider:'Gemini',dailyCap:50,minuteCap:5}); }
