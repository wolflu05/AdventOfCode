/* Usual execution time: ~55s */

Int char = 1
Int is_next = 0

Int tmp1 = 0
Int tmp2 = 0
Int tmp3 = 0

Int current_hash = 0

IntList<6> p1 = [0,0,0,0,0,0]
Int p1_tmp = 0

while(char) {
  char = 0
  input(char)

  is_next = 0
  if((char == 44)) { is_next = 1 }
  if((char == 0)) { is_next = 1 }

  if(is_next) { /* , */
    tmp1 = (current_hash / 100)
    tmp2 = 0
    tmp3 = 0
    if ((tmp1 > 0)) { tmp3=tmp1 tmp1 = (current_hash - (tmp1*100)) } else { tmp1 = current_hash }
    tmp2 = (tmp1 / 10)
    if ((tmp2 > 0)) { tmp1 = (tmp1 - (tmp2*10)) }

    p1_tmp = (p1[5] + tmp1)
    if((p1_tmp>9)) { p1[5] = (p1_tmp - 10) p1_tmp = 1 } else { p1[5] = p1_tmp p1_tmp = 0 }
    
    p1_tmp = (p1_tmp + (p1[4] + tmp2))
    if((p1_tmp>9)) { p1[4] = (p1_tmp - 10) p1_tmp = 1 } else { p1[4] = p1_tmp p1_tmp = 0 }
    
    p1_tmp = (p1_tmp + (p1[3] + tmp3))
    if((p1_tmp>9)) { p1[3] = (p1_tmp - 10) p1_tmp = 1 } else { p1[3] = p1_tmp p1_tmp = 0 }

    p1_tmp = (p1_tmp + p1[2])
    if((p1_tmp>9)) { p1[2] = (p1_tmp - 10) p1_tmp = 1 } else { p1[2] = p1_tmp p1_tmp = 0 }

    p1_tmp = (p1_tmp + p1[1])
    if((p1_tmp>9)) { p1[1] = (p1_tmp - 10) p1_tmp = 1 } else { p1[1] = p1_tmp p1_tmp = 0 }

    p1[0] = (p1_tmp + p1[0])

    current_hash = 0
  } else {
    if((char != 10)) {
      current_hash = ((current_hash + char) * 17)
    }
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
