```
cd scripts/deposit_machines_processing

python fetch_shops_data.py --city "Wrocław"
python format_shops_data.py --city "Wrocław"
python request_to_prod.py --city "Wrocław" --token "TWÓJ_TOKEN"
```