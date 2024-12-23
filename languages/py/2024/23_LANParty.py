import sys, collections, re, itertools, functools, math
from lib import *

inp = get_input()

G = collections.defaultdict(set)

for l in inp:
    a,b = l.split("-")

    G[a].add(b)
    G[b].add(a)

def all_connected(nodes):
    nodes = set(nodes)
    for n in nodes:
        for g in nodes - {n}:
            if g not in G[n]:
                return False
            
    return True

L = len(max(G.values(), key=len))

p1 = None
p2 = None

for i in range(L, 1, -1):
    F = set()

    if p2 is not None and i != 2:
        continue

    for k,v in G.items():
        for group in itertools.combinations(v, r=i):
            if all_connected(group):
                F.add(frozenset((k,*group)))

    if i == 2:
        p1 = 0
        for group in F:
            if any(x.startswith("t") for x in group):
                p1 += 1

    if len(F) == 1:
        p2 = ",".join(sorted(F.pop()))

print(p1)
print(p2)
