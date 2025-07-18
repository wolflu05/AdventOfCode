import sys, os
from .grid import *
from .lists import *
from .ansi import *
from .misc import *

def get_input(strip=True, split_sections=False, lines_to_list=False):
    inp = []
    with open(sys.argv[1]) as f:
        for l in f.readlines():
            if strip:
                l = l.strip()

            if lines_to_list:
                l = list(l)

            inp.append(l)

    if split_sections:
        sections = []
        start = 0
        for i, lst in enumerate(inp):
            if len(lst) == 0:
                sections.append(inp[start:i])
                start = i+1

        if start < len(inp):
            sections.append(inp[start:])

        return sections

    return inp

IS_EXAMPLE = os.getenv("AOC_EXAMPLE", "false") == "true"
FLAGS = [x.lower() for x in os.getenv("AOC_FLAGS", "").split(",") if x]
DEBUG = "debug" in FLAGS