from lib import *

inp = get_input()

nums = []
for l in inp:
    nums.append([int(a) for a in l.split()])

def get_diffs(line):
    line_diffs = []
    for i in range(1, len(line)):
        line_diffs.append(line[i]-line[i-1])

    if len(line_diffs) == 0 or all(a == 0 for a in line_diffs):
        return [line, line_diffs]

    return [line, *get_diffs(line_diffs)]

def extrapolate_seq(nums, right):
    out = []

    for line in nums:
        diffs = get_diffs(line)
        res = []
        for i, diff_line in enumerate(diffs[::-1]):
            if i == 0:
                res.append(0)
            else:
                if right:
                    res.append(diff_line[-1] + res[i-1])
                else:
                    res.append(diff_line[0] - res[i-1])
        out.append(res[-1])

    return sum(out)

print(extrapolate_seq(nums, True))
print(extrapolate_seq(nums, False))
