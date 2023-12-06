import fetch from 'node-fetch';
import chalk from "chalk";
import { parse, HTMLElement } from 'node-html-parser'
import { baseUrl, sessionCookie } from './constants';
import { getTimeString, throwError } from './utils';

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

export const getAocPuzzleInput = async (year: number, day: number) => {
  checkPuzzleAvailable(year, day);

  const url = `${baseUrl}/${year}/day/${day}/input`;

  return fetch(url, { headers: getHeaders() }).then(async (res: any) => {
    if (!res.ok) throwError(`Server returned status code ${res.status} while downloading the input.\n${await res.text()}`);
    return res.text();
  });
};

export const getAocPuzzlePage = async (year: number, day: number) => {
  checkPuzzleAvailable(year, day);

  const url = `${baseUrl}/${year}/day/${day}`;
  const html = await fetch(url, { headers: getHeaders() }).then(res => res.text());

  return parse(html, { blockTextElements: { code: true } });
};

export const getAocPuzzleName = (root: HTMLElement): null | string => {
  try {
    const name = root.querySelector("h2");
    const nameMatch = name?.innerText.match(/--- Day \d+: (.*) ---/);

    return nameMatch?.[1] || null;
  } catch (err) {
    console.log(chalk.red("Error:"), err)
    return null
  }
}

export const getAocExample = (root: HTMLElement): null | string => {
  try {
    const pres = root.querySelectorAll("pre");

    for (const pre of pres) {
      if (pre.previousElementSibling.innerText.trim() === "For example") {
        return pre.firstChild.innerText;
      }
    }

    if (pres.length > 0) {
      return pres[0].firstChild.innerText;
    }
  } catch (err) {
    console.log(chalk.red("Error:"), err)
  }

  return null;
}
