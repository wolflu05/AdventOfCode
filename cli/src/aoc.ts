import fetch from 'node-fetch';
import { baseUrl, sessionCookie } from './constants';
import { getTimeString, throwError } from './utils'

export const getHeaders = () => {
  return {
    Cookie: `session=${sessionCookie}`,
  };
}

export const hasPuzzleStarted = (year: number, day: number) => {
  const startDate = new Date(year, 11, day, 6, 0, 0, 0);
  const currentDate = new Date();
  const diff = startDate.getTime() - currentDate.getTime() + 1000;
  if (diff > 0) {
    return diff;
  }

  return true;
}

export const checkPuzzleAvailable = (year: number, day: number): never | void => {
  const hasStarted = hasPuzzleStarted(year, day);
  if (hasStarted !== true) {
    return throwError(
      `This puzzle is not yet available! Starts in ${getTimeString(hasStarted)}.`
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
