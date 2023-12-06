import fetch from 'node-fetch';
import { baseUrl, sessionCookie } from './constants';
import { getTimeString, throwError } from './utils'

export const getHeaders = () => {
  return {
    Cookie: `session=${sessionCookie}`,
  };
}

export const checkPuzzleAvailable = (year: number, day: number): never | void => {
  const date = new Date(year, 11, day, 5, 0, 0, 0);
  if (date > new Date()) {
    const diff = date.getTime() - new Date().getTime();
    return throwError(
      `This puzzle is not yet available! Starts in ${getTimeString(diff)}.`
    );
  }

  return;
}

export const fetchInput = async (year: number, day: number) => {
  checkPuzzleAvailable(year, day);

  const url = `${baseUrl}/${year}/day/${day}/input`;

  return fetch(url, { headers: getHeaders() }).then(async (res: any) => {
    if (!res.ok) throwError(`Server returned status code ${res.status} while downloading the input.\n${await res.text()}`);
    return res.text();
  });
};

export const getAocPuzzleName = async (year: number, day: number) => {
  checkPuzzleAvailable(year, day);

  const url = `${baseUrl}/${year}/day/${day}`;

  const html = await fetch(url).then(res => res.text());

  const nameMatch = html.match(/<h2>--- Day \d+: (.*) ---<\/h2>/);

  return nameMatch?.[1] || null;
};
