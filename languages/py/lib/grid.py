from typing import Callable, Literal, Optional, Union

POSITION_TYPE = tuple[int, int]

NEIGHBORS_DICT: dict[str, POSITION_TYPE] = {
    "U": (-1, 0),
    "D": (1, 0),
    "L": (0, -1),
    "R": (0, 1),
    "UL": (-1, -1),
    "UR": (-1, 1),
    "DL": (1, -1),
    "DR": (1, 1),
    "S": (0, 0),
}
NEIGHBORS_DICT_TYPE = Literal["U", "D", "L", "R", "UL", "UR", "DL", "DR", "S"]

def get_positions(direct=True, diagonal=True, includeSelf=False, custom: Optional[list[NEIGHBORS_DICT_TYPE]]=None, include_pos_names=False) -> list[POSITION_TYPE]:
    positions: list[NEIGHBORS_DICT_TYPE] = []

    if custom:
        positions.extend(custom)
    else:
        if direct:
            positions.extend(["U", "D", "L", "R"])
        if diagonal:
            positions.extend(["UL", "UR", "DL", "DR"])
        if includeSelf:
            positions.extend(["S"])

    return [(NEIGHBORS_DICT[p], p) if include_pos_names else NEIGHBORS_DICT[p] for p in positions]

def check_index_exists(matrix: list, *dim: list[int]):
    for d in dim:
        if d < 0 or d > len(matrix) - 1:
            return False
        matrix = matrix[d]

    return True

def iterate_positions(d1: int, d2: int, positions: Union[list[POSITION_TYPE], list[tuple[POSITION_TYPE, str]]], matrix: Optional[list] = None):
    abs_positions: list[POSITION_TYPE] = []

    for _d1, _d2 in positions:
        # add fallback if pos name is defined
        pos_name = None
        if type(_d1) == tuple:
            _d1, _d2, pos_name = *_d1, _d2

        dd1, dd2 = d1 + _d1, d2 + _d2

        if matrix and not check_index_exists(matrix, dd1, dd2):
            continue

        pos = (dd1, dd2)

        if pos_name is not None:
            pos = (pos, pos_name)

        abs_positions.append(pos)

    return abs_positions

def rotate_left(matrix):
    return ["".join(c) for c in zip(*matrix)][::-1]

def rotate_right(matrix):
    return ["".join(c[::-1]) for c in zip(*matrix)]

def rotate_direction(current, direction=1, allowed_directions="URDL"):
    return allowed_directions[(allowed_directions.index(current) + direction) % 4]

def print_grid(grid, fmt=lambda x, _: str(x)):
    for y, row in enumerate(grid):
        out = ""
        for x, col in enumerate(row):
            out += fmt(col, (y,x))
        print(out)

def print_points(p: set[tuple[int, int]] | set[tuple[int, int, str]], *, spacing=0, fmt: str | Callable[[tuple[int, int]], str]="#", return_grid=False):
    min_h, max_h = min(c[0] for c in p) - spacing, max(c[0] for c in p) + spacing
    min_w, max_w = min(c[1] for c in p) - spacing, max(c[1] for c in p) + spacing

    MAP = {}
    for c in p:
        if len(c) == 2:
            if type(fmt) == str:
                MAP[c] = fmt
            else:
                MAP[c] = fmt(c)
        elif len(c) == 3:
            y,x,f = c
            MAP[(y,x)] = f

    res = ""
    for y in range(min_h, max_h+1):
        for x in range(min_w, max_w+1):
            if (y,x) in MAP:
                res += str(MAP[(y,x)])
            elif (y,x) == (0,0):
                res += "x"
            else:
                res += "."
        res+="\n"

    if not return_grid:
        print(res.strip())
    else:
        return res.strip()

def find_grid(grid, char):
    for y, row in enumerate(grid):
        for x, col in enumerate(row):
            if col == char:
                return y, x

def copy_grid(G):
    return [[j for j in x] for x in G]
