import csv
import json
from collections import Counter
from itertools import combinations
import random
import os
import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS for frontend development
origins = [
    "http://localhost:3000", # Next.js frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Loading and Preprocessing (Run once on startup) ---
LOTTO_HISTORY_FILE = os.path.join(os.path.dirname(__file__), "..", "lotto_history.csv")

# Global variables to store pre-calculated analysis results
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

def load_and_analyze_data():
    global hot_numbers, cold_numbers, hot_bonus_numbers, cold_bonus_numbers
    global pattern_stats, time_series_data, ml_predictions, co_occurrence_data
    global phase1_recommendations, integrated_recommendation, sum_recommendations

    # --- Frequency Analysis ---
    main_numbers_counter = Counter()
    bonus_numbers_counter = Counter()
    last_seen = {num: 0 for num in range(1, 46)}
    all_sums = []
    sums_counter = Counter()
    
    try:
        with open(LOTTO_HISTORY_FILE, 'r', encoding='utf-8-sig') as f:
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
                    main_numbers_counter[num] += 1
                
                bonus_num = int(row['보너스번호'])
                bonus_numbers_counter[bonus_num] += 1
                current_draw_numbers.add(bonus_num) # Include bonus for last_seen

                for num in current_draw_numbers:
                    last_seen[num] = draw_num
                
                # For sum analysis
                sum_val = int(row['당첨번호_합'])
                all_sums.append(sum_val)
                sums_counter[sum_val] += 1

        hot_numbers.extend([{"number": num, "count": count} for num, count in main_numbers_counter.most_common(10)])
        cold_numbers.extend([{"number": num, "count": count} for num, count in main_numbers_counter.most_common()[-10:]])
        hot_bonus_numbers.extend([{"number": num, "count": count} for num, count in bonus_numbers_counter.most_common(5)])
        cold_bonus_numbers.extend([{"number": num, "count": count} for num, count in bonus_numbers_counter.most_common()[-5:]])

        # --- Pattern Analysis ---
        odd_even_ratios_counter = Counter()
        high_low_ratios_counter = Counter()
        consecutive_count = 0

        with open(LOTTO_HISTORY_FILE, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                ratio_key = '당첨번호_홀짝비율'
                if row.get(ratio_key):
                    odd_even_ratios_counter[row[ratio_key]] += 1

                main_nums_for_patterns = []
                for i in range(1, 7):
                    num_key = f'당첨번호_{i}'
                    if row.get(num_key) and row[num_key].isdigit():
                        main_nums_for_patterns.append(int(row[num_key]))
                
                if len(main_nums_for_patterns) == 6:
                    low_count = sum(1 for n in main_nums_for_patterns if 1 <= n <= 22)
                    high_count = 6 - low_count
                    high_low_ratios_counter[f"{high_count}:{low_count}"] += 1
                    
                    sorted_nums = sorted(main_nums_for_patterns)
                    if any(sorted_nums[i+1] == sorted_nums[i] + 1 for i in range(len(sorted_nums) - 1)):
                        consecutive_count += 1
        
        pattern_stats["total_draws"] = total_draws
        pattern_stats["odd_even_ratios"] = dict(odd_even_ratios_counter.most_common())
        pattern_stats["high_low_ratios"] = dict(high_low_ratios_counter.most_common())
        pattern_stats["consecutive_stats"] = {
            "count": consecutive_count,
            "percentage": round((consecutive_count / total_draws) * 100, 2)
        }
        pattern_stats["sum_stats"] = {
            "min": int(min(all_sums)),
            "max": int(max(all_sums)),
            "mean": round(sum(all_sums) / len(all_sums), 2),
            "median": int(sorted(all_sums)[len(all_sums) // 2]),
            "std_dev": round((sum((x - (sum(all_sums) / len(all_sums))) ** 2 for x in all_sums) / len(all_sums)) ** 0.5, 2)
        }

        # --- Time Series Analysis ---
        time_series_data_raw = []
        window_size = 52
        sample_rate = 10
        
        sums_ts = []
        draws_ts = []
        with open(LOTTO_HISTORY_FILE, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            sorted_list_ts = sorted(list(reader), key=lambda row: int(row['회차']))
            for row in sorted_list_ts:
                draws_ts.append(int(row['회차']))
                sums_ts.append(int(row['당첨번호_합']))

        moving_averages = []
        for i in range(len(sums_ts)):
            if i < window_size - 1:
                moving_averages.append(None)
            else:
                window_slice = sums_ts[i - window_size + 1 : i + 1]
                avg = round(sum(window_slice) / window_size, 2)
                moving_averages.append(avg)

        for i in range(len(draws_ts)):
            if i % sample_rate == 0:
                time_series_data_raw.append({
                    "name": f"{draws_ts[i]}회",
                    "sum": sums_ts[i],
                    "moving_average": moving_averages[i]
                })
        time_series_data.extend(time_series_data_raw)

        # --- ML Predictions (Hot/Overdue) ---
        overdue = {num: total_draws - seen_at for num, seen_at in last_seen.items()}
        sorted_overdue = sorted(overdue.items(), key=lambda item: item[1], reverse=True)
        
        overdue_prediction = [num for num, gap in sorted_overdue[:6]]
        hot_prediction = [num for num, count in main_numbers_counter.most_common(6)]
        
        ml_predictions["hot_numbers_prediction"] = sorted(hot_prediction)
        ml_predictions["overdue_numbers_prediction"] = sorted(overdue_prediction)

        # --- Co-occurrence Analysis ---
        pair_frequencies = Counter()
        with open(LOTTO_HISTORY_FILE, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                main_nums_co = []
                for i in range(1, 7):
                    num_str = row.get(f'당첨번호_{i}')
                    if num_str and num_str.isdigit():
                        main_nums_co.append(int(num_str))
                
                if len(main_nums_co) == 6:
                    for pair in combinations(sorted(main_nums_co), 2):
                        pair_frequencies[pair] += 1
        
        top_20_pairs = []
        for pair, count in pair_frequencies.most_common(20):
            top_20_pairs.append({
                "pair": f"{pair[0]} - {pair[1]}",
                "count": count
            })
        co_occurrence_data.extend(top_20_pairs)

        # --- Phase 1 Recommendations ---
        pattern_recommendation = [12, 13, 17, 28, 33, 40] # Hardcoded as per plan
        
        co_occurrence_nodes = Counter()
        for pair, count in pair_frequencies.most_common(50):
            co_occurrence_nodes[pair[0]] += count
            co_occurrence_nodes[pair[1]] += count
        co_occurrence_recommendation = sorted([num for num, count in co_occurrence_nodes.most_common(6)])

        phase1_recommendations["pattern"] = sorted(pattern_recommendation)
        phase1_recommendations["co_occurrence"] = co_occurrence_recommendation

        # --- Integrated Recommendation ---
        integrated_scores = {}
        for num in range(1, 46):
            score = 0
            # Normalize scores (simple min-max normalization)
            max_freq = max(main_numbers_counter.values())
            min_freq = min(main_numbers_counter.values())
            normalized_freq = (main_numbers_counter.get(num, 0) - min_freq) / (max_freq - min_freq) if (max_freq - min_freq) > 0 else 0

            max_overdue = max(overdue.values())
            min_overdue = min(overdue.values())
            normalized_overdue = (overdue.get(num, 0) - min_overdue) / (max_overdue - min_overdue) if (max_overdue - min_overdue) > 0 else 0

            score += normalized_freq * 0.4
            score += normalized_overdue * 0.3
            
            if num in pattern_recommendation:
                score += 0.1
            if num in co_occurrence_recommendation:
                score += 0.1
            integrated_scores[num] = score
        
        integrated_recommendation_raw = sorted(integrated_scores.items(), key=lambda item: item[1], reverse=True)[:6]
        integrated_recommendation.extend(sorted([num for num, score in integrated_recommendation_raw]))

        # --- Sum-Based Recommendations ---
        top_5_frequent_sums_raw = []
        def generate_combination_for_sum_simple(target_sum, max_attempts=1000):
            for _ in range(max_attempts):
                combo = random.sample(range(1, 46), 6)
                if sum(combo) == target_sum:
                    return sorted(combo)
            return None

        for sum_val, count in sums_counter.most_common(5):
            combo = generate_combination_for_sum_simple(sum_val)
            top_5_frequent_sums_raw.append({
                "sum": sum_val,
                "count": count,
                "recommendation": combo if combo else "조합 생성 실패"
            })
        
        fixed_sum_recommendations_raw = {
            "low_sum": {
                "range": "60-90",
                "recommendation": [3, 7, 12, 15, 20, 25]
            },
            "medium_sum": {
                "range": "120-150",
                "recommendation": [10, 15, 22, 28, 33, 40]
            },
            "high_sum": {
                "range": "180-210",
                "recommendation": [25, 30, 35, 38, 40, 42]
            }
        }
        
        sum_recommendations["top_5_frequent_sums"] = top_5_frequent_sums_raw
        sum_recommendations["fixed_sum_recommendations"] = fixed_sum_recommendations_raw

    except Exception as e:
        print(f"Error during data loading/analysis: {e}")

# --- API Endpoints ---

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
    return sum_recommendations

# Run analysis on startup

load_and_analyze_data()



if __name__ == "__main__":

    port = int(os.environ.get("PORT", 8000))

    uvicorn.run(app, host="0.0.0.0", port=port)
