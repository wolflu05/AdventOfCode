import sys, collections
from lib import *

inp = get_input()

S = None
for y, line in enumerate(inp):
    for x, c in enumerate(line):
        if c == "S":
            assert S is None
            S=(y,x)

SI = 6 if IS_EXAMPLE else 131 * 2 + 65

M = collections.defaultdict(set)
Q = collections.deque([(*S,(0,0),0)])

ii=0
while len(Q):
    y,x,tile,s = Q.popleft()
    if ii % 100_000 == 0:
        print(f"{s/SI*100:.2f}%", file=sys.stderr, end="\r")
    ii+=1

    if inp[y][x] == "#":
        continue
    if (y,x,tile) in M[s]:
        continue
    M[s].add((y,x,tile))

    if s == SI:
        continue

    for yn,xn in iterate_positions(y,x,get_positions(diagonal=False)):
        d_tile = (0,0)
        if yn < 0:
            yn = len(inp)-1
            d_tile = (-1,0)
        if yn > len(inp)-1:
            yn = 0
            d_tile = (1,0)
        if xn < 0:
            xn = len(inp[0])-1
            d_tile = (0,-1)
        if xn > len(inp[0])-1:
            xn = 0
            d_tile = (0,1)

        Q.append((yn,xn,(tile[0]+d_tile[0], tile[1]+d_tile[1]),s+1))

# part 1
print(f"\n{len(M[6 if IS_EXAMPLE else 64])}")

# part 2
if IS_EXAMPLE:
    print("-")
    exit() # example cannot be solved that way

# count possible end positions for each tile
V = collections.defaultdict(int)
for y,x,tile in M[SI]:
    V[tile] += 1


#    ,^,    ^
#   / O \   | x=2 (number of full tiles)
#  < OEO >  -
#   \ O /
#    'v'

# sum all needed tiles together for 26501365 steps
x = (26501365-65) // 131
print(sum([
    x**2 * V[(-1,0)], # O
    (x-1)**2 * V[(0,0)], # E
    x * (V[(-2,1)]+V[(-2,-1)]+V[(2,-1)]+V[(2,1)]), # ,,''
    (x-1) * (V[(-1,1)]+V[(-1,-1)]+V[(1,-1)]+V[(1,1)]), # / \ \ /
    V[(-2,0)] + V[(0,-2)] + V[(2,0)] + V[(0,2)], # ^ v > <
]))

# - pretty print map
# V = M[SI]
# F = list(zip(*[t for _,__,t in V]))
# SIZE = (max(F[0]) - min(F[0])+2,max(F[1]) - min(F[1])+2)
# for yt in range(-(SIZE[0]//2),SIZE[0]//2+1):
#     for y, line in enumerate(inp):
#         l = [""]*(SIZE[1]+1)
#         for x, c in enumerate(line):
#             for xt in range(-(SIZE[1]//2),SIZE[1]//2+1):
#                 if (y,x) == S: l[xt+SIZE[1]//2]+=(ANSI.RED if (yt,xt) == (0,0) else ANSI.GREEN)
#                 if (y,x,(yt,xt)) in V:
#                     l[xt+SIZE[1]//2]+="O"
#                 else:
#                     l[xt+SIZE[1]//2]+=inp[y][x]
#                 if (y,x) == S: l[xt+SIZE[1]//2]+=ANSI.RESET
#         print("|".join(l))
#     print("-"*((SIZE[1]+2)*len(inp[0])))
