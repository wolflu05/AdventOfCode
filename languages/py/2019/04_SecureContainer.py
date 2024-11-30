from lib import *

a,b = [int(x) for x in get_input()[0].split('-')]


def is_valid(x):
    for i in range(0, len(str(x))-1):
        if str(x)[i] > str(x)[i+1]:
            return False, False
    
    fnd1 = False
    fnd2 = False
    for s in set(str(x)):
        c = str(x).count(s)

        if c == 2:
            fnd2 = True
        if c > 1:
            fnd1 = True

    return fnd1, fnd2

p1 = 0
p2 = 0

for x in range(a, b+1):
    r1, r2 = is_valid(x)
    if r1:
        p1 += 1
    if r2:
        p2 += 1

print(p1)
print(p2)

# Part 1
assert is_valid(111111) == (True, False)
assert is_valid(223450) == (False, False)
assert is_valid(123789) == (False, False)

# Part 2
assert is_valid(112233) == (True, True)
assert is_valid(123444) == (True, False)
assert is_valid(111122) == (True, True)
