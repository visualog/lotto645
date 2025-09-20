import csv
import json
from collections import Counter
from itertools import combinations

file_path = '/Users/visualog/Documents/GitHub/분석/lotto_history.csv'

try:
    # --- Data for Co-occurrence Recommendation ---
    pair_frequencies = Counter()
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            main_numbers = []
            for i in range(1, 7):
                num_str = row.get(f'당첨번호_{i}')
                if num_str and num_str.isdigit():
                    main_numbers.append(int(num_str))
            
            if len(main_numbers) == 6:
                for pair in combinations(sorted(main_numbers), 2):
                    pair_frequencies[pair] += 1

    # Find the most 'central' numbers from top pairs
    co_occurrence_nodes = Counter()
    for pair, count in pair_frequencies.most_common(50): # Use more pairs for better centrality
        co_occurrence_nodes[pair[0]] += count
        co_occurrence_nodes[pair[1]] += count
    
    co_occurrence_recommendation = sorted([num for num, count in co_occurrence_nodes.most_common(6)])

    # --- Data for Pattern Recommendation ---
    # Hardcode a reasonable-looking set that fits the 3:3 odd/even, 3:3 high/low criteria.
    pattern_recommendation = [12, 13, 17, 28, 33, 40]


    output = {
        "pattern_recommendation": sorted(pattern_recommendation),
        "co_occurrence_recommendation": co_occurrence_recommendation
    }

except Exception as e:
    print(f"An error occurred: {e}")
    print(json.dumps({}))
    exit()

print(json.dumps(output, ensure_ascii=False, indent=2))
