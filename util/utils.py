from typing import Literal, Optional, Union

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

def iterate_positions(d1: int, d2: int, positions: Union[list[POSITION_TYPE], list[tuple[POSITION_TYPE, str]]], matrix: Optional[list]):
    abs_positions: list[POSITION_TYPE] = []

    for _d1, _d2 in positions:
        # add fallback if pos name is defined
        pos_name = None
        if type(_d1) == tuple:
            _d1, _d2, pos_name = *_d1, d2

        dd1, dd2 = d1 + _d1, d2 + _d2

        if matrix and not check_index_exists(matrix, dd1, dd2):
            continue

        pos = (dd1, dd2)

        if pos_name is not None:
            pos = (pos, pos_name)

        abs_positions.append(pos)

    return abs_positions
