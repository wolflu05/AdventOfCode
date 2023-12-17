import sys
from .grid import *
from .lists import *
from .ansi import *

def get_input(strip=True):
    inp = []
    with open(sys.argv[1]) as f:
        inp = [l.strip() if strip else l for l in f.readlines()]

    return inp
