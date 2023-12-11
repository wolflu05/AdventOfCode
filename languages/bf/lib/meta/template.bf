/* Usual execution time: ~TTs */

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
