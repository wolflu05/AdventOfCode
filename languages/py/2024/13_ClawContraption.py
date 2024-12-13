import re
from lib import *

inp = "\n".join(get_input()).split("\n\n")

M = []
for l in inp:
    a,b,p = ((int(a), int(b)) for a,b in re.findall(r"(\d+).*?(\d+)", l))
    M.append((a,b,p))


def solve(a,b,p):
    (ax,ay), (bx,by), (px,py) = a,b,p

    # a * ax + b * bx = px
    # a * ay + b * by = py
    a = (by*px-bx*py) / (ax*by-ay*bx)
    b = (ay*px-ax*py) / (ay*bx-ax*by)

    if int(a) == a and int(b) == b:
        return int(a)*3 + int(b)

    return 0

#         p1        p2
for o in [0, 10000000000000]:
    res = 0
    for a,b,(px,py) in M:
        res += solve(a,b,(px+o,py+o))

    print(res)
