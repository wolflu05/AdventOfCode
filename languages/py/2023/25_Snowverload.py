import heapq
import sys, collections, re, itertools, functools, math
from lib import *

inp = get_input()

G = collections.defaultdict(set)

for l in inp:
    a,b = l.split(": ")
    b = b.split()

    G[a].update(b)

    for c in b:
        G[c].add(a)

C = collections.defaultdict(int)
for i, s in enumerate(G.keys()):
    dist = {n: float("inf") for n in G.keys()}
    prev = {n: None for n in G.keys()}
    dist[s] = 0

    Q = [(0,s)]
    V = set()

    while Q:
        d, n = heapq.heappop(Q)

        if n in V:
            continue
        V.add(n)

        for sn in G[n]:
            nd = dist[n] + 1
            if nd < dist[sn]:
                dist[sn] = nd
                prev[sn] = n
                heapq.heappush(Q, (nd, sn))

    for n in G.keys():
        g = n
        while g:
            C[g] +=1
            g = prev[g]
    # print(s, i, len(G.keys()), i/len(G.keys()))

s = list(zip(*sorted(C.items(), key=lambda x: x[1], reverse=True)[:12]))[0]

def get_combinations_dict(lst):
    pairs = itertools.combinations(lst, 2)
    group_combs = itertools.combinations(pairs, 3)
    combs = []

    for g in group_combs:
        gt = [e for t in g for e in t]
        if len(set(gt)) == 6:
            combs.append(dict(g))
    return combs

for S in [l for f in itertools.combinations(s, r=6) for l in get_combinations_dict(f)]:
    def dfs(s):
        Q = collections.deque([s])
        V = set()

        while Q:
            n = Q.popleft()
            if n in V: continue
            V.add(n)
            for sn in G[n]:
                if n in S and sn == S[n]: continue
                if sn in S and n == S[sn]: continue

                Q.append(sn)

        return len(V)

    a = dfs(list(S.keys())[0])
    b = dfs(list(S.values())[0])

    if a != b != len(G.keys()):
        print(a*b)
        break

print("-") # there is no part 2
