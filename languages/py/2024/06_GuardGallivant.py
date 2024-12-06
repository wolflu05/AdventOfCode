from lib import *

inp = get_input()

sx, sy = None, None
for yy, row in enumerate(inp):
    for xx, col in enumerate(row):
        if col == "^":
            sx,sy = xx,yy
            break
    
    if sx is not None:
        break

def simulate(oy, ox):
    x,y = sx,sy
    d = "U"
    V = set()
    while check_index_exists(inp, y, x):
        if (y,x,d) in V:
            return True, None

        V.add((y,x,d))

        dvy, dvx = NEIGHBORS_DICT[d]
        ny,nx = y+dvy,x+dvx

        while check_index_exists(inp, ny, nx) and (inp[ny][nx] == "#" or (ny == oy and nx == ox)):
            d = rotate_direction(d)
            dvy, dvx = NEIGHBORS_DICT[d]
            nx,ny = x+dvx,y+dvy

        x,y = nx,ny

    return False, set((y,x) for y,x,_ in V)


_, V = simulate(None, None)
print(len(V))

N = set((y,x) for y,x in V if simulate(y,x)[0])
print(len(N))
