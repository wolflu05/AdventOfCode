import fetch from 'node-fetch';
import { baseUrl, sessionCookie } from './constants.js';
import { throwError } from './utils.js'

export const getHeaders = () => {
  return {
    Cookie: `session=${sessionCookie}`,
  };
}

export const fetchInput = async (year, day) => {
  const url = `${baseUrl}/${year}/day/${day}/input`;

  return fetch(url, { headers: getHeaders() }).then(async (res) => {
    if (!res.ok) throwError(`Server returned status code ${res.status} while downloading the input.\n${await res.text()}`);
    return res.text();
  });
};

export const getAocPuzzleName = async (year, day) => {
  const url = `${baseUrl}/${year}/day/${day}`;

  const html = await fetch(url).then(res => res.text());

  const nameMatch = html.match(/<h2>--- Day \d+: (.*) ---<\/h2>/);

  return nameMatch?.[1] || null;
};
