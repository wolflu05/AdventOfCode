import collections, math
from lib import *

inp = get_input()

M = {}  # Modules (in -> out map)
FS = {} # Flip-Flop state
CS = {} # Conjunction state

for l in inp:
    n, d = l.split(" -> ")
    d = d.split(", ")
    if n == "broadcaster":
        M[n] = ("", d)
    else:
        M[n[1:]] = (n[0], d)

OUT_IN_MAP = collections.defaultdict(list) # Modules (out -> in map)
for k,v in M.items():
    for vv in v[1]:
        OUT_IN_MAP[vv].append(k)

# # - output mermaid diagram code
# out = ["flowchart TD"]
# for n,(t,d) in M.items():
#     for dd in d:
#         out.append(f"    {n}[{t}{n}] --> {dd}")
# print("\n".join(out))

# initiate state
for n, (t, d) in M.items():
    if t == "%":
        FS[n] = False
    if t == "&":
        CS[n] = {k: False for k in OUT_IN_MAP[n]}

# Find cycle roots and put in CYCLES MAP
def find_roots(mod):
    roots = []
    has_found = False
    for d in OUT_IN_MAP[mod]:
        if d not in M or M[d][0] != "&":
            continue
        roots.extend(find_roots(d))
        has_found = True
    if not has_found:
        roots.append(mod)
    return roots

CYCLES = {d: [] for d in find_roots("rx")}

lp = 0
hp = 0
i=0 # cnt button presses
while True:
    Q = collections.deque([("broadcaster", False, "button")])
    i+=1
    while Q:
        m_name, p, last = Q.popleft()

        # cnt for p1
        if p: hp+=1
        else: lp+=1

        if m_name not in M:
            continue

        t,d = M[m_name]
        out_pulse = None

        if m_name == "broadcaster":
            out_pulse = p
        elif t == "%": # Flip flop
            if not p:
                FS[m_name] = not FS[m_name]
                out_pulse = FS[m_name]
        elif t == "&": # Conjunction module
            CS[m_name][last] = p
            out_pulse = not all(CS[m_name].values())
            
            # Store cycles when the output goes low
            if out_pulse is False and m_name in CYCLES:
                CYCLES[m_name].append(i)

        if out_pulse is not None:
            Q.extend((sm, out_pulse, m_name) for sm in d)

    # p1
    if i == 1000:
        print(lp*hp)

        if not "rx" in OUT_IN_MAP: # skip p2, because there is no module named rx in the outputs of any module
            print("-")
            exit(0)

    # we now have all data collected to solve p2
    if i >= 1000 and all(len(a) > 0 for a in CYCLES.values()):
        break

# walk down starting from rx and calculate the lcm of all inputs to get the number where rx gets a low input
def walk_down(mod, p):
    """mod -> start_module, p -> what should be the input for that module."""
    global CYCLES
    if mod in CYCLES and p:
        return CYCLES[mod][0]

    c = []
    for d in OUT_IN_MAP[mod]:
        if d not in M or M[d][0] != "&":
            continue
        c.append(walk_down(d, not p))
    return math.lcm(*c)

print(walk_down("rx", False))
