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

    # Calculate overdue numbers
    overdue = {num: total_draws - seen_at for num, seen_at in last_seen.items()}
    sorted_overdue = sorted(overdue.items(), key=lambda item: item[1], reverse=True)
    
    # Get predictions
    overdue_prediction = [num for num, gap in sorted_overdue[:6]]
    hot_prediction = [num for num, count in frequencies.most_common(6)]

    output = {
        "hot_numbers_prediction": sorted(hot_prediction),
        "overdue_numbers_prediction": sorted(overdue_prediction)
    }

except Exception as e:
    print(f"An error occurred: {e}")
    print(json.dumps({}))
    exit()

print(json.dumps(output, ensure_ascii=False, indent=2))
