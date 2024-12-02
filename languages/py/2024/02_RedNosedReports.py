from lib import *

inp = get_input()

def check(l):
    last = l[0]
    for el in l[1:]:
        if el - last < 1 or el - last > 3:
            return False

        last = el

    return True


p1=0
p2=0

for l in inp:
    x = [int(x) for x in l.split()]

    # --- part 1
    if check(x) or check(list(reversed(x))):
        p1 += 1

    # --- part 2
    for n_i in range(len(x)):
        n = x[:n_i] + x[n_i+1:]

        if check(n) or check(list(reversed(n))):
            p2 += 1
            break

print(p1)
print(p2)
