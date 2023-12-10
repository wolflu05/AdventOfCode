import math
from lib import *


REPLACE_MAP = {
    "|": [
        "x|x",
        "x|x",
        "x|x",
    ],
    "-": [
        "xxx",
        "---",
        "xxx",
    ],
    "L": [
        "x|x",
        "xL-",
        "xxx",
    ],
    "J": [
        "x|x",
        "-Jx",
        "xxx",
    ],
    "7": [
        "xxx",
        "-7x",
        "x|x",
    ],
    "F": [
        "xxx",
        "xF-",
        "x|x",
    ],
    ".": [
        "xxx",
        "x.x",
        "xxx",
    ],
}

NEXT_ALLOWED_DIRS = {
    "U": "|F7S",
    "D": "|LJS",
    "L": "-FLS",
    "R": "-J7S"
}

CHAR_DIRS = {
    "|": "UD",
    "-": "LR",
    "L": "UR",
    "J": "UL",
    "7": "DL",
    "F": "DR",
    "S": "UDLR",
}

def walk_allowed(current, next_node, direction):
    if current not in CHAR_DIRS:
        return False
    
    allowed_dirs = CHAR_DIRS[current]

    if direction not in allowed_dirs:
        return False
    
    next_allowed_dirs = NEXT_ALLOWED_DIRS[direction]

    if next_node not in next_allowed_dirs:
        return False
    
    return True


inp = get_input()

start = None
grid = []
e_grid = []

for y, line in enumerate(inp):
    l = []
    for x, char in enumerate(line):
        if char == "S":
            start = (y, x)
        l.append(char)

    grid.append(l)


# part 1 - walk through the loop
x = None
y = None
last = None
in_path = set()

while y != start[0] or x != start[1]:
    if x is None and y is None:
        y, x = start

    in_path.add((y,x))

    next_nodes = []
    for (yn, xn), direction in iterate_positions(y, x, get_positions(direct=True, diagonal=False, include_pos_names=True), grid):
        if walk_allowed(grid[y][x], grid[yn][xn], direction) and last != (yn, xn):
            next_nodes.append((yn, xn))

    if len(next_nodes) >= 1:
        last = (y, x)
        y, x = next_nodes[0]

print(math.floor(len(in_path) / 2))

# part 2 - graph find all outer nodes
e_grid = []

for y, line in enumerate(grid):
    l = ["", "", ""]

    for x, char in enumerate(line):
        if char == "S":
            # find replacement char for start position to close the loop
            allowed_directions = set()
            for (dy, dx), direction in iterate_positions(y, x, get_positions(direct=True, diagonal=False, include_pos_names=True), grid):
                if walk_allowed(char, inp[dy][dx], direction):
                    allowed_directions.add(direction)

            for c, directions in CHAR_DIRS.items():
                if set(directions) == allowed_directions:
                    char = c
                    break
        
        if (y, x) not in in_path and y != 0 and x != 0:
            char = "."

        for i, c in enumerate(REPLACE_MAP[char]):
            l[i] += c

    e_grid.extend(l)

visited = set()
to_visit = [(0,0)]

while(len(to_visit) > 0):
    y, x = to_visit.pop()
    visited.add((y,x))

    for yn, xn in iterate_positions(y, x, get_positions(direct=True, diagonal=False), e_grid):
        if e_grid[yn][xn] in [".", "x"] and (yn, xn) not in visited:
            to_visit.append((yn, xn))

# count not visited dots
all_nodes = set()
for y in range(len(e_grid)):
    for x in range(len(e_grid[y])):
        all_nodes.add((y,x))

not_visited = all_nodes - visited

p2 = 0
for y, x in not_visited:
    if e_grid[y][x] == ".":
        p2 +=1

print(p2)
