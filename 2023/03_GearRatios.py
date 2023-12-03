import sys
from utils import get_positions, iterate_positions

inp = []
with open(sys.argv[1]) as f:
    inp = [l.strip() for l in f.readlines()]

p1 = 0
gears = {}

for y in range(len(inp)):
    num = ""
    has_sym = False
    num_gears = set()

    for x in range(len(inp[y])):
        if inp[y][x].isdigit():
            num += inp[y][x]

            for yy, xx in iterate_positions(y, x, get_positions(), inp):
                if inp[yy][xx] != "." and not inp[yy][xx].isdigit():
                    has_sym = True

                if inp[yy][xx] == "*":
                    num_gears.add((yy, xx))

            if (x + 1) > (len(inp[y]) - 1) or not inp[y][x + 1].isdigit():
                if has_sym:
                    num = int(num)
                    p1 += num
                    for yyy, xxx in num_gears:
                        gears.setdefault((yyy, xxx), []).append(num)
                num = ""
                has_sym = False
                num_gears = set()

p2 = sum(nums[0] * nums[1] for nums in gears.values() if len(nums) == 2)

print(p1)
print(p2)
