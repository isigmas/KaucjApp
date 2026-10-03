import argparse
import json
import os

import requests

# Override with KAUCJAPP_API_URL (base URL, no trailing slash) to target another environment.
API_URL = os.environ.get("KAUCJAPP_API_URL", "https://api.kaucjapp.pl").rstrip("/") + "/api/deposit/machine"


def parse_args():
    parser = argparse.ArgumentParser(description="Upload formatted shop data to the deposit machine API.")
    parser.add_argument("--city", required=True, help='City name, e.g. "Wrocław"')
    parser.add_argument(
        "--token",
        required=True,
        help="Admin bearer token (from /api/auth/login, then /api/auth/refresh)",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()

    with open(f"shops_{args.city}_formatted.json", encoding="utf-8") as f:
        shops = json.load(f)

    headers = {"Authorization": f"Bearer {args.token}"}

    for shop in shops:
        response = requests.post(API_URL, json=shop, headers=headers)
        print(response.status_code)
        print(response.text)
