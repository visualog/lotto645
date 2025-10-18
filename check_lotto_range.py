import csv
import sys

file_path = '/Users/visualog/Documents/GitHub/분석/lotto_history.csv'

try:
    rounds = []
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if '회차' in row and row['회차'].isdigit():
                rounds.append(int(row['회차']))
    
    if rounds:
        min_round = min(rounds)
        max_round = max(rounds)
        print(f"로또 과거 데이터 회차 범위: {min_round}회 부터 {max_round}회 까지")
    else:
        print("로또 과거 데이터에서 회차 정보를 찾을 수 없습니다.")

except FileNotFoundError:
    print(f"오류: 파일을 찾을 수 없습니다: {file_path}", file=sys.stderr)
except Exception as e:
    print(f"오류 발생: {e}", file=sys.stderr)
