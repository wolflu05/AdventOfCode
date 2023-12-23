import collections, heapq
from lib import *

inp = get_input()

DIR_MAP = {">": "R", "<": "L", "v": "D", "^":"U"}
src, dest = (0,1), (len(inp)-1, len(inp[0])-2)

def solve(p2=False):
    G = collections.defaultdict(set)
    V = set()

    def get_next_path(y,x,prev):
        def w(y,x,prev):
            Q = collections.deque([(y,x,prev,0)])

            while Q:
                y, x, prev, d = Q.popleft()
                e = []
                for (yn,xn),di in iterate_positions(y,x,get_positions(diagonal=False, include_pos_names=True), inp):
                    if inp[yn][xn] == "#" or (yn,xn) == prev:
                        continue
                    if not p2 and inp[yn][xn] in DIR_MAP and di != DIR_MAP[inp[yn][xn]]:
                        continue
                    e.append((yn,xn))
                if len(e) == 1:
                    Q.append((*e[0], (y,x), d+1))
                if len(e) > 1:
                    return (y,x), e, d+1
                if len(e) == 0 and (y,x) != prev:
                    return (y,x), [], d

        edge, next_path_starts, d = w(y,x,prev)

        if edge not in V:
            V.add(edge)
            for e in next_path_starts:
                p, dd = get_next_path(*e, edge)
                G[edge].add((p, dd))

        return edge, d


    G[src] = [get_next_path(*src,src)]

    # add reverse side of graph for p2
    if p2:
        IG = collections.defaultdict(set)
        for k,v in G.items():
            for n, d in v:
                IG[n].add((k,d))
        for k,v in IG.items():
            G[k].update(v)

    Q = [(0,*src,0,set())]
    P = set()
    while Q:
        a,y,x,d,v = heapq.heappop(Q)
        
        if (y,x) in v:
            continue
        v.add((y,x))

        if (y,x) == dest:
            P.add(d)
            continue

        if (y,x) not in G:
            continue

        nn = G[(y,x)]
        for (yn,xn), l in nn:
            heapq.heappush(Q, (a-l,yn,xn,d+l,set(v)))
    print(max(P))

solve()
solve(True)
