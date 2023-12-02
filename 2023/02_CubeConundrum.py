import sys
import re
import collections

inp = []
with open(sys.argv[1]) as f:
    inp = [l.strip() for l in f.readlines()]

p1 = 0
p2 = 0

for l in inp:
    game, sets = l.split(":")
    _, i = game.split(" ")
    sets = [f.strip().split(" ") for f in re.split(",|;", sets)]

    colors = collections.defaultdict(lambda: [0])

    for a, color in sets:
        colors[color].append(int(a))

    p1 += int(i) if max(colors["red"]) <= 12 and max(colors["green"]) <= 13 and max(colors["blue"]) <= 14 else 0
    p2 += max(colors["red"]) * max(colors["green"])  * max(colors["blue"])

print(p1)
print(p2)
