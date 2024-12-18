import collections
from lib import *

inp = get_input()

SIZE,P1_BYTES = (6,12) if IS_EXAMPLE else (70,1024)

def find(G):
    SEEN = set()
    Q = collections.deque([(0,0,0)])

    while Q:
        y,x,d = Q.popleft()

        if (y,x) in SEEN:
            continue
        SEEN.add((y,x))

        if (y,x) == (SIZE,SIZE):
            return d

        for yy,xx in iterate_positions(y,x, get_positions(diagonal=False)):
            if yy < 0 or xx < 0 or yy > SIZE or xx > SIZE:
                continue

            if (yy,xx) in G:
                continue

            Q.append((yy,xx,d+1))

    return False

coords = []
for l in inp:
    x,y = [int(x) for x in l.split(",")]
    coords.append((y,x))

G = set(coords[:P1_BYTES])
print(find(G))

for y,x in coords[P1_BYTES:]:
    G.add((y,x))

    if find(G) is False:
        print(f"{x},{y}")
        break
