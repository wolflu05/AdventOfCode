from lib import *

inp = get_input()

def get_north_load(inp):
    res = 0
    for column in zip(*inp):
        y_len = len(column)
        for y, yc in enumerate(column):
            if yc == "O":
                res += y_len - y
    return res

def roll_left(inp):
    res = []
    for line in inp:
        x_pos = 0
        x_len = len(line)
        n_res = ["."] * x_len
        for x,xc in enumerate(line):
            if xc == "O":
                n_res[x_pos] = "O"
                x_pos +=1
            if xc == "#":
                x_pos = x + 1
                n_res[x] = "#"
        res.append("".join(n_res))
    return res

inp = rotate_left(inp)
seq = []
pos_seq = []
for i in range(1000):
    for j in range(4):
        inp = roll_left(inp)

        if i == j == 0:
            print(get_north_load(rotate_right(inp)))
            
        inp = rotate_right(inp)

    # north is facing to the left -> rotate right to have north on top
    north_load = get_north_load(rotate_right(inp))

    for n, _seq in pos_seq:
        if len(_seq) > 1 and _seq[1] == north_load and _seq[0] == seq[-1]: # check if sequence repeats
            _seq = _seq[:-1]  # remove last element what is just appended to check for sequence start on next cycle
            print(_seq[(1000000000-n-1) % len(_seq)])
            exit(0)

        _seq.append(north_load)

    if north_load in seq: # this number is already in the sequence, so start a new possible sequence
        pos_seq.append((i, [north_load]))

    seq.append(north_load)

assert False, "sequence is bigger than 1000 cycles"
