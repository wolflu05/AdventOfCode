from typing import TypeVar


T_CHUNK = TypeVar("T_CHUNK")
def chunk_to_size(l: list[T_CHUNK], size: int):
    """Creates a list containing size sub-lists of 'equal' length.
    
    Example:
        chunk_to_size([0,1,2,3,4,5,6,7,8,9], 3) -> [[0,3,6,9], [1,4,7], [2,5,8]]
    """
    for i in range(0, size):
        yield l[i::size]

def chunk_by_n(l: list[T_CHUNK], n: int):
    """Creates a list containing sub-lists with len <= 3.
    
    Example:
        chunk_by_n([0,1,2,3,4,5,6,7,8,9], 3) -> [[0,1,2], [3,4,5], [6,7,8], [9]] 
    """
    for i in range(0, len(l), n):
        yield l[i:min(n+i, len(l))]
