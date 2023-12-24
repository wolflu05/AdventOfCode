import collections, re, itertools
from lib import *

inp = get_input()

HAIL = collections.namedtuple("Hail", ["x","y","z","vx","vy","vz"])

H:list[HAIL] = [HAIL(*[int(a) for a in re.split(r", | @ ", l)]) for l in inp]

def get_intersection(a:HAIL, b:HAIL):
    if b.vx / a.vx * a.vy == b.vy:
        return None

    c = (a.x-b.x)/b.vx
    r = (b.y-a.y+b.vy*c)/(a.vy-b.vy*(a.vx/b.vx))
    s = c + (a.vx/b.vx)*r

    ax, ay = a.x + r*a.vx, a.y + r*a.vy

    return ax,ay,r,s

p1 = 0
A = (7,27) if IS_EXAMPLE else (200000000000000,400000000000000)
for a,b in itertools.combinations(H, r=2):
    r = get_intersection(a, b)
    if r is not None and A[0]<=r[0]<=A[1] and A[0]<=r[1]<=A[1] and r[2] >= 0 and r[3] >= 0:
        p1+=1

print(p1)

from sympy import symbols, Symbol, Eq
from sympy.solvers import solve

ax,ay,az,avx,avy,avz = symbols("ax,ay,az,avx,avy,avz")

ts = []
eq = []
for i, h in enumerate(H[:3]):
    t = Symbol(f"t{i}")
    ts.append(t)

    eq.extend([
        Eq(ax+t*avx, h.x+t*h.vx),
        Eq(ay+t*avy, h.y+t*h.vy),
        Eq(az+t*avz, h.z+t*h.vz),
    ])
r = solve(eq, (ax,ay,az,avx,avy,avz,*ts), dict=True)
assert len(r) == 1
r = r[0]
print(r[ax]+r[ay]+r[az])
