import collections
from lib import *

G = get_input()

sy,sx = find_grid(G, "S")
ey,ex = find_grid(G, "E")

def get_end_map():
    Q = collections.deque([(ey,ex,0)])
    SEEN = set()
    DIST = collections.defaultdict(lambda: float("inf"))

    while Q:
        y,x,d = Q.popleft()

        if (y,x) in SEEN:
            continue
        SEEN.add((y,x))
        if G[y][x] == "#":
            continue

        DIST[y,x] = d

        for yy,xx in iterate_positions(y,x, get_positions(diagonal=False), G):
            Q.append((yy,xx,d+1))

    return DIST

def find_path(sy,sx):
    SEEN = set()
    Q = collections.deque([(sy,sx,0,[])])

    while Q:
        y,x,d,path = Q.popleft()

        if (y,x) in SEEN:
            continue
        SEEN.add((y,x))
        path.append((y,x))

        if (y,x) == (ey,ex):
            return d, path

        for yy,xx in iterate_positions(y,x, get_positions(diagonal=False), G):
            if G[y][x] == "#":
                continue

            Q.append((yy,xx,d+1,list(path)))

def find_cheats(sy,sx,max_cheat):
    Q = collections.deque([(sy,sx,0)])
    SEEN = set()
    res = collections.defaultdict(set)

    while Q:
        y,x,d = Q.popleft()

        if (y,x) in SEEN:
            continue
        SEEN.add((y,x))

        if d > max_cheat:
            continue

        for yy,xx in iterate_positions(y,x, get_positions(diagonal=False), G):
            Q.append((yy,xx,d+1))

        if G[y][x] != "#" and d>1:
            res[(y,x)].add(d)

    return [(y,x,min(d)) for (y,x),d in res.items()]

def get_combined_dist(sd, cheat):
    cy, cx, cd = cheat

    dist = sd + cd + END_DIST[(cy,cx)]
    return WITHOUT_CHEAT - dist

WITHOUT_CHEAT, PATH = find_path(sy,sx)
END_DIST = get_end_map()

p1 = 0
p2 = 0

for sd, (y,x) in enumerate(PATH):
    for cheat in find_cheats(y,x,2):
        if get_combined_dist(sd, cheat) >= (10 if IS_EXAMPLE else 100):
            p1 += 1

    for cheat in find_cheats(y,x,20):
        if get_combined_dist(sd, cheat) >= (50 if IS_EXAMPLE else 100):
            p2 += 1

print(p1)
print(p2)
