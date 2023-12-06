import math
from lib import *

inp = [l.split()[1:] for l in get_input()]

# x -> button hold time, T -> Time, D -> Distance record, nD -> Distance raced
# x*(T-x)=nD
# -x^2+Tx>D
# -x^2+Tx-D>0
# x=(T±sqrt(T^2-4*D))/(2)

def calculate_win_options(races):
    res = 1
    for t, r in races:
        a = (t+math.sqrt(t**2-4*r)) / 2
        b = (t-math.sqrt(t**2-4*r)) / 2

        # if b is a whole number, we need to increase it by one so that it
        # calculates if we have won, not also a draw
        if int(b) == b:
            b += 1

        res *= math.ceil(a) - math.ceil(b)

    return res


# --- Part 1
time = [int(a) for a in inp[0]]
distance = [int(a) for a in inp[1]]
print(calculate_win_options(zip(time, distance)))

# --- Part 2
time = int("".join(inp[0]))
distance = int("".join(inp[1]))
print(calculate_win_options([[time, distance]]))
