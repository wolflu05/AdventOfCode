import collections, itertools, tqdm, math

from lib import *

initial,rules = get_input(split_sections=True)

G = {}

for l in initial:
    n,v = l.split(": ")
    G[n] = int(v)

R = []
for l in rules:
    a,b = l.split(" -> ")
    x,gate,z = a.split(" ")
    R.append((x,gate,z,b))

RG = collections.defaultdict(list)
RG_IN = collections.defaultdict(list)
OUT_TO_R_IDX = {}

for i,(a,op,b,z) in enumerate(R):
    RG[z].append(a)
    RG[z].append(b)

    RG_IN[(a,b) if a < b else (b,a)].append((op, z))

    OUT_TO_R_IDX[z] = i

def parseWire(G, name):
    res = {}

    for k,v in G.items():
        if k.startswith(name):
            res[int(k.lstrip(name))] = v

    rs = ""
    for k,v in sorted(res.items(), key=lambda x: x[0], reverse=True):
        rs += str(v)

    return int(rs, base=2)

def sim(G, R):
    Q = collections.deque([(*r,0) for r in R])

    while Q:
        x,gate,z,b,r = Q.popleft()

        try:
            if gate == "AND":
                G[b] = G[x] & G[z]
            elif gate == "OR":
                G[b] = G[x] or G[z]
            elif gate == "XOR":
                G[b] = G[x] ^ G[z]
        except:
            if r > len(R) - 1:
                return 0

            Q.append((x,gate,z,b,r+1))

    return parseWire(G, "z")

def gen_initials(x,y,bit_len):
    G = {}
    G.update({f"x{str(i).zfill(2)}":int(b) for i,b in enumerate(bin(x)[2:].zfill(bit_len)[::-1])})
    G.update({f"y{str(i).zfill(2)}":int(b) for i,b in enumerate(bin(y)[2:].zfill(bit_len)[::-1])})

    return G

# --- mermaid
if "mermaid" in FLAGS:
    # --- Generate Mermaid graph
    UNTIL_BIT = 7
    Q = [f"z{str(i).zfill(2)}" for i in range(UNTIL_BIT)]
    SEEN = set()

    while Q:
        x = Q.pop(0)
        if x in SEEN:
            continue
        SEEN.add(x)

        if x in RG:
            for a in RG[x]:
                Q.append(a)

    print("flowchart TD")
    for k,(a,b) in RG.items():
        if k not in SEEN:
            continue

        print(f"  {a} --> {a}{b}{k}{'{'+R[OUT_TO_R_IDX[k]][1]+'}'}")
        print(f"  {b} --> {a}{b}{k}")
        print(f"  {a}{b}{k} --> {k}")

# --- part 1
G_p1 = G.copy()
sim(G_p1, R)
print(parseWire(G_p1, "z"))

# --- part 2
func = int.__and__ if IS_EXAMPLE else int.__add__
bit_len = sum(1 for x in G.keys() if x.startswith("x"))

# identify nodes related to each bit
RELATED_TO_BIT = collections.defaultdict(set)

SEEN = set()
for zi in range(bit_len):
    Q = collections.deque([f"z{str(zi).zfill(2)}"])
    CURR_SEEN = set()
    while Q:
        x = Q.popleft()

        if x in SEEN:
            continue
        SEEN.add(x)
        RELATED_TO_BIT[zi].add(x)

        if x in RG:
            for a in RG[x]:
                Q.append(a)

NODE_TO_BIT = {n: bit for bit, nodes in RELATED_TO_BIT.items() for n in nodes}

# optimize rule order based on what nodes correspond to each bit (and then recalculate the out to R idx map)
R = sorted(R, key=lambda rule: NODE_TO_BIT.get(rule[3], 0))
for i,(a,op,b,z) in enumerate(R):
    OUT_TO_R_IDX[z] = i

def get_non_working_bits(R, check_only=False):
    BITS = set()

    for zi in range(bit_len):
        # cover current bit
        SET = 1 << zi
        tests = [(0,0), (0,SET), (SET,0), (SET,SET)]

        # cover carry bit
        if zi > 0:
            PREV_SET = 1 << (zi - 1)
            tests.extend([
                (PREV_SET, PREV_SET),
                (SET | PREV_SET, SET),
                (PREV_SET, SET | PREV_SET),
                (SET | PREV_SET, SET | PREV_SET),
            ])

        for x,y in tests:
            z = sim(gen_initials(x,y,bit_len), R)
            if z != func(x,y):
                BITS.add(zi)

                if check_only:
                    return False

                break

    return True if check_only else BITS

def swap_outs(R, a,b):
    a = OUT_TO_R_IDX[a]
    b = OUT_TO_R_IDX[b]

    R[a], R[b] = (*R[a][:-1], R[b][-1]), (*R[b][:-1], R[a][-1])

POS = set()
for zi in get_non_working_bits(R):
    POS.update([x for x in RELATED_TO_BIT[zi] if not (x.startswith("x") or x.startswith("y"))])

last_non_working = get_non_working_bits(R)
POS_COMBS = set()

for a,b in tqdm.tqdm(itertools.combinations(POS, r=2), total=math.comb(len(POS), 2)):
    swap_outs(R, a, b)

    new_non_working = get_non_working_bits(R)

    if len(new_non_working) < len(last_non_working):
        POS_COMBS.add((a,b))

    swap_outs(R, a, b)

x = parseWire(G, "x")
y = parseWire(G, "y")
target = func(x, y)

for combs in itertools.combinations(POS_COMBS, r=2 if IS_EXAMPLE else 4):
    tmp_r = R.copy()
    for a,b in combs:
        swap_outs(tmp_r, a, b)

    if sim(gen_initials(x,y,bit_len), tmp_r) == target and get_non_working_bits(tmp_r, check_only=True) is True:
        print(",".join(sorted(c for a,b in combs for c in [a,b])))
        break
else:
    print("-")
