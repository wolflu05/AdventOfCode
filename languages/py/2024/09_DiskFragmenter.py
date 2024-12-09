import sys, collections, re, itertools, functools, math
from lib import *

inp = get_input()[0]

File = collections.namedtuple("File", ["size", "id"])

R: list[File] = []
file_id = 0
for i,c in enumerate(inp):
    if i%2==0:
        R.append(File(int(c), file_id))
        file_id += 1
    else:
        R.append(File(int(c), "."))

# helper to print files list
def ff(R: list[File]):
    return "".join(str(r.id)*r.size for r in R)

def p1(R: list[File]):
    # defragment files into smaller files with size=1
    R = [File(1, r.id) for r in R for _ in range(r.size)]

    l = 0
    r = len(R) - 1

    while l <= r:
        if R[l].id != ".":
            l += 1
            continue
        if R[r].id == ".":
            r -= 1
            continue
        
        R[l], R[r] = R[r], R[l]

        r-=1
        l+=1

    return R

def p2(R: list[File]):
    curr_file = file_id - 1  # start with last file (calc max used file id)
    r = len(R) - 1
    while curr_file > 0:
        if R[r].id == curr_file:
            l = 0
            while l <= r:
                if R[l].id == "." and R[l].size >= R[r].size:
                    R.insert(l, R[r])
                    R[l+1] = File(R[l+1].size - R[r+1].size, R[l+1].id)
                    R[r+1] = File(R[r+1].size, ".")
                    if R[l+1].size == 0:
                        del R[l+1]
                    curr_file -= 1
                    r = len(R)-1  # reset right pointer
                    break
                else:
                    l += 1
            else:
                curr_file -= 1
        else:
            r -= 1

    return R

def checksum(R: list[File]):
    res = 0
    idx = 0
    for f in R:
        for _ in range(f.size):
            if f.id != ".":
                res += idx * f.id
            idx += 1

    return res

print(checksum(p1(R[:])))
print(checksum(p2(R[:])))
