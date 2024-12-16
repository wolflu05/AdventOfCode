import collections, heapq
from lib import *

G = get_input(lines_to_list=True)

sy,sx = find_grid(G, "S")
ey,ex = find_grid(G, "E")

SEEN = set()
DIST = collections.defaultdict(lambda: float("inf"))
PREV = collections.defaultdict(set)
Q = [(0, sy,sx,NEIGHBORS_DICT["R"])]

p1 = 0
while Q:
    dist,y,x,d = heapq.heappop(Q)

    if (y,x) in SEEN:
        continue
    SEEN.add((y,x))

    if dist <= DIST[(y,x)]:
        DIST[(y,x)] = dist

    if (y,x) == (ey,ex):
        p1 = dist
        break

    for (yo,xo) in [d, rotate_direction_vec(d, 1), rotate_direction_vec(d, -1)]:
        yy,xx = y+yo, x+xo

        if not check_index_exists(G, yy, xx) or G[yy][xx] == "#":
            continue

        cost = 1001 if (yo, xo) != d else 1
        heapq.heappush(Q, (dist+cost, yy,xx,(yo,xo)))

        # keep track of all the predecessor nodes to the current path for p2
        PREV[(yy,xx)].add((y,x))

print(p1)

# perform dfs back from the end to the start and update the PATH stack with the current path
# if a valid path (with length found by dijkstra in p1) is found. Update the nodes set with
# all nodes from the current path.
NODES = set()
PATH = []
def dfs(y,x,direction,d=0):
    if (y,x) in PATH:
        return float("inf")

    PATH.append((y,x))

    if (y,x) == (sy,sx):
        if direction != (0, -1):  # end must be reached from the right side (starts at east)
            d += 1000

        if d == p1:
            NODES.update(PATH)

        PATH.pop()
        return d

    res = []
    for yy,xx in PREV[(y,x)]:
        c_cost = 1
        dy,dx = direction
        if (yy,xx) != (y+dy,x+dx):
            c_cost += 1000
            dx = xx-x
            dy = yy-y

        res.append(dfs(yy,xx,(dy,dx),d+c_cost))

    PATH.pop()

    return min(res)

# try to start in down and left direction
for d in [(0,-1), (1,0)]:
    dfs(ey,ex,d)

print(len(NODES))
