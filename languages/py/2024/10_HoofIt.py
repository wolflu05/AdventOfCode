import sys, collections, re, itertools, functools, math
from lib import *

inp = get_input()

S = set()

for y, row in enumerate(inp):
    for x, col in enumerate(row):
        if col == "0":
            S.add((y,x, int(col)))

p1 = 0
p2 = 0

for s in S:
    Q=[s]
    P1 = set()
    while Q:
        y,x,h = Q.pop(0)

        if h == 9:
            P1.add((y,x))
            p2 += 1
            continue

        for yy,xx in iterate_positions(y,x, get_positions(diagonal=False), inp):
            if inp[yy][xx] != "." and int(inp[yy][xx]) == h + 1:
                Q.append((yy,xx,int(inp[yy][xx])))

    p1 += len(P1)

print(p1)
print(p2)
