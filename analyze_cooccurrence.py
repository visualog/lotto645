import csv
import json
from collections import Counter
from itertools import combinations

file_path = '/Users/visualog/Documents/GitHub/분석/lotto_history.csv'

try:
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
                # Generate all pairs from the 6 numbers
                for pair in combinations(sorted(main_numbers), 2):
                    pair_frequencies[pair] += 1

    # Get the top 20 most common pairs
    top_20_pairs = []
    for pair, count in pair_frequencies.most_common(20):
        top_20_pairs.append({
            "pair": f"{pair[0]} - {pair[1]}",
            "count": count
        })

    output = {
        "top_20_cooccurring_pairs": top_20_pairs
    }

except Exception as e:
    print(f"An error occurred: {e}")
    print(json.dumps({}))
    exit()

print(json.dumps(output, ensure_ascii=False, indent=2))
