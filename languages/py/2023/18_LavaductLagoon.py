from lib import *

inp = get_input()

def get_points_perimeter(inp, p2=False):
    x,y = 0,0
    points = [(x,y)]
    perimeter = 0

    for l in inp:
        d, c, col = l.split()
        c = int(c)

        if p2: # for p2 color and direction information are swapped
            d = {"0":"R","1":"D","2":"L","3":"U"}[col[7]]
            c = int(col[2:7], base=16)

        perimeter+=c

        if d == "R":
            x+=c
        if d == "D":
            y+=c
        if d == "L":
            x-=c
        if d == "U":
            y-=c
        points.append((x,y))

    return points, perimeter

def get_area(inp, p2=False):
    points, perimeter = get_points_perimeter(inp, p2)

    x_l = []
    y_l = []
    for (x,y), (nx,ny) in zip(points, points[1:]+[points[0]]):
        x_l.append(x*ny)
        y_l.append(y*nx)

    area = abs(sum(x_l)-sum(y_l))//2
    print(area+perimeter//2+1)

get_area(inp)
get_area(inp, True)
