import heapq
from lib import *

inp = get_input()

src = (0,0)
dst = (len(inp)-1, len(inp[0])-1)
INV_DIR = {"U":"D", "L":"R", "R":"L", "D":"U"}

def solve(min_walk, max_walk):
    Q = [(0,*src,None,0)]
    dist = {}
    P=[]

    while len(Q):
        w,y,x,d,dc = heapq.heappop(Q)

        if (y,x) == dst:
            if dc >= min_walk:
                P.append(w)
                continue

        for (yn,xn), dn in iterate_positions(y,x,get_positions(diagonal=False, include_pos_names=True), inp):
            if d == INV_DIR[dn]: # ignore going backwards
                continue

            dcn = dc + 1 if d == dn else 1
            if dcn > max_walk:
                continue
            if dc < min_walk and d != dn and d is not None:
                continue
        
            new_dist = w + int(inp[yn][xn])
            if new_dist < dist.get((yn,xn,dn,dcn), float("inf")):
                dist[(yn,xn,dn,dcn)] = new_dist
                heapq.heappush(Q, (new_dist,yn,xn,dn,dcn))

    print(min(P))

solve(1, 3)  # part 1
solve(4, 10) # part 2
