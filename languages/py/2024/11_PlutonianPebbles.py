import functools
from lib import *

inp = [int(x) for x in get_input()[0].split()]

@functools.cache
def sim(x: int, t):
    if t == 0:
        return 1

    if x == 0:
        return sim(1, t-1)
    if len(xs := str(x)) % 2 == 0:
        return sim(int(xs[:len(xs)//2]), t-1) + sim(int(xs[len(xs)//2:]), t-1)
    else:
        return sim(2024 * x, t-1)

def solve(t):
    res = 0
    for s in inp:
        res += sim(s, t)

    return res

print(solve(25))
print(solve(75))
