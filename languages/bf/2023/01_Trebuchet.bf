/* Usual execution time: ~10s */

Int char = 1

Int left_not_found = 1
Int tmp_num = 0
Int left_num = 0
Int right_num = 0

IntList<6> p1 = [0,0,0,0,0,0]
Int p1_tmp = 0

while(char) {
  char = 0
  input(char)

  if((char >= 48)) { /* check if char is a digit */
    if((char <= 57)) {
      tmp_num = (char - 48)

      if(left_not_found) {
        left_num = tmp_num
        left_not_found = 0
      }
      right_num = tmp_num
    }
  }

  if((char == 10)) { /* new line */
    /* add line value to p1 sum */  
    p1_tmp = (p1[5] + right_num)
    if((p1_tmp>9)) { p1[5] = (p1_tmp - 10) p1_tmp = 1 } else { p1[5] = p1_tmp p1_tmp = 0 }
    
    p1_tmp = (p1_tmp + (p1[4] + left_num))
    if((p1_tmp>9)) { p1[4] = (p1_tmp - 10) p1_tmp = 1 } else { p1[4] = p1_tmp p1_tmp = 0 }
    
    p1_tmp = (p1_tmp + p1[3])
    if((p1_tmp>9)) { p1[3] = (p1_tmp - 10) p1_tmp = 1 } else { p1[3] = p1_tmp p1_tmp = 0 }

    p1_tmp = (p1_tmp + p1[2])
    if((p1_tmp>9)) { p1[2] = (p1_tmp - 10) p1_tmp = 1 } else { p1[2] = p1_tmp p1_tmp = 0 }

    p1_tmp = (p1_tmp + p1[1])
    if((p1_tmp>9)) { p1[1] = (p1_tmp - 10) p1_tmp = 1 } else { p1[1] = p1_tmp p1_tmp = 0 }

    p1[0] = (p1_tmp + p1[0])

    /* reset line states */
    left_not_found = 1
    tmp_num = 0
    left_num = 0
    right_num = 0
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
