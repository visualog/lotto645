import csv
import json
from collections import Counter
import random

file_path = '/Users/visualog/Documents/GitHub/분석/lotto_history.csv'

def generate_combination_for_sum(target_sum, existing_numbers=None, max_attempts=1000):
    """
    Generates a combination of 6 unique numbers that sum to target_sum.
    Tries to balance odd/even and high/low.
    """
    if existing_numbers is None:
        existing_numbers = set()

    for _ in range(max_attempts):
        combination = set()
        remaining_sum = target_sum
        
        # Try to pick numbers to balance odd/even and high/low
        # This is a very simplified heuristic and might not always find a solution
        # For a robust solution, a more sophisticated algorithm (e.g., backtracking) is needed.
        
        # Attempt to pick 3 low (1-22) and 3 high (23-45) numbers
        low_nums = random.sample(range(1, 23), 3)
        high_nums = random.sample(range(23, 46), 3)
        
        temp_combination = sorted(list(set(low_nums + high_nums)))
        
        if len(temp_combination) == 6:
            current_sum = sum(temp_combination)
            if current_sum == target_sum:
                return sorted(list(temp_combination))
            elif current_sum < target_sum:
                # Try to increase sum by swapping smaller numbers with larger ones
                diff = target_sum - current_sum
                for i in range(len(temp_combination) -1, -1, -1):
                    num = temp_combination[i]
                    if num + diff <= 45 and num + diff not in temp_combination:
                        temp_combination[i] = num + diff
                        return sorted(list(temp_combination))
            else: # current_sum > target_sum
                # Try to decrease sum by swapping larger numbers with smaller ones
                diff = current_sum - target_sum
                for i in range(len(temp_combination)):
                    num = temp_combination[i]
                    if num - diff >= 1 and num - diff not in temp_combination:
                        temp_combination[i] = num - diff
                        return sorted(list(temp_combination))
        
        # Fallback to random picking if heuristic fails
        while len(combination) < 6:
            num = random.randint(1, 45)
            if num not in combination:
                combination.add(num)
        
        if sum(combination) == target_sum:
            return sorted(list(combination))
            
    return None # Could not find a combination

try:
    sums_counter = Counter()
    all_sums = []
    
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            sum_val = int(row['당첨번호_합'])
            sums_counter[sum_val] += 1
            all_sums.append(sum_val)

    # --- Top 5 Most Frequent Sums ---
    top_5_sums = []
    for sum_val, count in sums_counter.most_common(5):
        # Generate a sample combination for this sum
        combo = generate_combination_for_sum(sum_val)
        top_5_sums.append({
            "sum": sum_val,
            "count": count,
            "recommendation": combo if combo else "조합 생성 실패"
        })

    # --- Fixed Sum Range Recommendations ---
    # These are hardcoded for simplicity and to avoid complex generation logic
    # For a real application, these would be pre-calculated or use a more robust generator.
    fixed_sum_recommendations = {
        "low_sum": {
            "range": "60-90",
            "recommendation": [3, 7, 12, 15, 20, 25] # Sum 82
        },
        "medium_sum": {
            "range": "120-150",
            "recommendation": [10, 15, 22, 28, 33, 40] # Sum 148
        },
        "high_sum": {
            "range": "180-210",
            "recommendation": [25, 30, 35, 38, 40, 42] # Sum 210
        }
    }

    output = {
        "top_5_frequent_sums": top_5_sums,
        "fixed_sum_recommendations": fixed_sum_recommendations
    }

except Exception as e:
    print(f"An error occurred: {e}")
    print(json.dumps({}))
    exit()

print(json.dumps(output, ensure_ascii=False, indent=2))
