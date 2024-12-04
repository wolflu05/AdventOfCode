from lib import *

inp = get_input()

# construct search pattern for P2 in form of:
# [[(UL, "M"), (DL, "M"), (DR, "S"), (UR, "S")], ...]
# where UL, DL, DR, UR stand for the relative position vector
P2 = [[(NEIGHBORS_DICT[d], x) for d, x in zip(["UL", "DL", "DR", "UR"], m)] for m in ["MMSS", "SMMS", "SSMM", "MSSM"]]

p1 = 0
p2 = 0

for x in range(len(inp[0])):
    for y in range(len(inp)):
        # --- part 1
        for xo, yo in get_positions():
            L = ""
            xx, yy = x, y

            while check_index_exists(inp, yy, xx):
                L += inp[yy][xx]

                if len(L) >= 4 or not "XMAS".startswith(L):
                    break

                xx+=xo
                yy+=yo

            if L in ["XMAS"]:
                p1 += 1

        # --- part 2
        if inp[y][x] == "A":
            for comb in P2:
                matches = True

                for (xo, yo),s in comb:
                    xx,yy = x+xo, y+yo

                    if not check_index_exists(inp, yy,xx) or inp[yy][xx] != s:
                        matches = False
                        break

                if matches:
                    p2 += 1

print(p1)
print(p2)
