const fs = require("fs");

/**
 * This program doesn't need any preprocessing, the input should be the
 * complete puzzle input you get from AoC with an empty line on the end.
 * 
 * The program takes ~TTs to compute the result for part 1.
 * The first line is the result for part 1, the second a "-", as part 2 is not
 * yet implemented.
 */
module.exports.getInput = (inputPath) => {
  const input = fs.readFileSync(inputPath, { encoding: "utf-8" });
  return input;
}

module.exports.code = `
Int state = 0 /* 0 - XXX, 1 - YYY, 2 - ZZZ */
Int char = 1
Int is_space_or_lf = 0

IntList<6> p1 = [0,0,0,0,0,0]
Int p1_tmp = 0

while(char) {
  char = 0
  input(char)

  if((char >= 48)) { /* check if char is a digit */
    if((char <= 57)) {
        char = (char - 48)
        /* char is a digit */
    }
  }

  if((char >= 65)) { /* check if char is an uppercase letter */
    if((char <= 90)) {
      /* char is an uppercase letter */
    }
  }

  if((char >= 97)) { /* check if char is a lowercase letter */
    if((char <= 122)) {
      /* char is a lowercase letter */
    }
  }


  is_space_or_lf = 0

  if((char == 10)) { /* new line */
    is_space_or_lf = 1
  }

  if((char == 32)) { /* space */
    is_space_or_lf = 1
  }

  if(is_space_or_lf) {
    
  }
}

Int has_started = 0
Int num = 0
for (num, p1) {
  if(num) {
    has_started = 1
  }

  if(has_started) {
    printN(num)
  }
}
print(10)
print(45)
`;
