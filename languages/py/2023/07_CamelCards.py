import collections, functools
from lib import *

inp = get_input()

cards = []
for l in inp:
    c, n = l.split()
    cards.append((c, int(n)))

def solve(strength, use_jokers):
    def get_kind(c):
        cnt = collections.Counter(c)
        cnt_lst = list(cnt.items())
        cnt_lst.sort(key=lambda x: x[1], reverse=True)

        # replace highest card count with joker card count
        if use_jokers and "J" in c and len(cnt_lst) > 1:
            if cnt_lst[0][0] == "J": # If the highest count is a joker, push it to the second highest
                cnt_lst[0], cnt_lst[1] = cnt_lst[1], cnt_lst[0]
            cnt_lst[0] = (cnt_lst[0][0], cnt_lst[0][1]+cnt["J"])
            cnt_lst = [m for m in cnt_lst if m[0] != "J"]
        
        if len(cnt_lst) == 1:
            return 7  # Five of a kind 
        elif cnt_lst[0][1] == 4:
            return 6  # Four of a kind
        elif cnt_lst[0][1] == 3 and len(cnt_lst) == 2:
            return 5  # Full house
        elif cnt_lst[0][1] == 3 and len(cnt_lst) == 3:
            return 4  # Three of a kind
        elif cnt_lst[0][1] == 2 and cnt_lst[1][1] == 2:
            return 3  # Two pair
        elif cnt_lst[0][1] == 2 and len(cnt_lst) == 4:
            return 2  # One pair
        elif len(cnt_lst) == 5:
            return 1  # High card

        assert False, "we shouldn't end here, even if a joker was used"

    def compare(a,b):
        ac, _av, bc, _bv = *a, *b

        a_eqj = get_kind(ac)
        b_eqj = get_kind(bc)

        if a_eqj > b_eqj:
            return 1
        elif a_eqj < b_eqj:
            return -1
        
        # equal, now the strengths decide
        for acc, bcc in zip(ac, bc):
            ai = strength.index(acc)
            bi = strength.index(bcc)
            if ai > bi:
                return 1
            elif ai < bi:
                return -1

        assert False, f"{ac} == {bc}, both cards have equal strengths, not defined how to continue, this shouldn't happen."

    sorted_cards = sorted(cards, key=functools.cmp_to_key(compare))

    res = 0
    for i, (c, v) in enumerate(sorted_cards):
        res += v * (i + 1)

    print(res)


STRENGTH_P1 = "A, K, Q, J, T, 9, 8, 7, 6, 5, 4, 3, 2".split(", ")[::-1]
STRENGTH_P2 = "A, K, Q, T, 9, 8, 7, 6, 5, 4, 3, 2, J".split(", ")[::-1]

solve(STRENGTH_P1, False)
solve(STRENGTH_P2, True)
