def euclidean_algorithm(a, b):
    """
    Calculate x and y so that:
        a * x + b * y = gcd(a, b)

    gcd, x, y = euclidean_algorithm(a, b)
    """
    if a % b == 0:
        return b, 0, 1

    d, k, l = euclidean_algorithm(b, a % b)

    if b % (a % b) == 0:
        return d, 1, -(a // b)

    return d, l, k + l * (-(a // b))

def chinese_remainder(nums: list[tuple[int, int]]):
    """
    Calculate the congruence system in form:
        a = r1 (mod m1)
        ...
        a = rk (mod mk)

        a = chinese_remainder([
            (r1, m1),
            ...
            (rk, mk),
        ])
    """
    if len(nums) == 1:
        return nums[0][0] % nums[0][1]
    elif len(nums) == 2:
        r1, m1 = nums[0][0] % nums[0][1], nums[0][1]
        r2, m2 = nums[1][0] % nums[1][1], nums[1][1]

        _, k, l = euclidean_algorithm(m1, m2)
        return (r2 * m1 * k + r1 * m2 * l) % (m1 * m2)
    else:
        r = chinese_remainder(nums[0:2])
        return chinese_remainder([(r, nums[0][1] * nums[1][1])] + nums[2:])
