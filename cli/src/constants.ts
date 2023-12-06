
import path from 'path';
import { config } from 'dotenv';

const _baseFolder = path.join(__dirname, "..", "..");
config({ path: path.join(_baseFolder, ".env") });

export const baseFolder = _baseFolder;
export const baseUrl = 'https://adventofcode.com';
export const sessionCookie = process.env.SESSIONCOOKIE;
