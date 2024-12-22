import collections, itertools
from lib import *

inp = get_input()

def mix_prune(sec, mix_num):
    sec = sec ^ mix_num
    return sec % 16777216

def sim(sec):
    for _ in itertools.count():
        sec = mix_prune(sec, sec * 64)
        sec = mix_prune(sec, sec // 32)
        sec = mix_prune(sec, sec * 2048)

        yield sec

p1 = 0
R = []
for l in inp:
    l = int(l)
    seq = list(itertools.islice(sim(int(l)), 2000))

    p1 += seq[-1]
    
    # generate sequence with difference to the previous price for p2
    res = []
    prev = l % 10
    for s in seq:
        res.append((s%10,(s%10) - (prev%10)))
        prev = s

    R.append(res)

print(p1)

C = collections.defaultdict(list)

for d in R:
    SEEN = set()

    for i in range(3, len(d)):
        seq = tuple(d[i-j][1] for j in range(3,-1,-1))

        if seq in SEEN:
            continue
        SEEN.add(seq)

        C[seq].append(d[i][0])

m = max(sum(x) for x in C.values())
print(m)
