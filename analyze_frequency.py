
import csv
from collections import Counter
import sys

file_path = '/Users/visualog/Documents/GitHub/분석/lotto_history.csv'
main_numbers = Counter()
bonus_numbers = Counter()
total_draws = 0

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        data = list(reader)
        if data:
            total_draws = data[-1].get('회차', len(data))

        for row in data:
            # Main numbers
            for i in range(1, 7):
                num_key = f'당첨번호_{i}'
                if row.get(num_key) and row[num_key].isdigit():
                    main_numbers[int(row[num_key])] += 1
            # Bonus number
            if row.get('보너스번호') and row['보너스번호'].isdigit():
                bonus_numbers[int(row['보너스번호'])] += 1
except FileNotFoundError:
    print(f"Error: File not found at {file_path}", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"An error occurred: {e}", file=sys.stderr)
    sys.exit(1)

print("--- 로또 번호 빈도 분석 결과 ---")
print(f"분석 대상 회차: 1회 ~ {total_draws}회")

print("\n--- 1. 당첨 번호 출현 빈도 (상위 10개) ---")
for num, count in main_numbers.most_common(10):
    print(f"번호 {num:2d}: {count}회")

print("\n--- 2. 당첨 번호 출현 빈도 (하위 10개) ---")
for num, count in main_numbers.most_common()[-10:]:
    print(f"번호 {num:2d}: {count}회")

print("\n--- 3. 보너스 번호 출현 빈도 (상위 5개) ---")
for num, count in bonus_numbers.most_common(5):
    print(f"번호 {num:2d}: {count}회")

print("\n--- 4. 보너스 번호 출현 빈도 (하위 5개) ---")
for num, count in bonus_numbers.most_common()[-5:]:
    print(f"번호 {num:2d}: {count}회")

all_lotto_numbers = set(range(1, 46))
appeared_numbers = set(main_numbers.keys())
unappeared_numbers = all_lotto_numbers - appeared_numbers
if unappeared_numbers:
    print("\n--- 5. 한 번도 나오지 않은 번호 ---")
    print(', '.join(map(str, sorted(list(unappeared_numbers)))))
