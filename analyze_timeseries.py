import csv
import json

file_path = '/Users/visualog/Documents/GitHub/분석/lotto_history.csv'
output_data = []
window = 52 
sample_rate = 10

try:
    sums = []
    draws = []
    # Use 'utf-8-sig' to handle BOM
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        sorted_list = sorted(list(reader), key=lambda row: int(row['회차']))
        for row in sorted_list:
            if row.get('회차') and row.get('당첨번호_합'):
                draws.append(int(row['회차']))
                sums.append(int(row['당첨번호_합']))

    moving_averages = []
    for i in range(len(sums)):
        if i < window - 1:
            moving_averages.append(None)
        else:
            window_slice = sums[i - window + 1 : i + 1]
            avg = round(sum(window_slice) / window, 2)
            moving_averages.append(avg)

    for i in range(len(draws)):
        if i % sample_rate == 0:
            output_data.append({
                "name": f"{draws[i]}회",
                "sum": sums[i],
                "moving_average": moving_averages[i]
            })

except Exception as e:
    print(f"An error occurred: {e}")
    print(json.dumps([])) 
    exit()

print(json.dumps(output_data, ensure_ascii=False, indent=2))