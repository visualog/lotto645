import csv
import json
from collections import Counter
from itertools import combinations
import random
import os
import uvicorn
from datetime import datetime

from fastapi import FastAPI, Query
from typing import List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Loading and Preprocessing (Run once on startup) ---
LOTTO_HISTORY_FILE = "lotto_history.csv"

# --- Global variables ---
hot_numbers = []
cold_numbers = []
hot_bonus_numbers = []
cold_bonus_numbers = []
pattern_stats = {}
time_series_data = []
ml_predictions = {}
co_occurrence_data = []
phase1_recommendations = {}
integrated_recommendation = []
sum_recommendations = {}
all_winning_numbers = []
main_numbers_counter = Counter()
sums_counter = Counter()

# --- Helper Functions ---
def generate_combination_for_sum_simple(target_sum, max_attempts=1000):
    for _ in range(max_attempts):
        combo = random.sample(range(1, 46), 6)
        if sum(combo) == target_sum: return sorted(combo)
    return "조합 생성 실패"

def generate_combination_in_sum_range(min_sum: int, max_sum: int, max_attempts=10000):
    weighted_numbers = []
    if main_numbers_counter:
        for num, count in main_numbers_counter.items():
            weighted_numbers.extend([num] * count)

    if not weighted_numbers:
        for _ in range(max_attempts):
            combo = random.sample(range(1, 46), 6)
            if min_sum <= sum(combo) <= max_sum:
                return sorted(combo)
        return "조합 생성 실패"

    for _ in range(max_attempts):
        combo = set()
        while len(combo) < 6:
            combo.add(random.choice(weighted_numbers))
        
        combo = list(combo)
        if min_sum <= sum(combo) <= max_sum:
            return sorted(combo)
            
    return "조합 생성 실패"

def load_and_analyze_data():
    global hot_numbers, cold_numbers, hot_bonus_numbers, cold_bonus_numbers
    global pattern_stats, time_series_data, ml_predictions, co_occurrence_data
    global phase1_recommendations, integrated_recommendation, sum_recommendations, all_winning_numbers, main_numbers_counter, sums_counter

    # --- Reset global variables ---
    hot_numbers, cold_numbers, hot_bonus_numbers, cold_bonus_numbers = [], [], [], []
    pattern_stats, time_series_data, co_occurrence_data = {}, [], []
    ml_predictions, phase1_recommendations, sum_recommendations = {}, {}, {}
    integrated_recommendation = []
    all_winning_numbers = []
    pair_frequencies = Counter()
    main_numbers_counter.clear()
    sums_counter.clear()

    try:
        with open(LOTTO_HISTORY_FILE, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            
            bonus_numbers_counter = Counter()
            last_seen = {num: 0 for num in range(1, 46)}
            all_sums = []
            odd_even_ratios_counter = Counter()
            high_low_ratios_counter = Counter()
            consecutive_count = 0
            total_draws = 0

            valid_rows = [row for row in reader if row and row.get('회차') and '회' in row['회차']]
            sorted_list = sorted(valid_rows, key=lambda r: int(r['회차'].replace('회', '')))

            for i, row in enumerate(sorted_list):
                try:
                    draw_num = int(row['회차'].replace('회', ''))
                    total_draws = draw_num

                    numbers_str = row['당첨번호']
                    main_nums = [int(n.strip()) for n in numbers_str.split(',')]
                    all_winning_numbers.append(main_nums)
                    
                    current_draw_numbers = set(main_nums)
                    for num in main_nums:
                        main_numbers_counter[num] += 1

                    bonus_num_str = row.get('보너스번호')
                    if bonus_num_str and bonus_num_str.isdigit():
                        bonus_num = int(bonus_num_str)
                        bonus_numbers_counter[bonus_num] += 1
                        current_draw_numbers.add(bonus_num)

                    for num in current_draw_numbers:
                        last_seen[num] = draw_num
                    
                    sum_val = sum(main_nums)
                    all_sums.append(sum_val)
                    sums_counter[sum_val] += 1

                    odd_count = sum(1 for n in main_nums if n % 2 != 0)
                    odd_even_ratios_counter[f"{odd_count}:{6-odd_count}"] += 1

                    low_count = sum(1 for n in main_nums if 1 <= n <= 22)
                    high_low_ratios_counter[f"{6-low_count}:{low_count}"] += 1
                    
                    sorted_nums = sorted(main_nums)
                    if any(sorted_nums[j+1] == sorted_nums[j] + 1 for j in range(len(sorted_nums) - 1)):
                        consecutive_count += 1

                    for pair in combinations(sorted_nums, 2):
                        pair_frequencies[pair] += 1

                except Exception as e:
                    print(f"CRITICAL: Failed to process row {i + 1}. Data: {row}. Error: {e}")
                    continue

        if not main_numbers_counter:
            print("CRITICAL: No data was processed. All counters are empty.")
            return

        hot_numbers.extend([{"number": num, "count": count} for num, count in main_numbers_counter.most_common(10)])
        cold_numbers.extend([{"number": num, "count": count} for num, count in main_numbers_counter.most_common()[-10:]])
        hot_bonus_numbers.extend([{"number": num, "count": count} for num, count in bonus_numbers_counter.most_common(5)])
        cold_bonus_numbers.extend([{"number": num, "count": count} for num, count in bonus_numbers_counter.most_common()[-5:]])

        pattern_stats["total_draws"] = total_draws
        pattern_stats["odd_even_ratios"] = dict(odd_even_ratios_counter.most_common())
        pattern_stats["high_low_ratios"] = dict(high_low_ratios_counter.most_common())
        pattern_stats["consecutive_stats"] = {
            "count": consecutive_count,
            "percentage": round((consecutive_count / total_draws) * 100, 2) if total_draws > 0 else 0
        }
        if all_sums:
            pattern_stats["sum_stats"] = {
                "min": int(min(all_sums)), "max": int(max(all_sums)),
                "mean": round(sum(all_sums) / len(all_sums), 2),
                "median": int(sorted(all_sums)[len(all_sums) // 2]),
                "std_dev": round((sum((x - (sum(all_sums) / len(all_sums))) ** 2 for x in all_sums) / len(all_sums)) ** 0.5, 2)
            }

        time_series_data_raw = []
        window_size = 52
        sample_rate = 10
        draws_ts = list(range(1, total_draws + 1))
        moving_averages = [round(sum(all_sums[max(0, i - window_size + 1):i + 1]) / len(all_sums[max(0, i - window_size + 1):i + 1]), 2) if i >= window_size - 1 else None for i in range(len(all_sums))]
        for i in range(len(draws_ts)):
            if i % sample_rate == 0 and i < len(all_sums) and i < len(moving_averages):
                time_series_data_raw.append({"name": f"{draws_ts[i]}회", "sum": all_sums[i], "moving_average": moving_averages[i]})
        time_series_data.extend(time_series_data_raw)

        overdue = {num: total_draws - seen_at for num, seen_at in last_seen.items()}
        ml_predictions["hot_numbers_prediction"] = sorted([num for num, count in main_numbers_counter.most_common(6)])
        ml_predictions["overdue_numbers_prediction"] = sorted([num for num, gap in sorted(overdue.items(), key=lambda item: item[1], reverse=True)[:6]])

        co_occurrence_data.extend([{"pair": f"{p[0]} - {p[1]}", "count": c} for p, c in pair_frequencies.most_common(20)])

        co_occurrence_nodes = Counter()
        for pair, count in pair_frequencies.most_common(50):
            co_occurrence_nodes.update({pair[0]: count, pair[1]: count})
        phase1_recommendations["pattern"] = sorted([12, 13, 17, 28, 33, 40])
        phase1_recommendations["co_occurrence"] = sorted([num for num, count in co_occurrence_nodes.most_common(6)])

        integrated_scores = Counter()
        if main_numbers_counter:
            max_freq, min_freq = max(main_numbers_counter.values()), min(main_numbers_counter.values())
            max_overdue, min_overdue = max(overdue.values()), min(overdue.values())
            for num in range(1, 46):
                norm_freq = (main_numbers_counter.get(num, 0) - min_freq) / (max_freq - min_freq) if (max_freq - min_freq) > 0 else 0
                norm_overdue = (overdue.get(num, 0) - min_overdue) / (max_overdue - min_overdue) if (max_overdue - min_overdue) > 0 else 0
                integrated_scores[num] += norm_freq * 0.4 + norm_overdue * 0.3
                if num in phase1_recommendations["pattern"]: integrated_scores[num] += 0.1
                if num in phase1_recommendations["co_occurrence"]: integrated_scores[num] += 0.1
        integrated_recommendation.extend(sorted([num for num, score in integrated_scores.most_common(6)]))

        def generate_combination_for_sum_simple(target_sum, max_attempts=1000):
            for _ in range(max_attempts):
                combo = random.sample(range(1, 46), 6)
                if sum(combo) == target_sum: return sorted(combo)
            return "조합 생성 실패"
        sum_recommendations["top_5_frequent_sums"] = [{"sum": s, "count": c, "recommendation": generate_combination_for_sum_simple(s)} for s, c in sums_counter.most_common(5)]
        sum_recommendations["fixed_sum_recommendations"] = {
            "low_sum": {"range": "60-90", "recommendation": generate_combination_in_sum_range(60, 90)},
            "medium_sum": {"range": "120-150", "recommendation": generate_combination_in_sum_range(120, 150)},
            "high_sum": {"range": "180-210", "recommendation": generate_combination_in_sum_range(180, 210)}
        }

    except Exception as e:
        print(f"CRITICAL: Failed to open or read the CSV file. Error: {e}")

# --- Helper Functions ---
def generate_combination_in_sum_range(min_sum: int, max_sum: int, max_attempts=10000):
    weighted_numbers = []
    if main_numbers_counter:
        for num, count in main_numbers_counter.items():
            weighted_numbers.extend([num] * count)

    if not weighted_numbers:
        for _ in range(max_attempts):
            combo = random.sample(range(1, 46), 6)
            if min_sum <= sum(combo) <= max_sum:
                return sorted(combo)
        return "조합 생성 실패"

    for _ in range(max_attempts):
        combo = set()
        while len(combo) < 6:
            combo.add(random.choice(weighted_numbers))
        
        combo = list(combo)
        if min_sum <= sum(combo) <= max_sum:
            return sorted(combo)
            
    return "조합 생성 실패"

# --- API Endpoints ---

@app.get("/api/last-update")
async def get_last_update():
    try:
        last_modified_timestamp = os.path.getmtime(LOTTO_HISTORY_FILE)
        last_modified_date = datetime.fromtimestamp(last_modified_timestamp).strftime('%Y-%m-%d %H:%M:%S')
        return {"last_update": last_modified_date}
    except FileNotFoundError:
        return {"last_update": "N/A"}

@app.get("/api/analysis/frequency")
async def get_frequency_analysis():
    return {
        "hotNumbers": hot_numbers,
        "coldNumbers": cold_numbers,
        "hotBonusNumbers": hot_bonus_numbers,
        "coldBonusNumbers": cold_bonus_numbers
    }

@app.get("/api/analysis/patterns")
async def get_pattern_analysis():
    return pattern_stats

@app.get("/api/analysis/timeseries")
async def get_timeseries_analysis():
    return time_series_data

@app.get("/api/recommendations/ml")
async def get_ml_predictions():
    return ml_predictions

@app.get("/api/analysis/cooccurrence")
async def get_cooccurrence_analysis():
    return co_occurrence_data

@app.get("/api/recommendations/phase1")
async def get_phase1_recommendations():
    return phase1_recommendations

@app.get("/api/recommendations/integrated")
async def get_integrated_recommendation():
    return {"integrated_recommendation": integrated_recommendation}

@app.get("/api/recommendations/sum-based")
async def get_sum_based_recommendations():
    # Re-generate fixed recommendations on each call
    fixed_recs = {
        "low_sum": {"range": "60-90", "recommendation": generate_combination_in_sum_range(60, 90)},
        "medium_sum": {"range": "120-150", "recommendation": generate_combination_in_sum_range(120, 150)},
        "high_sum": {"range": "180-210", "recommendation": generate_combination_in_sum_range(180, 210)}
    }
    
    # Re-generate top 5 frequent sums recommendations on each call
    top_5_recs = [{"sum": s, "count": c, "recommendation": generate_combination_for_sum_simple(s)} for s, c in sums_counter.most_common(5)]

    return {
        "top_5_frequent_sums": top_5_recs,
        "fixed_sum_recommendations": fixed_recs
    }

@app.get("/api/recommendations/sum-range")
async def get_sum_range_recommendation(min_sum: int = Query(100), max_sum: int = Query(150)):
    recommendation = generate_combination_in_sum_range(min_sum, max_sum)
    return {"recommendation": recommendation}

@app.get("/api/recommendations/hit-rate")
async def get_hit_rate(numbers: List[int] = Query(...)):
    if not all_winning_numbers:
        return {"hit_rate": 0}

    hit_count = 0
    for winning_numbers in all_winning_numbers:
        if set(numbers).issubset(set(winning_numbers)):
            hit_count += 1

    hit_rate = (hit_count / len(all_winning_numbers)) * 100
    return {"hit_rate": round(hit_rate, 2)}

@app.on_event("startup")
async def startup_event():
    load_and_analyze_data()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)