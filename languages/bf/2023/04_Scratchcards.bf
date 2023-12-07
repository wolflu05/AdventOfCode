const fs = require("fs");

/**
 * Perform some simple input processing to be better handled by brainfuck, that
 * function is not needed to execute the brainfuck code. You can also convert
 * the input by yourself to the format shown in the example below and provide
 * it to the brainfuck code in 04_Scratchcards.b as input. But due to a
 * limitation of braingoat this will only work with integers <= 255 and with
 * a fixed amount of winning numbers (5) and our numbers (8). But its
 * definitely the plan to get that working with the real input too.
 * Currently only part 1 is working.
 * 
 * Example:
 * Card 1: 11 | 22 33
 * Card 2: 44 | 55 66
 * 
 * Gets converted to (2 means the amount of cards following):
 * 2
 * 11
 * 22
 * 33
 * 44
 * 55
 * 66
 */
module.exports.getInput = (inputPath) => {
  const numbers = fs.readFileSync(inputPath, { encoding: "utf-8" })
    .split("\n")
    .filter(x => x)
    .map(l => l
      .replace(/Card \d+:/, "")
      .split(" | ")
      .map(p => p.split(/\W+/).filter(x => x))
    )

  return [numbers.length, ...numbers.flatMap(x => x.map(y => y.join("\n")))].join("\n");
}

module.exports.code = `
Int cards_count = 0
inputN(cards_count)

IntList<5> a = [0,0,0,0,0]
Int ai = 0
Int bi = 0
Int a2i = 0

Int current_card = 0
Int current_value = 0
Int current_matches = 0

Int sum = 0

while((current_card < cards_count)) {
  /* store all winning numbers in IntList<5> a */ 
  while((ai < 5)) {
    inputN(a[ai])
    ai = (ai + 1)
  }

  /* loop through all of the numbers we have */
  while((bi < 8)) {
    inputN(current_value)

    /* loop again thought all winning numbers and check with our current number */
    while((a2i < 5)) {
      if((current_value == a[a2i])) {
        /* we won that number, increase the current matches score */
        if((current_matches == 0)) {
          current_matches = 1
        } else {
          current_matches = (current_matches * 2)
        }
      }
      a2i = (a2i + 1)
    }
    a2i = 0
    bi = (bi + 1)
  }

  sum = (sum + current_matches)

  /* reset values */
  ai = 0
  while((ai < 5)) { a[ai] = 0 ai = (ai+1) }
  ai = 0
  bi = 0
  a2i = 0
  current_value = 0
  current_matches = 0
  current_card = (current_card + 1)
}

printN(sum)
print(10)
printN(30)
`;
