import csv
import json
from collections import Counter

file_path = '/Users/visualog/Documents/GitHub/분석/lotto_history.csv'

try:
    all_numbers = list(range(1, 46))
    last_seen = {num: 0 for num in all_numbers}
    frequencies = Counter()
    
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        sorted_list = sorted(list(reader), key=lambda row: int(row['회차']))
        
        total_draws = 0
        for row in sorted_list:
            draw_num = int(row['회차'])
            total_draws = draw_num
            
            current_draw_numbers = set()
            for i in range(1, 7):
                num = int(row[f'당첨번호_{i}'])
                current_draw_numbers.add(num)
                frequencies[num] += 1
            
            bonus_num = int(row['보너스번호'])
            current_draw_numbers.add(bonus_num)

            for num in current_draw_numbers:
                last_seen[num] = draw_num

    # Calculate overdue scores (higher for more overdue)
    overdue_scores = {num: total_draws - seen_at for num, seen_at in last_seen.items()}
    
    # Calculate frequency scores (higher for more frequent)
    frequency_scores = {num: frequencies[num] for num in all_numbers}

    # Normalize scores (simple min-max normalization)
    max_freq = max(frequency_scores.values())
    min_freq = min(frequency_scores.values())
    normalized_freq_scores = {num: (score - min_freq) / (max_freq - min_freq) for num, score in frequency_scores.items()}

    max_overdue = max(overdue_scores.values())
    min_overdue = min(overdue_scores.values())
    normalized_overdue_scores = {num: (score - min_overdue) / (max_overdue - min_overdue) for num, score in overdue_scores.items()}

    # Integrated Score Calculation
    integrated_scores = {}
    for num in all_numbers:
        score = 0
        score += normalized_freq_scores.get(num, 0) * 0.4 # Weight frequency more
        score += normalized_overdue_scores.get(num, 0) * 0.3 # Weight overdue
        
        # Bonus for pattern recommendation (from previous step, hardcoded for simplicity)
        if num in [12, 13, 17, 28, 33, 40]: # pattern_recommendation
            score += 0.1
        
        # Bonus for co-occurrence recommendation (from previous step, hardcoded for simplicity)
        if num in [3, 12, 20, 27, 33, 34]: # co_occurrence_recommendation
            score += 0.1

        integrated_scores[num] = score

    # Get top 6 numbers by integrated score
    integrated_recommendation = sorted(integrated_scores.items(), key=lambda item: item[1], reverse=True)[:6]
    integrated_recommendation_numbers = sorted([num for num, score in integrated_recommendation])

    output = {
        "integrated_recommendation": integrated_recommendation_numbers
    }

except Exception as e:
    print(f"An error occurred: {e}")
    print(json.dumps({}))
    exit()

print(json.dumps(output, ensure_ascii=False, indent=2))
