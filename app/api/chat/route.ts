import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { handleChat } from '../../../lib/gemini.mjs';
export async function POST(request: Request) {
 const user = await getChatGPTUser();
 return handleChat(request, env, { authenticated: !!user });
}
