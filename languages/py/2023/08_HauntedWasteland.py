import re, math
from lib import *

inp = get_input()

graph = {}
instr = [int(l == "R") for l in inp[0]]

p1 = ["AAA"]
p2 = []

for l in inp[2:]:
    this, left, right = re.split(" = \(|, |\)", l)[:-1]
    graph[this] = (left,right)
    if this.endswith("A"):
        p2.append(this)


def solve(starts: list[str], end: str):
    ip = 0
    counts = [0] * len(starts)
    while not all([a.endswith(end) for a  in starts]):
        for i, node in enumerate(starts):
            if node.endswith(end):
                continue

            if node not in graph:
                print("-") # If the node is not in the graph, exit
                return

            starts[i] = graph[node][instr[ip]]
            counts[i] += 1

        ip = (ip + 1) % len(instr)

    print(math.lcm(*counts))

solve(p1, "ZZZ")
solve(p2, "Z")
