import itertools
from lib import *

inp = get_input(split_sections=True)

L = set()
K = set()

def parse(ch, grid):
    res = []

    for r in rotate_right(grid):
        i = 0
        for c in r:
            if c != ch:
                break
            i += 1
        res.append(i)
    
    return res


for l in inp:
    s = None

    if l[0] == "#####":
        L.add(tuple(6-i for i in parse(".", l)))
    elif l[0] == ".....":
        K.add(tuple(i-1 for i in parse("#", l)))

p1=0
for l, k in itertools.product(L, K):
    for a,b in zip(l,k):
        if a + b > 5:
            break
    else:
        p1 += 1

print(p1)
print("-")
