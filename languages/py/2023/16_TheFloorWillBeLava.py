from lib import *

inp = get_input()

IN_OUT_MAP = {
    "/": {
        "U": "L",
        "R": "D",
        "D": "R",
        "L": "U"
    },
    "\\": {
        "U": "R",
        "R": "U",
        "D": "L",
        "L": "D"
    },
    "|": {
        "U": "D",
        "R": "UD",
        "D": "U",
        "L": "UD"
    },
    "-": {
        "U": "LR",
        "R": "L",
        "D": "LR",
        "L": "R"
    },
    ".": {
        "U": "D",
        "R": "L",
        "D": "U",
        "L": "R",
    }
}
OUT_TO_IN_DIR_MAP = {
    "U": "D",
    "R": "L",
    "D": "U",
    "L": "R",
}

def solve(start):
    queue = [start]
    visited = set()

    while len(queue):
        tile = queue.pop(0)
        
        if tile in visited:
            continue # cycle detected -> stop here
        visited.add(tile)

        y,x,d = tile
        curr = inp[y][x]

        for (yn, xn), dn in iterate_positions(y, x, get_positions(custom=IN_OUT_MAP[curr][d], include_pos_names=True), inp):
            queue.append((yn,xn,OUT_TO_IN_DIR_MAP[dn]))

    return len(set((y,x) for y,x,_ in visited))

# part 1
print(solve((0,0,"L")))

# part 2
entry_list = []
for i in range(len(inp)):
    entry_list.extend([(i, 0, "L"), (i, len(inp[0])-1, "R")])
for i in range(len(inp[0])):
    entry_list.extend([(0, i, "U"), (len(inp)-1, i, "D")])

print(max(solve(s) for s in entry_list))
