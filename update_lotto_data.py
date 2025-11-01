
import csv
import requests
import os
from datetime import datetime

def get_latest_draw_number_from_api():
    """
    Fetches the latest draw number from the dhlottery API.
    """
    # Start from a recent draw number and go up until a failure
    # This is faster than starting from 1
    # The API returns {"returnValue": "fail"} for future draw numbers
    
    # Let's start from a draw number that is likely to be recent.
    # I will read the existing file to get a hint.
    latest_local_draw = 0
    if os.path.exists('lotto_history.csv'):
        with open('lotto_history.csv', 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader) # Skip header
            try:
                last_row = list(reader)[-1]
                latest_local_draw = int(last_row[1].replace('회',''))
            except IndexError:
                latest_local_draw = 0 # file is empty or has only header

    # Start checking from the next draw number
    draw_number = latest_local_draw + 1
    
    while True:
        url = f"https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo={draw_number}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            if data.get("returnValue") == "fail":
                return draw_number - 1
            draw_number += 1
        except requests.exceptions.RequestException as e:
            print(f"Error while fetching latest draw number: {e}")
            return draw_number - 1 # return the last successful one
        except ValueError: #Catches JSONDecodeError
            print(f"Error decoding JSON for draw number {draw_number}")
            return draw_number - 1


def get_lotto_data(draw_number):
    """
    Fetches lotto data for a specific draw number.
    """
    url = f"https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo={draw_number}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for draw {draw_number}: {e}")
        return None
    except ValueError:
        print(f"Error decoding JSON for draw {draw_number}")
        return None

def format_data_for_csv(data):
    """
    Formats the API response data to match the lotto_history.csv format.
    """
    draw_date = data.get('drwNoDate', '')
    draw_number = data.get('drwNo', '')
    
    win_numbers = ", ".join(str(data.get(f'drwtNo{i}')) for i in range(1, 7))
    bonus_number = str(data.get('bnusNo', ''))
    
    first_win_amnt_total = data.get('firstAccumamnt', 0)
    first_win_count = data.get('firstPrzwnerCo', 0)
    first_win_amnt_per_person = data.get('firstWinamnt', 0)

    # The API does not provide prize info for 2nd to 5th place directly.
    # The existing CSV has this info, but the new data from API will not.
    # I will leave these fields empty for now.
    
    total_sell_amount = data.get('totSellamnt', 0)

    # The CSV has many columns, and the API provides only a subset.
    # I will create a row with the available data, and leave the rest empty.
    # This will maintain the column structure.
    
    # 추첨일,회차,당첨번호,보너스번호,1등_총당첨금액,1등_당첨게임수,1등_1게임당당첨금액,2등_총당첨금액,2등_당첨게임수,2등_1게임당당첨금액,3등_총당첨금액,3등_당첨게임수,3등_1게임당당첨금액,4등_총당첨금액,4등_당첨게임수,4등_1게임당당첨금액,5등_총당첨금액,5등_당첨게임수,5등_1게임당당첨금액,자동/반자동/수동,총판매금액
    
    row = [
        f"({draw_date})",
        f"{draw_number}회",
        win_numbers,
        bonus_number,
        f"{first_win_amnt_total:,}원",
        first_win_count,
        f"{first_win_amnt_per_person:,}원",
        "", "", "", "", "", "", "", "", "", "", "", "", "", "", # 2nd, 3rd, 4th, 5th place data
        f"{total_sell_amount:,}원"
    ]
    
    return row

def update_lotto_history():
    """
    Updates the lotto_history.csv file with the latest lotto data.
    """
    if not os.path.exists('lotto_history.csv'):
        # Create the file with header if it doesn't exist
        with open('lotto_history.csv', 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(["추첨일","회차","당첨번호","보너스번호","1등_총당첨금액","1등_당첨게임수","1등_1게임당당첨금액","2등_총당첨금액","2등_당첨게임수","2등_1게임당당첨금액","3등_총당첨금액","3등_당첨게임수","3등_1게임당당첨금액","4등_총당첨금액","4등_당첨게임수","4등_1게임당당첨금액","5등_총당첨금액","5등_당첨게임수","5등_1게임당당첨금액","자동/반자동/수동","총판매금액"])

    latest_local_draw = 0
    with open('lotto_history.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        try:
            last_row = list(reader)[-1]
            latest_local_draw = int(last_row[1].replace('회',''))
        except IndexError:
            latest_local_draw = 0

    print(f"Latest local draw number: {latest_local_draw}")

    latest_api_draw = get_latest_draw_number_from_api()
    print(f"Latest API draw number: {latest_api_draw}")

    if latest_api_draw > latest_local_draw:
        print(f"New data found. Updating from {latest_local_draw + 1} to {latest_api_draw}")
        with open('lotto_history.csv', 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            for draw_number in range(latest_local_draw + 1, latest_api_draw + 1):
                data = get_lotto_data(draw_number)
                if data and data.get("returnValue") == "success":
                    row = format_data_for_csv(data)
                    writer.writerow(row)
                    print(f"Successfully added data for draw {draw_number}")
                else:
                    print(f"Failed to get data for draw {draw_number}")
    else:
        print("No new data found.")

if __name__ == "__main__":
    update_lotto_history()
