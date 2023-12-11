const fs = require("fs");

/**
 * This program doesn't need any preprocessing, the input should be the
 * complete puzzle input you get from AoC with an empty line on the end.
 * 
 * The program takes ~40s to compute the result for part 1.
 * The first line is the result for part 1, the second a "-", as part 2 is not
 * yet implemented.
 */
module.exports.getInput = (inputPath) => {
  const numbers = fs.readFileSync(inputPath, { encoding: "utf-8" });
  return numbers;
}

module.exports.code = `
IntList<10> winning_numbers = [0,0,0,0,0,0,0,0,0,0]
Int winning_num_idx = 0

Int state = 0 /* 0 - card X, 1 - collect winning numbers, 2 - collect our numbers */
Int char = 1

Int inp_num = 0
Int has_num = 0
Int is_space_or_lf = 0

IntList<3> current_matches = [0,0,0]
Int is_current_matches_not_zero = 0
Int current_matches_tmp = 0

IntList<6> p1 = [0,0,0,0,0,0]
Int p1_tmp = 0

while(char) {
  char = 0
  input(char)

  if((char == 58)) { /* : */
    state = 1
    inp_num = 0
    has_num = 0
    winning_num_idx = 0
    while((winning_num_idx < 10)) {
      winning_numbers[winning_num_idx] = 0
      winning_num_idx = (winning_num_idx + 1)
    }
    winning_num_idx = 0
  }

  if((char == 124)) { /* | */
    state = 2
    inp_num = 0
    has_num = 0
  }

  if((char >= 48)) { /* check if char is number */
    if((char <= 57)) {
      inp_num = ((inp_num * 10) + (char - 48))
      has_num = 1
    }
  }

  is_space_or_lf = 0

  if((char == 10)) { /* new line */
    is_space_or_lf = 1
  }

  if((char == 32)) { /* space */
    if(has_num) {
      if((state == 1)) {
        winning_numbers[winning_num_idx] = inp_num
        winning_num_idx = (winning_num_idx + 1)
        inp_num = 0
        has_num = 0
      }

      is_space_or_lf = 1
    }
  }

  if(is_space_or_lf) {
    if((state == 2)) {
      winning_num_idx = 0
      while((winning_num_idx < 10)) {
        if((inp_num == winning_numbers[winning_num_idx])) { /* our current number was a winning number -> count it */
          is_current_matches_not_zero = 1
          if((current_matches[0] == 0)) {
            if((current_matches[1] == 0)) {
              if((current_matches[2] == 0)) {
                current_matches[0] = 0
                current_matches[1] = 0
                current_matches[2] = 1
                is_current_matches_not_zero = 0
              }
            }
          }
          if(is_current_matches_not_zero) {
            current_matches_tmp = (current_matches[2] * 2)
            if((current_matches_tmp > 9)) { current_matches[2] = (current_matches_tmp - 10) current_matches_tmp = 1 } else { current_matches[2] = current_matches_tmp current_matches_tmp = 0 }
            
            current_matches_tmp = (current_matches_tmp + (current_matches[1] * 2))
            if((current_matches_tmp > 9)) { current_matches[1] = (current_matches_tmp - 10) current_matches_tmp = 1 } else { current_matches[1] = current_matches_tmp current_matches_tmp = 0 }
            
            current_matches[0] = (current_matches_tmp + (current_matches[0] * 2))
          }
        }
        winning_num_idx = (winning_num_idx + 1)
      }

      inp_num = 0
      has_num = 0
    }
  }

  if((char == 10)) { /* new line - reset state for next card */
    /* add current_matches to p1 result */
    p1_tmp = (p1[5] + current_matches[2])
    if((p1_tmp>9)) { p1[5] = (p1_tmp - 10) p1_tmp = 1 } else { p1[5] = p1_tmp p1_tmp = 0 }
    
    p1_tmp = (p1_tmp + (p1[4] + current_matches[1]))
    if((p1_tmp>9)) { p1[4] = (p1_tmp - 10) p1_tmp = 1 } else { p1[4] = p1_tmp p1_tmp = 0 }
    
    p1_tmp = (p1_tmp + (p1[3] + current_matches[0]))
    if((p1_tmp>9)) { p1[3] = (p1_tmp - 10) p1_tmp = 1 } else { p1[3] = p1_tmp p1_tmp = 0 }

    p1_tmp = (p1_tmp + p1[2])
    if((p1_tmp>9)) { p1[2] = (p1_tmp - 10) p1_tmp = 1 } else { p1[2] = p1_tmp p1_tmp = 0 }

    p1_tmp = (p1_tmp + p1[1])
    if((p1_tmp>9)) { p1[1] = (p1_tmp - 10) p1_tmp = 1 } else { p1[1] = p1_tmp p1_tmp = 0 }

    p1[0] = (p1_tmp + p1[0])

    /* reset current_matches */
    current_matches[0] = 0
    current_matches[1] = 0
    current_matches[2] = 0

    inp_num = 0
    has_num = 0

    state = 0
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
