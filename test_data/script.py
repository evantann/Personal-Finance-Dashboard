import csv
import random
import datetime

def generate_random_date(start_year=2020, end_year=2024):
    start_date = datetime.date(start_year, 1, 1)
    end_date = datetime.date.today()
    random_date = start_date + datetime.timedelta(days=random.randint(0, (end_date - start_date).days))
    return random_date.strftime('%Y-%m-%d %H:%M:%S')

def generate_record():
    transaction_id = ''.join(random.choices('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=37))
    user_id = '1'
    accounts=[
        'RLDZGNVmevcBEPRpqQkyuNbdj8M9bbFakQMwa'
    ]
    account_id = random.choices(accounts)[0]
    categories = [
        {'category': 'FOOD_AND_DRINK', 'subcategory': 'FOOD_AND_DRINK_FAST_FOOD', 'transaction_name': 'McDonald\'s', 'vendor': 'McDonald\'s'},
        {'category': 'FOOD_AND_DRINK', 'subcategory': 'FOOD_AND_DRINK_COFFEE', 'transaction_name': 'Starbucks', 'vendor': 'Starbucks'},
        {'category': 'GENERAL_MERCHANDISE', 'subcategory': 'GENERAL_MERCHANDISE_SPORTING_GOODS', 'transaction_name': 'Madison Bicycle Shop', 'vendor': None},
        {'category': 'GENERAL_MERCHANDISE', 'subcategory': 'GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE', 'transaction_name': 'AUTOMATIC PAYMENT - THANK', 'vendor': None},
        {'category': 'ENTERTAINMENT', 'subcategory': 'ENTERTAINMENT_SPORTING_EVENTS_AMUSEMENT_PARKS_AND_MUSEUMS', 'transaction_name': 'Tectra Inc', 'vendor': None},
        {'category': 'TRANSPORTATION', 'subcategory': 'TRANSPORTATION_TAXIS_AND_RIDE_SHARES', 'transaction_name': 'Uber', 'vendor': 'Uber'},
        {'category': 'TRAVEL', 'subcategory': 'TRAVEL_FLIGHTS', 'transaction_name': 'United Airlines', 'vendor': 'United Airlines'},
        {'category': 'PERSONAL_CARE', 'subcategory': 'PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS', 'transaction_name': 'Touchstone Climbing', 'vendor': None}
    ]
    chosen_category = random.choice(categories)
    category = chosen_category['category']
    subcategory = chosen_category['subcategory']
    transaction_name = chosen_category['transaction_name']
    vendor = chosen_category['vendor']
    date = generate_random_date()
    amount = round(random.uniform(1, 5000), 2)
    return [transaction_id, user_id, account_id, category, subcategory, date, transaction_name, vendor, str(amount)]

def generate_records(num_records=100):
    records = [generate_record() for _ in range(num_records)]
    return records

def write_to_csv(records, filename='records.csv'):
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        # writer.writerow(['transaction_id', 'user_id', 'account_id', 'category', 'subcategory', 'date', 'transaction_name', 'vendor', 'amount'])
        writer.writerows(records)

if __name__ == "__main__":
    records = generate_records(100)
    write_to_csv(records)
    print(f"Generated {len(records)} records and wrote them to 'records.csv'.")