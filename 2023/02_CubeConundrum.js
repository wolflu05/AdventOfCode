import chalk from 'chalk';
import { textToArray } from '../util/util.js';


const part1 = (list) => {
  const res = list.reduce((acc, [id, colors]) => {
    if (colors["red"] <= 12 && colors["green"] <= 13 && colors["blue"] <= 14) {
      return acc + id;
    }
    return acc;
  }, 0);

  return res;
};

const part2 = (list) => {
  const res = list.reduce((acc, [, colors]) => {
    return acc + (colors["red"] * colors["green"] * colors["blue"]);
  }, 0);

  return res;
};

export default async ({ input }) => {
  const list = textToArray(input);

  const parsed = list.map(l => {
    const [game, sets] = l.split(":");
    const [, i] = game.split(" ");

    const colors = sets
      .split(/,|;/)
      .map(f => f.trim().split(" "))
      .reduce((colors, [a, color]) => {
        if (!(color in colors)) colors[color] = [];
        colors[color].push(parseInt(a));
        return colors;
      }, {});

    const maxColors = Object.fromEntries(Object.entries(colors).map(([c, v]) => [c, Math.max(...v)]));

    return [parseInt(i), maxColors];
  });

  return {
    part1: async () => part1(parsed),
    part2: async () => part2(parsed),
  };
};
