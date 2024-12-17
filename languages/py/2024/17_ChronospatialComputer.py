import collections
from lib import *

_R, _P = get_input(split_sections=True)
R = {}
for r in _R:
    _, n, v = r.split(" ")
    R[n.rstrip(":")] = int(v)
_,P = _P[0].split(":")
P = [int(x) for x in P.split(",")]


def run(R, P, p2=False):
    def get_combo_operand(op):
        if 0<=op<=3:
            return op
        if op == 4:
            return R["A"]
        if op == 5:
            return R["B"]
        if op == 6:
            return R["C"]
        assert False

    out = []
    ip = 0

    while ip < len(P):
        ins = P[ip]
        op = P[ip+1]

        if ins == 0: # adv
            R["A"] = R["A"] // (2**get_combo_operand(op))
        elif ins == 1: # bxl
            R["B"] = R["B"] ^ op
        elif ins == 2: # bst
            R["B"] = get_combo_operand(op) % 8
        elif ins == 3 and R["A"] != 0: # jnz
            ip = op
            continue
        elif ins == 4: # bxc
            R["B"] = R["B"] ^ R["C"]
        elif ins == 5: # out
            out.append(get_combo_operand(op) % 8)
            if p2:
                corr = 0
                for a in range(min(len(out), len(P))):
                    if P[a] != out[a]:
                        return out, corr
                    else:
                        corr += 1
        elif ins == 6: # bdv
            R["B"] = R["A"] // (2**get_combo_operand(op))
        elif ins == 7: # cdv
            R["C"] = R["A"] // (2**get_combo_operand(op))

        ip += 2

    return out, 0

print(",".join(str(x) for x in run(R, P)[0]))

SEEN = set()
Q = collections.deque([(0b0, 0, 0)])

while Q:
    bit_mask, bit_mask_bits, correct_bits = Q.popleft()

    if (bit_mask, bit_mask_bits) in SEEN:
        continue
    SEEN.add((bit_mask, bit_mask_bits))

    for i in range(2**10):
        x = (i << bit_mask_bits) + bit_mask
        R = {"A": x, "B": 0, "C": 0}

        out, corr = run(R, P, p2=True)

        if out == P:
            print(x)
            exit(0)

        if corr > correct_bits:
            new_bit_mask_bits = bit_mask_bits+4
            new_bit_mask = x & (2**(new_bit_mask_bits)-1)

            Q.append((new_bit_mask, new_bit_mask_bits, corr))
