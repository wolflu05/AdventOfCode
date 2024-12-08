import collections, itertools
from lib import *

inp = get_input()

A = collections.defaultdict(list)

for y, row in enumerate(inp):
    for x, col in enumerate(row):
        if col != ".":
            A[col].append((y,x))

P1 = set()
P2 = set()

def iterate_index(y,x,vy,vx,d=None):
    while d is None or d > 0:
        if d is not None:
            d -= 1
        y+= vy
        x+= vx

        if not check_index_exists(inp, y,x):
            break

        yield y,x

for an, coords in A.items():
    for (ay,ax),(by,bx) in itertools.combinations(coords, r=2):
        vy = ay-by
        vx = ax-bx

        P1.update(iterate_index(ay,ax,vy,vx,d=1))
        P1.update(iterate_index(by,bx,-vy,-vx,d=1))

        P2.add((ay,ax))
        P2.add((by,bx))
        P2.update(iterate_index(ay,ax,vy,vx))
        P2.update(iterate_index(by,bx,-vy,-vx))

print(len(P1))
print(len(P2))

# print_grid(inp, lambda x, p: "#" if p in P1 else x)
# print_grid(inp, lambda x, p: x if x != "." else ("#" if p in P2 else x))
