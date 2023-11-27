import { config } from 'dotenv';
config();

export const baseUrl = 'https://adventofcode.com';
export const sessionCookie = process.env.SESSIONCOOKIE;
export const debug = process.env.DEBUG === 'true';
