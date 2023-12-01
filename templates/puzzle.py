import sys

inp = []
with open(sys.argv[1]) as f:
    inp = [l.strip() for l in f.readlines()]

for l in inp:
    print(l)
