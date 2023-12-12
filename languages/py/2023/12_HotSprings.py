import functools
from lib import *

inp = get_input()

def count_combinations(string, counts):
    string += "." # append a . to the string, so that a last group will always be closed automatically

    @functools.cache
    def _count_combinations(i, curr_group, curr_group_len):
        def new_group():
            if curr_group_len == 0: # no group ended -> dont increment group, just continue with the next position
                return _count_combinations(i+1, curr_group, 0)

            # if there would be more groups then in counts defined, this is no valid solution
            if curr_group >= len(counts):
                return 0

            # if the length of the current group doesn't match, starting a new one would produce no valid combination
            if curr_group_len != counts[curr_group]:
                return 0

            # a group ended now -> start a new one
            return _count_combinations(i+1, curr_group+1, 0)

        if i >= len(string):
            # all groups and their length are checked not, but there can be still less groups than required for counts
            if curr_group != len(counts): 
                return 0
            
            return 1

        if string[i] == ".":
            return new_group() # try to start a new group

        if string[i] == "#":
            return _count_combinations(i+1, curr_group, curr_group_len+1) # extend current group

        if string[i] == "?":
            return (
                # replace ? with # -> continue group
                _count_combinations(i+1, curr_group, curr_group_len+1) +

                # replace ? with . -> end group here and start a new one
                new_group()
            )

    return _count_combinations(0,0,0)


def solve(fold_count):
    res = 0
    for l in inp:
        springs, counts = l.split()

        springs = "?".join([springs] * fold_count)
        counts=[int(c) for c in counts.split(",")] * fold_count

        res += count_combinations(springs, counts)

    print(res)

solve(1)
solve(5)
