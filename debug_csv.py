import csv
import sys

file_path = '/Users/visualog/Documents/GitHub/분석/lotto_history.csv'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        first_row = next(reader)
        print(f"Keys found in CSV: {list(first_row.keys())}")
        # Test the problematic key
        print(f"Value for '회차': {first_row['회차']}")

except KeyError as e:
    print(f"KeyError: The key {e} was not found in the row.", file=sys.stderr)
except Exception as e:
    print(f"An error occurred: {e}", file=sys.stderr)
