from lib import *

inp = []
c = []
for l in get_input() + [""]:
    if l == "" and len(c) > 0:
        inp.append(c)
        c = []
    elif l != "":
        c.append(l)

def get_edit_distance(a,b):
    c = 0
    for aa,bb in zip(a,b):
        if aa != bb:
            c+=1

    return c

def find_reflection(l, smudge):
    for inp, fx in [(l, 100), (list(zip(*l)), 1)]:
        for i in range(len(inp)-1):
            cl = get_edit_distance(inp[i], inp[i+1])
            if cl <= smudge:
                matches = True
                for j in range(min(i, len(inp)-i-2)):
                    cl += get_edit_distance(inp[i-j-1], inp[i+2+j])
                    if cl > smudge:
                        matches = False
                        break

                if matches and cl == smudge:
                    return (i+1) * fx

    return 0

p1 = sum(find_reflection(l, 0) for l in inp)
print(p1)

p2 = sum(find_reflection(l, 1) for l in inp)
print(p2)
