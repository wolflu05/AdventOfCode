import itertools
from lib import *

inp = get_input()

gals_list = []
for y in range(len(inp)):
    for x in range(len(inp[y])):
        if inp[y][x] == "#":
            gals_list.append((y,x))

def solve(ef):
    ef -= 1
    galaxies = [g for g in gals_list]

    # shift all y expansions
    y_offset = 0
    for y,l in enumerate(inp):
        if all(g == "." for g in l):
            for gi, (gy,gx) in enumerate(galaxies):
                if gy > y+y_offset:
                    galaxies[gi] = (gy+ef, gx)
            y_offset += ef

    # shift all x expansions
    x_offset = 0
    for x,c in enumerate(zip(*inp)):
        if all(g == "." for g in c):
            for gi, (gy,gx) in enumerate(galaxies):
                if gx > x+x_offset:
                    galaxies[gi] = (gy, gx+ef)
            x_offset += ef

    # calculate manhattan distance for all combinations
    distances = []
    for a,b in itertools.combinations(galaxies, r=2):
        distances.append(abs(a[0]-b[0]) + abs(a[1]-b[1]))

    print(sum(distances))

solve(2)
solve(1000000)
