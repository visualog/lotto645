import csv
import json
from collections import Counter
import numpy as np

file_path = '/Users/visualog/Documents/GitHub/분석/lotto_history.csv'

odd_even_ratios = Counter()
high_low_ratios = Counter()
consecutive_count = 0
sums = []
total_draws = 0

def get_high_low_ratio(numbers):
    low_count = sum(1 for n in numbers if 1 <= n <= 22)
    high_count = 6 - low_count
    return f"{high_count}:{low_count}"

def has_consecutive(numbers):
    sorted_numbers = sorted(numbers)
    for i in range(len(sorted_numbers) - 1):
        if sorted_numbers[i+1] == sorted_numbers[i] + 1:
            return True
    return False

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            total_draws += 1
            
            # Odd/Even Ratio
            ratio_key = '당첨번호_홀짝비율'
            if row.get(ratio_key):
                odd_even_ratios[row[ratio_key]] += 1

            # Main numbers for other calculations
            main_numbers = []
            for i in range(1, 7):
                num_key = f'당첨번호_{i}'
                if row.get(num_key) and row[num_key].isdigit():
                    main_numbers.append(int(row[num_key]))
            
            if len(main_numbers) == 6:
                # High/Low Ratio
                high_low_ratios[get_high_low_ratio(main_numbers)] += 1
                
                # Consecutive Numbers
                if has_consecutive(main_numbers):
                    consecutive_count += 1
            
            # Sum
            sum_key = '당첨번호_합'
            if row.get(sum_key) and row[sum_key].isdigit():
                sums.append(int(row[sum_key]))

except Exception as e:
    print(f"An error occurred: {e}")
    print(json.dumps({})) 
    exit()

# Descriptive stats for Sum
sum_stats = {
    "min": int(np.min(sums)),
    "max": int(np.max(sums)),
    "mean": round(np.mean(sums), 2),
    "median": int(np.median(sums)),
    "std_dev": round(np.std(sums), 2)
}

# Prepare output as a single JSON object
output = {
    "total_draws": total_draws,
    "odd_even_ratios": dict(odd_even_ratios.most_common()),
    "high_low_ratios": dict(high_low_ratios.most_common()),
    "consecutive_stats": {
        "count": consecutive_count,
        "percentage": round((consecutive_count / total_draws) * 100, 2)
    },
    "sum_stats": sum_stats
}

print(json.dumps(output, ensure_ascii=False, indent=2))
