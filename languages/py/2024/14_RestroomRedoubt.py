import collections, functools, numpy
from lib import *

inp = get_input()

R = {}

for i,l in enumerate(inp):
    R[i] = [int(y) for x in l.split(" ") for y in x.split("=")[1].split(",")]

H,W = (7,11) if IS_EXAMPLE else (103,101)
MW, MH = W//2, H//2

def safety_factor(C):
    Q = [0,0,0,0]
    for (y,x),c in C.items():
        if y < MH and x < MW:
            Q[0] += c
        elif y < MH and x > MW:
            Q[1] += c
        elif y > MH and x < MW:
            Q[2] += c
        elif y > MH and x > MW:
            Q[3] += c

    return functools.reduce(int.__mul__, Q)

VAR = {}
for t in range(1,max(W*H, 100)+1):
    C = collections.Counter()

    for i, (px,py,vx,vy) in R.items():
        py = (py + vy) % H
        px = (px + vx) % W
        R[i] = (px,py,vx,vy)
        C[py,px] += 1

    if t == 100:
        print(safety_factor(C))

    VAR[t] = functools.reduce(numpy.add, numpy.std(list(C.keys()), axis=0))

# lowest standard derivation should be the time where the tree is visible
print(min(VAR.items(), key=lambda x: x[1])[0])
