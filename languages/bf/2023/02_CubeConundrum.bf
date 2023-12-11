const fs = require("fs");

/**
 * This program doesn't need any preprocessing, the input should be the
 * complete puzzle input you get from AoC with an empty line on the end.
 * 
 * The program takes ~13s to compute the result for part 1.
 * The first line is the result for part 1, the second a "-", as part 2 is not
 * yet implemented.
 */
module.exports.getInput = (inputPath) => {
  const input = fs.readFileSync(inputPath, { encoding: "utf-8" });
  return input;
}

module.exports.code = `
/* Input state  
  0 - game id not set
  1 - getting color count
  2 - getting color first letter
*/
Int state = 0
Int char = 1

Int inp_num = 0
Int has_num = 0
Int is_space_or_lf = 0

IntList<6> p1 = [0,0,0,0,0,0]
Int p1_tmp = 0

IntList<3> curr_game_id = [0,0,0]
Int curr_game_id_idx = 0
Int curr_color_num = 0
IntList<3> max_color_counts = [0,0,0] /* r g b */
Int color_idx = 0
Int tmp_color = 0

while(char) {
  char = 0
  input(char)

  if((char >= 48)) { /* check if char is a digit */
    if((char <= 57)) {
      if((state == 0)) {
        if((curr_game_id_idx <= 2)) {
          curr_game_id[curr_game_id_idx] = (char - 48)
          curr_game_id_idx = (curr_game_id_idx + 1)
        }
      } else {
        inp_num = ((inp_num * 10) + (char - 48))
        has_num = 1
      }
    }
  }
  
  if((state == 2)) {
    color_idx = 4 /* not a valid idx, used to check later if modified */
    if((char == 114)) { color_idx = 0 tmp_color = max_color_counts[0] } /* r */
    if((char == 103)) { color_idx = 1 tmp_color = max_color_counts[1] } /* g */
    if((char == 98))  { color_idx = 2 tmp_color = max_color_counts[2] } /* b */

    if((color_idx != 4)) {
      if((tmp_color < curr_color_num)) {
        max_color_counts[color_idx] = curr_color_num
      }
      state = 1
    }
  }

  if((char == 58)) { /* : */
    state = 1

    if((curr_game_id_idx == 1)) {
      /* shift two to right -> override last with first, as middle is not used */
      curr_game_id[2] = curr_game_id[0]
      curr_game_id[1] = 0
      curr_game_id[0] = 0
    }
    if((curr_game_id_idx == 2)) {
      /* shift one to right */
      curr_game_id[2] = curr_game_id[1]
      curr_game_id[1] = curr_game_id[0]
      curr_game_id[0] = 0
    }

    inp_num = 0
    has_num = 0
  }

  is_space_or_lf = 0
  if((char == 10)) { is_space_or_lf = 1 } /* new line */ 
  if((char == 32)) { is_space_or_lf = 1 } /* space */ 
  if(is_space_or_lf) {
    if((state == 1)) {
      if(has_num) {
        curr_color_num = inp_num
        state = 2
        inp_num = 0
        has_num = 0
      }
    }
  }

  if((char == 10)) { /* new line - check if game is possible and reset states */
    if((max_color_counts[0] <= 12)) {
      if((max_color_counts[1] <= 13)) {
        if((max_color_counts[2] <= 14)) { /* check if game is possible*/
          p1_tmp = (p1[5] + curr_game_id[2])
          if((p1_tmp>9)) { p1[5] = (p1_tmp - 10) p1_tmp = 1 } else { p1[5] = p1_tmp p1_tmp = 0 }
          
          p1_tmp = (p1_tmp + (p1[4] + curr_game_id[1]))
          if((p1_tmp>9)) { p1[4] = (p1_tmp - 10) p1_tmp = 1 } else { p1[4] = p1_tmp p1_tmp = 0 }
          
          p1_tmp = (p1_tmp + (p1[3] + curr_game_id[0]))
          if((p1_tmp>9)) { p1[3] = (p1_tmp - 10) p1_tmp = 1 } else { p1[3] = p1_tmp p1_tmp = 0 }
      
          p1_tmp = (p1_tmp + p1[2])
          if((p1_tmp>9)) { p1[2] = (p1_tmp - 10) p1_tmp = 1 } else { p1[2] = p1_tmp p1_tmp = 0 }
      
          p1_tmp = (p1_tmp + p1[1])
          if((p1_tmp>9)) { p1[1] = (p1_tmp - 10) p1_tmp = 1 } else { p1[1] = p1_tmp p1_tmp = 0 }
      
          p1[0] = (p1_tmp + p1[0])
        }
      }
    }

    max_color_counts[0] = 0
    max_color_counts[1] = 0
    max_color_counts[2] = 0
    state = 0
    curr_game_id_idx = 0
    curr_game_id[0] = 0
    curr_game_id[1] = 0
    curr_game_id[2] = 0
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
