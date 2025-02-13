from collections import Counter
from lib import *

inp = get_input()

A = []
B = []

for l in inp:
    a,b = [int(x) for x in l.split()]

    A.append(a)
    B.append(b)

BC = Counter(B)

p1 = 0
p2 = 0

for a, b in zip(sorted(A), sorted(B)):
    p1 += abs(a-b)
    p2 += a * BC[a]

print(p1)
print(p2)
