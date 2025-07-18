from lib import *

t0, ids = get_input()
t0 = int(t0)
ids = [(i, int(x)) for i, x in enumerate(ids.strip().split(",")) if x != "x"]

# part 1
d, bus = min([(x - t0 % x, x) for _, x in ids], key=lambda x: x[0])
print(d * bus)

# part 2
print(chinese_remainder([(x - i, x) for i, x in ids]))
