import pytest
from binary_search import binary_search


def test_found_middle():
    assert binary_search([1, 2, 3, 4, 5], 3) == 2


def test_found_first():
    assert binary_search([1, 2, 3, 4, 5], 1) == 0


def test_found_last():
    assert binary_search([1, 2, 3, 4, 5], 5) == 4


def test_missing():
    assert binary_search([1, 2, 3, 4, 5], 6) == -1


def test_empty_list():
    assert binary_search([], 1) == -1


def test_unsorted_raises():
    with pytest.raises(ValueError):
        binary_search([3, 2, 1], 1)
