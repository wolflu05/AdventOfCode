import collections
from lib import *

inp = get_input()

S=collections.defaultdict(set)
for y, row in enumerate(inp):
    for x, col in enumerate(row):
        S[col].add((y,x))

def count_perimeter(per: list):
    sides = 0

    # count for each side individually so that I don't have to mess with same perimeter nodes counting for different sides
    for di in ["U", "D", "L", "R"]:
        Q = [(y,x) for y,x,d in per if d == di]

        while Q:
            NQ = [Q.pop(0)]
            last_d = None
            while NQ:
                y,x = NQ.pop(0)
                for (yy,xx),d in iterate_positions(y,x,get_positions(diagonal=False, include_pos_names=True)):
                    d = {"L": "H", "R": "H", "U": "V", "D": "V"}[d]
                    if (yy,xx) in Q:
                        if last_d is None:
                            last_d = d
                        elif last_d != d:
                            continue

                        Q.remove((yy,xx))
                        NQ.append((yy,xx))

            sides += 1

    return sides

p1=0
p2=0

for char, pos in S.items():
    P = set(pos)
    while P:
        p = P.pop()
        Q = [p]
        SEEN = set()
        PER = set()

        while Q:
            y,x = Q.pop(0)
            if (y,x) in SEEN:
                continue
            SEEN.add((y,x))
            for (yy,xx),d in iterate_positions(y,x,get_positions(diagonal=False, include_pos_names=True)):
                if not check_index_exists(inp, yy,xx) or inp[yy][xx] != char:
                    PER.add((yy,xx,d))
                    continue

                Q.append((yy,xx))

        P -= SEEN

        p1 += len(SEEN) * len(PER)
        p2 += len(SEEN) * count_perimeter(PER)

print(p1)
print(p2)
