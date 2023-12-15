import collections
from lib import *

inp = get_input()

def get_hash(box):
    r = 0
    for c in box: 
        r = ((r+ord(c))*17)%256
    return r

p1=0
p2=0

BOX_M = collections.defaultdict(lambda: collections.OrderedDict())

for l in inp:
    for op in l.split(","):
        p1 += get_hash(op)
        if "-" in op:
            lense = op.replace("-", "")
            h = get_hash(lense)
            if lense in BOX_M[h]:
                del BOX_M[h][lense]
        else:
            lense, n = op.split("=")
            h = get_hash(lense)
            BOX_M[h][lense] = int(n)

for i,(h, lenses) in enumerate(BOX_M.items()):
    for slot, (l, n) in enumerate(lenses.items()):
        p2 += (h+1) * (slot+1) * n

print(p1)
print(p2)
