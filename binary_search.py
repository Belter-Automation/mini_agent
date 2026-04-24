def binary_search(nums, target):
    if not all(nums[i] <= nums[i+1] for i in range(len(nums)-1)):
        raise ValueError("Input list must be sorted in ascending order")
    
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
