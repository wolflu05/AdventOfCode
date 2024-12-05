import collections
from lib import *

inp = get_input()

R=collections.defaultdict(list)  # R: after -> before
U=[]  # list of page update lists
hr = False
for l in inp:
    if l == "" and hr is False:
        hr = True
        continue

    if hr:
        U.append([int(x) for x in l.split(",")])
    else:
        a,b = [int(x) for x in l.split("|")]
        R[b].append(a)

def can_be_now(n, before, _all):
    for b in R[n]:
        if b in _all and b not in before:
            return False
    return True

p1=0
p2=0

for ul in U:
    if all(can_be_now(u, ul[:ui], ul) for ui, u in enumerate(ul)):
        p1 += ul[len(ul)//2]
    else:
        TV = list(ul)
        O = []

        while TV:
            for p in TV:
                if can_be_now(p, O, ul):
                    TV.remove(p)
                    O.append(p)
                    break

        p2 += O[len(O)//2]

print(p1)
print(p2)
