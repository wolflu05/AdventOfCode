from lib import *

inp = get_input()

WORD_NUMS = "one_two_three_four_five_six_seven_eight_nine".split("_")

def solve(p2=False):
    su=[]
    for l in inp:
        nums = []

        for i in range(len(l)):
            if l[i].isdigit():
                nums.append(l[i])
            if p2:
                for n, w in enumerate(WORD_NUMS):
                    if l.startswith(w, i):
                        nums.append(str(n + 1))
                        break
        if len(nums) == 0:
            print("-")
            return # don't error if run with second example input

        su.append(int(nums[0] + nums[-1]))

    print(sum(su))

solve()
solve(True)
