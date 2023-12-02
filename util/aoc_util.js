import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import chalk from 'chalk';
import { baseUrl, sessionCookie } from './constants.js';

/**
 * Fetch the input from the aoc server
 * @param {Number} year
 * @param {Number} day
 * @returns {String} input for the specified year/day
 */

export const fetchInput = async (year, day) => {
    const url = `${baseUrl}/${year}/day/${day}/input`;

    return await (
        await fetch(url, {
            headers: {
                Cookie: `session=${sessionCookie}`,
            },
        })
    ).text();
};
/**
 * Get the input path for a specified day
 * @param {Number} year
 * @param {Number} day
 * @param {Boolean} example
 * @returns
 */

export function getInputFilePath(year, day, example) {
    const p = path.resolve('.input', `${year}`);
    const filePath = path.resolve(
        p,
        `${example ? `${day}_example` : day}` + '.txt'
    );
    return filePath;
}
/**
 * Get the input by either fetching them or returning the locally cached copy
 * @param {Number} year
 * @param {Number} day
 * @param {Boolean} cache use cache
 * @param {Boolean} check check if this challenge is already available
 * @param {Boolean} example use the _example suffixed input file
 * @returns
 */

export const getInput = async (year, day, cache = true, check = true, example = false) => {
    if (check) {
        const date = new Date(year, 11, day, 5, 0, 0, 0);
        if (date > new Date()) {
            const diff = date - new Date();
            throw new Error(
                `this challenge is not yet available! Starts in ${getTimeString(diff)}h`
            );
        }
    }

    const filePath = getInputFilePath(year, day, example);

    if (cache && fs.existsSync(filePath)) {
        return await fs.promises.readFile(filePath, 'utf-8');
    }

    const input = await fetchInput(year, day);

    console.log(
        `\n${chalk.green('✔')} Downloaded input file for year ${year}/${day}.`
    );

    const p = path.dirname(filePath);
    if (!fs.existsSync(p)) {
        await fs.promises.mkdir(p, { recursive: true });
    }

    await fs.promises.writeFile(filePath, input);

    return input;
};
/**
 * Format a time in ms to a string hh:mm:ss
 * @param {Number} timeInMs time in ms
 * @param {String} delimiter time separator (default: ":")
 * @returns {String} hh:mm:ss
 */

export const getTimeString = (timeInMs, delimiter = ':') => {
    let hours = Math.ceil((timeInMs / (1000 * 60 * 60)) % 60);
    let minutes = Math.floor((timeInMs / (1000 * 60)) % 60);
    let seconds = Math.floor((timeInMs / 1000) % 60);

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return [hours, minutes, seconds].join(delimiter);
};
