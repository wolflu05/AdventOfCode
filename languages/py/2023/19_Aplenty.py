import re
from lib import *

inp = get_input()

P = []
W = {}
e = False
for l in inp:
    if l == "":
        e = True
    else:
        if e: # workflows are already stored, now save the parts
            p = {}
            for a in l[1:-1].split(","):
                k, v = a.split("=")
                p[k] = int(v)
            P.append(p)
        else:
            m = re.match(r"(\w+)\{(.*)\}", l)
            w = []
            for a in m.group(2).split(","):
                n = re.split(r"(<|>|:)", a)
                if len(n) == 5:
                    n[2] = int(n[2])
                w.append(n)
            W[m.group(1)] = w

# --- part 1
def process_workflow(p, w_name):
    w = W[w_name]

    def call_next_wf(wf):
        if wf == "A":
            return True
        if wf == "R":
            return False
        return process_workflow(p, wf)
    
    for cond in w:
        if len(cond) == 1:
            return call_next_wf(cond[0])
        if len(cond) == 5:
            p_name, op, val, _, wf = cond
            if op == "<" and p[p_name] < val:
                return call_next_wf(wf)
            if op == ">" and p[p_name] > val:
                return call_next_wf(wf)
        assert len(cond) in [1,5]

p1=sum(sum(p.values()) for p in P if process_workflow(p, "in"))
print(p1)

# --- part 2
def get_combinations(w_name, combs):
    w = W[w_name]

    def call_next_wf(wf, combs):
        if wf == "A":
            return combs
        if wf == "R":
            return []
        return get_combinations(wf, combs)

    def change_clone_comb(com, key, val):
        new_comb = dict(com.items())
        new_comb[key] = val
        return new_comb

    res = []
    combs = [dict(c.items()) for c in combs]
    for cond in w:
        if len(cond) == 1:
            res.extend(call_next_wf(cond[0], combs))
        if len(cond) == 5:
            p_name, op, val, _, wf = cond
            to_rem = []
            to_app = []
            for com in combs:
                mi, ma = com[p_name]
                if op == "<" and mi < val:
                    n_com = change_clone_comb(com, p_name, (mi, min(ma, val-1)))
                    res.extend(call_next_wf(wf, [n_com]))
                    to_rem.append(com)
                    if ma > val:
                        n_com = change_clone_comb(com, p_name, (val, ma))
                        to_app.append(n_com)
                if op == ">" and ma > val:
                    n_com = change_clone_comb(com, p_name, (max(mi, val+1), ma))
                    res.extend(call_next_wf(wf, [n_com]))
                    to_rem.append(com)
                    if mi < val:
                        n_com = change_clone_comb(com, p_name, (mi, val))
                        to_app.append(n_com)

            for t in to_rem:
                combs.remove(t)
            for a in to_app:
                combs.append(a)

    return res


combs = get_combinations("in", [{"x": (1,4000), "m":(1,4000),"a":(1,4000),"s":(1,4000)}])

p2 = 0
for c in combs:
    cl = 1
    for mi,ma in c.values():
        cl*=(ma+1)-mi
    p2+=cl
print(p2)
