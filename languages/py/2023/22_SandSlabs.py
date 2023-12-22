import collections, re
from lib import *

def xy_intersect(c1: "Cube", c2: "Cube"):
    return c1.x1 <= c2.x2 and c1.x2 >= c2.x1 and c1.y1 <= c2.y2 and c1.y2 >= c2.y1

class Cube:
    def __init__(self, x1,y1,z1,x2,y2,z2) -> None:
        self.x1=x1
        self.y1=y1
        self.z1=z1
        self.x2=x2
        self.y2=y2
        self.z2=z2
    
    def calc_intersects(self, C: list["Cube"]):
        self.intersects = set([a for a in C if a != self and xy_intersect(self, a)])

    intersects: set["Cube"] = set()

# parse input to cubes
inp = get_input()
C: list[Cube] = [Cube(*[int(a) for a in re.split(r",|~", l)]) for l in inp]
for c in C:
    c.calc_intersects(C)

def fall(C: list[Cube]):
    while True:
        has_fallen = False
        for c in C:
            f = 0
            for c2 in c.intersects:
                if c.z1 >= c2.z2+1:
                    if f < c2.z2:
                        f = c2.z2
            d = c.z1-f-1 # distance this cube can fall

            if d > 0:
                c.z1-=d
                c.z2-=d
                has_fallen = True

        if not has_fallen:
            break # loop until no brick falls anymore for one complete iteration

# simulate fall, so that support can be calculated more easily in the next step
fall(C)

# Generate support structure graph
G: dict[Cube, set[Cube]] = {}                       # maps cube -> is supported by
IG = collections.defaultdict[Cube, set[Cube]](set)  # maps cube -> is support for
for c in C:
    # find all cubes that can possibly support this cube, because they overlap on x,y and are underneath
    p = [a for a in c.intersects if a != c and xy_intersect(c, a) and c.z1 > a.z2]
    support = set()
    if len(p):
        max_s = max(p, key=lambda x: x.z2)
        for a in p:
            if a.z2 == max_s.z2: # filters out only the cubes that directly supports this cube
                support.add(a)
    
    # save support structure to graph
    G[c] = support
    for s in support:
        IG[s].add(c)

p1=0
p2=0

# start at each cube in the graph and count how many other cubes are influenced if that cube is disintegrated 
for c in C:
    Q = [c]
    F = set()

    cnt = 0
    while len(Q):
        current_cube = Q.pop(0)
        F.add(current_cube)

        for cube_is_support_for in IG[current_cube]:
            # check if current_cube is the only support for cube_is_support_for
            if all(a in F for a in G[cube_is_support_for]):
                assert current_cube in G[cube_is_support_for]
                Q.append(cube_is_support_for)
                cnt += 1

    p1+=1 if cnt == 0 else 0
    p2+=cnt


print(p1)
print(p2)
