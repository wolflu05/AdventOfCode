import re, functools
from lib import *

inp = get_input()

p1 = 0
cards = {}

for l in inp:
    c, a, b = re.split(":|\|", l)
    n = int(c.split()[1])
    
    a = set(int(h) for h in a.split())
    b = set(int(h) for h in b.split())
    w = len(b & a)

    p1 += 2 ** (w - 1) if w else 0
    cards[n] = w

ll = len(cards.keys())

@functools.cache
def get_count(i):
    r = cards[i]
    s = 1
    for h in range(r):
        k = i + h + 1
        if k <= ll:
            s += get_count(k)

    return s

print(p1)
print(sum(get_count(i) for i in cards.keys()))        
