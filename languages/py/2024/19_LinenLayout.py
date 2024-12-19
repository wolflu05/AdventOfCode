import functools
from lib import *

A, to_make = get_input(split_sections=True)

A = set(A[0].split(", "))

@functools.cache
def can_make(d):
    res = []

    for a in A:
        if d == a:
            res.append(1)

        if d.startswith(a):
            res.append(can_make(d[len(a):]))

    return sum(res)

p1 = 0
p2 = 0
for d in to_make:
    if x := can_make(d):
        p1 += 1
        p2 += x

print(p1)
print(p2)
