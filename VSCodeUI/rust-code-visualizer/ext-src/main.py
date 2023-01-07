import json
data = {
  "L1 Data Cache Misses": {
    "labels": ["Totals", "main", "fizzbuzz_to", "fizzbuzz", "is_divisible_by"],
    "datasets": [
      {
        "label": "L1 Data Cache Misses",
        "data": [4879, 0, 0, 18, 0],
        "backgroundColor": "#ff6384"
      }
    ]
  },
  "LL Data Cache Misses": {
    "labels": ["Totals", "main", "fizzbuzz_to", "fizzbuzz", "is_divisible_by"],
    "datasets": [
      {
        "label": "LL Data Cache Misses",
        "data": [3775, 0, 0, 9, 0],
        "backgroundColor": "#ff6384"
      }
    ]
  },
  "Instruction Count": {
    "labels": ["Totals", "main", "fizzbuzz_to", "fizzbuzz", "is_divisible_by"],
    "datasets": [
      {
        "label": "Instruction Count",
        "data": [99407424, 5, 21099951, 71353150, 6500025],
        "backgroundColor": "#ff6384"
      }
    ]
  },
  "Branch Mispredictions": {
    "labels": ["Totals", "main", "fizzbuzz_to", "fizzbuzz", "is_divisible_by"],
    "datasets": [
      {
        "label": "Branch mispredictions",
        "data": [380656, 0, 20, 373480, 1],
        "backgroundColor": "#ff6384"
      }
    ]
  }
}

print(json.dumps(data))
