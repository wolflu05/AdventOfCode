import collections, functools
from lib import *

inp = get_input()

DIR_PAD = [" ^A", "<v>"]
NUM_PAD = ["789", "456", "123", " 0A"]
PADS = {"D": DIR_PAD, "N": NUM_PAD}

DIR_MAP = {"U": "^", "R": ">", "D": "v", "L": "<"}

@functools.cache
def find_letter(PAD_STR, l):
    return find_grid(PADS[PAD_STR], l)

@functools.cache
def find_paths(PAD_STR, start, end):
    PAD = PADS[PAD_STR]
    sy,sx = find_letter(PAD_STR, start)
    ey,ex = find_letter(PAD_STR, end)

    Q = collections.deque([(sy,sx,None,"",set())])
    res = set()
    min_res = None

    while Q:
        y,x,d,r,SEEN = Q.popleft()

        if (y,x) in SEEN:
            continue
        SEEN.add((y,x))

        if min_res is not None and len(r) >= min_res:
            continue

        if d:
            r += d

        if (y,x) == (ey,ex):
            if min_res is None: min_res = len(r)
            res.add(r)
            continue

        for (yy,xx),dd in iterate_positions(y,x,get_positions(diagonal=False, include_pos_names=True), PAD):
            if PAD[yy][xx] == " ":
                continue

            Q.append((yy,xx,dd,r,set(SEEN)))

    return set(''.join(DIR_MAP[x] for x in curr_res)+"A" for curr_res in res)

@functools.cache
def find_paths_dir_chain(start, end, robots=2):
    paths = find_paths("D", start, end)

    if robots == 1:
        return len(min(paths, key=len))

    min_len = set()
    for path in paths:
        prev = "A"
        n = []
        for p in path:
            x = find_paths_dir_chain(prev, p, robots-1)
            n.append(x)
            prev = p

        min_len.add(sum(n))

    return min(min_len)

def find_shortest_seq_num(seq, prev="A"):
    res = find_paths("N", prev, seq[0])

    if len(seq) == 1:
        return res

    new = set()
    rest = find_shortest_seq_num(seq[1:], seq[0])
    for r in res:
        for re in rest:
            new.add(f"{r}{re}")
    return new

def solve(robots):
    complexity_sum = 0
    for l in inp:
        complexities = set()

        for seq in find_shortest_seq_num(l):
            prev = "A"
            _sum = []
            for s in seq:
                _sum.append(find_paths_dir_chain(prev,s,robots))
                prev = s

            complexities.add(sum(_sum))

        complexity_sum += int(l[:-1]) * min(complexities)

    return complexity_sum

print(solve(2))
print(solve(25))
