import re
from lib import *

inp = "".join(get_input())

p1 = 0
p2 = 0
p2_active = True

for i,_,a,b in re.findall(r"(mul|don't|do)\(((\d+),(\d+)|)\)", inp):
    if i == "mul":
        r = int(a) * int(b)
        p1 += r

        if p2_active:
            p2 += r

    if i == "don't":
        p2_active = False
    if i == "do":
        p2_active = True

print(p1)
print(p2)
