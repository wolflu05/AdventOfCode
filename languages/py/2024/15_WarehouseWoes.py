from lib import *

G, I = get_input(split_sections=True, lines_to_list=True)
I = "".join(y for x in I for y in x)

DIR = {
    ">": NEIGHBORS_DICT["R"],
    "v": NEIGHBORS_DICT["D"],
    "<": NEIGHBORS_DICT["L"],
    "^": NEIGHBORS_DICT["U"],
}

def gps_sum(G, char):
    res = 0
    for y, row in enumerate(G):
        for x, col in enumerate(row):
            if col == char:
                res += y*100+x

    return res

def solve(G, can_move, gps_char):
    y,x = find_grid(G, "@")
    for d in I:
        oy,ox = DIR[d]
        ny,nx = y+oy, x+ox
        NG = copy_grid(G)
        if can_move(NG, ny, nx, d):
            G = NG
            G[y][x] = "."
            G[ny][nx] = "@"
            y,x = ny,nx

    if DEBUG:
        print(f"\nMove {d}:")
        print_grid(G)

    return gps_sum(G, gps_char)

def part1():
    def try_push(y,x,d,G):
        oy,ox = DIR[d]
        ny,nx = y+oy, x+ox

        if G[ny][nx] == "#":
            return False

        if G[ny][nx] == "." or (G[ny][nx] != "." and try_push(ny,nx,d,G)):
            G[y][x] = "."
            G[ny][nx] = "O"
            return True
        else:
            return False

    def can_move(G, y, x, d):
        return G[y][x] == "." or (G[y][x] == "O" and try_push(y,x,d,G))

    return solve(G, can_move, "O")

def part2():
    REPLACE_MAP = {"#": "##", "O": "[]", ".": "..", "@": "@."}

    NG = []
    for row in G:
        NR = []
        for col in row:
            NR.extend(list(REPLACE_MAP[col]))

        NG.append(NR)

    def try_push(y,x,d,G):
        # ensure that x is either a left box edge or some other character but not a right edge
        if G[y][x] == "]": x-=1
        if G[y][x]=="[":
            assert G[y][x+1]=="]"

        oy,ox = DIR[d]
        ny,nx = y+oy, x+ox
        
        if G[ny][nx] == "#" or G[ny][nx+1] == "#":
            return False
        elif G[ny][nx] in ["[", "]", "."] and G[ny][nx+1] in ["[", "]", "."]:
            l_ok, r_ok = True, True
            if d == "<":
                if G[ny][nx] != ".":
                    l_ok = try_push(ny,nx,d, G)
            elif d == ">":
                if G[ny][nx+1] != ".":
                    l_ok = try_push(ny,nx+1,d, G)
            else:
                if G[ny][nx] != ".":
                    l_ok = try_push(ny,nx,d, G)
                if G[ny][nx+1] != ".":
                    r_ok = try_push(ny,nx+1,d, G)

            if l_ok and r_ok:
                G[y][x] = "."
                G[y][x+1] = "."
                G[ny][nx] = "["
                G[ny][nx+1] = "]"
                return True
            else:
                return False

    def can_move(G, y, x, d):
        return G[y][x] == "." or (G[y][x] in ["[", "]"] and try_push(y,x,d,G))

    return solve(NG, can_move, "[")


print(part1())
print(part2())
