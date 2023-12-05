from lib import *

inp = get_input()
seeds, _maps = inp[0], inp[2:]
_, seeds = seeds.split(":")
seeds = [int(s.strip()) for s in seeds.split() if s.strip()]

maps = {}
name = None
for m in _maps:
    if not m: continue
    if m.endswith("map:"):
        name, dest = tuple(m.replace(" map:", "").split("-to-"))
        maps[name] = (dest, [])
    else:
        _map = [int(k.strip()) for k in m.split()]
        maps[name][1].append(_map)

# sort maps by src start for easier range splitting
for _, _map in maps.values():
    _map.sort(key=lambda a: a[1])


def split_ranges(_map, start, length):
    ranges = []
    for i, (d,s,l) in enumerate(_map):
        prv = _map[i-1] if i-1 >= 0 else None
        nxt = _map[i+1] if i+1 < len(_map) else None

        if start < s and not prv: # no ranges defined before map starts
            new_start = start
            new_length = min(length, s - new_start)
            if new_length > 0:
                ranges.append((new_start, new_length, None))

            start = new_start + new_length
            length = length - new_length

        if s <= start < s+l: # check current map entry
            new_start = start
            new_length = min(length, l-(start-s))
            if new_length > 0:
                ranges.append((new_start, new_length, (d,s,l)))

            start = new_start + new_length
            length = length - new_length

        if start < nxt[1] if nxt else True: # check if there is an hole after the current entry between the next entry
            new_start = start
            new_length = min(length, nxt[1] - start if nxt else length)
            if new_length > 0:
                ranges.append((new_start, new_length, None))

            start = new_start + new_length
            length = length - new_length

    return ranges


def map_category(src, nums):
    dest, _map = maps[src]

    ranges = []
    for num, _len in nums:
        ranges.extend(split_ranges(_map, num, _len))

    res = []
    for n, _len, m in ranges:
        if m is None:
            res.append((n, _len))
            continue
        d, s, l = m
        res.append((n - s + d, min(l, _len)))

    if dest != "location":
        dest, res = map_category(dest, res)

    return dest, res


def solve(seeds):
    _, out = map_category("seed", seeds)
    print(min(l for l,_ in out))

solve([(s, 1) for s in seeds])
solve(chunk_by_n(seeds, 2))

# --- pretty print input in sorted order for debugging
# with open("sorted.txt", "w") as f:
#     for src, (dest, _map) in maps.items():
#         f.write(f"{src} -> {dest}:\n")
#         for d, s, l in _map:
#             f.write(f"{p(s)} - {p(s+l)} ({p(l)}) -> {p(d)} - {p(d+l)}\n")
#         f.write("\n\n")
