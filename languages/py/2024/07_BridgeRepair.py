import itertools, math
from lib import *

inp = get_input()

p1 = 0
p2 = 0
for l in inp:
    r, nums = l.split(": ")
    r, nums = int(r), [int(x) for x in nums.split()] 
    has_p1 = False
    has_p2 = False

    for ops in itertools.product("*+|", repeat=len(nums)-1):
        e = nums[0]
        for i, op in enumerate(ops):
            if op == "*":
                e *= nums[i+1]
            elif op == "+":
                e += nums[i+1]
            elif op == "|":
                #            ---- num of digits in nums[i+1] ----
                e = e * 10**(math.floor(math.log10(nums[i+1]))+1) + nums[i+1]
        if e == r:
            if not has_p1 and "|" not in ops:
                p1 += r
                has_p1 = True
            if not has_p2:
                p2 += r
                has_p2 = True

            if has_p1 and has_p2:
                break

print(p1)
print(p2)
