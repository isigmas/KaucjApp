import requests
import json

token="ADMIN_TOKEN" #login to admin account /api/auth/login then /api/auth/refresh

with open('shops_formatted_krakow.json', 'r') as f:
    shops_krakow = json.load(f)

for shop in shops_krakow:
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post("https://gql-gateway.thankfulpebble-13b4343c.polandcentral.azurecontainerapps.io/api/deposit/machine", json=shop,headers=headers)
    print(response.status_code)
    print(response.text)