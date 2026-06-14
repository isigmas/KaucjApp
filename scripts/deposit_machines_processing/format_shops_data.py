import argparse
import json
import re
import time

import requests


def parse_args():
    parser = argparse.ArgumentParser(description="Format fetched shop data for the deposit machine API.")
    parser.add_argument("--city", required=True, help='City name, e.g. "Wrocław"')
    return parser.parse_args()


def get_address_from_coords(lat, lon):
    response = requests.get(
        "https://nominatim.openstreetmap.org/reverse",
        params={
            "lat": lat,
            "lon": lon,
            "format": "json",
            "addressdetails": 1
        },
        headers={"User-Agent": "kaucjapp/1.0"}
    )
    if response.status_code != 200:
        return "brak"

    data = response.json()
    addr = data.get("address", {})

    road = addr.get("road", "")
    house = addr.get("house_number", "")
    city = addr.get("city") or addr.get("town") or addr.get("village") or ""

    if road and house:
        return f"{road} {house}, {city}".strip(", ")
    elif road:
        return f"{road}, {city}".strip(", ")
    return data.get("display_name", "brak")


def _normalize_time(value):
    value = value.strip()
    if "+" in value:
        value = value.split("+", 1)[0].strip()
    if value.count(":") == 1:
        value += ":00"
    if value == "24:00:00":
        value = "23:59:59"
    return value


TIME_RANGE_RE = re.compile(
    r"(\d{1,2}:\d{2})(?::\d{2})?\s*-\s*(\d{1,2}:\d{2})(?::\d{2})?(?:\+\d+)?"
)


def _parse_time_ranges(time_part):
    ranges = []
    for match in TIME_RANGE_RE.finditer(time_part):
        open_t = _normalize_time(match.group(1))
        close_t = _normalize_time(match.group(2))
        ranges.append((open_t, close_t))
    return ranges


def _merge_time_ranges(ranges):
    if not ranges:
        return None
    if len(ranges) == 1:
        open_t, close_t = ranges[0]
        if open_t >= close_t:
            return ("00:00:00", "23:59:59", True)
        return (open_t, close_t, False)

    open_t = min(r[0] for r in ranges)
    close_t = max(r[1] for r in ranges)
    if open_t >= close_t:
        return ("00:00:00", "23:59:59", True)
    return (open_t, close_t, False)


def parse_opening_hours(oh_string):
    DAY_MAP = {"Mo": 1, "Tu": 2, "We": 3, "Th": 4, "Fr": 5, "Sa": 6, "Su": 7}

    CLOSED_DAY = {
        "open_time": "00:00:00",
        "close_time": "23:59:59",
        "is_closed": True
    }

    if oh_string is None or not str(oh_string).strip():
        return [{"day_of_week": i, **CLOSED_DAY} for i in range(1, 8)]

    result = {}

    if oh_string.strip() == "24/7":
        return [
            {"day_of_week": i, "open_time": "00:00:00", "close_time": "23:59:59", "is_closed": False}
            for i in range(1, 8)
        ]

    def expand_days(day_range):
        days = []
        for part in day_range.split(","):
            part = part.strip()
            if part == "PH":
                continue
            if "-" in part:
                chunks = part.split("-")
                if len(chunks) == 2 and chunks[0] in DAY_MAP and chunks[1] in DAY_MAP:
                    start_i = DAY_MAP[chunks[0]]
                    end_i = DAY_MAP[chunks[1]]
                    if start_i <= end_i:
                        days += list(range(start_i, end_i + 1))
                    else:
                        days += list(range(start_i, 8)) + list(range(1, end_i + 1))
            elif part in DAY_MAP:
                days.append(DAY_MAP[part])
        return days

    for rule in oh_string.split(";"):
        rule = rule.strip()
        if not rule:
            continue
        parts = rule.rsplit(" ", 1)
        if len(parts) != 2:
            continue
        day_part, time_part = parts
        time_part = time_part.strip()
        days = expand_days(day_part)

        if time_part.lower() == "off":
            for d in days:
                result[d] = ("00:00:00", "23:59:59", True)
            continue

        time_ranges = _parse_time_ranges(time_part)
        merged = _merge_time_ranges(time_ranges)
        if merged is None:
            continue

        for d in days:
            result[d] = merged

    output = []
    for i in range(1, 8):
        if i in result:
            open_t, close_t, is_closed = result[i]
            output.append({"day_of_week": i, "open_time": open_t, "close_time": close_t, "is_closed": is_closed})
        else:
            output.append({"day_of_week": i, **CLOSED_DAY})
    return output

if __name__ == "__main__":
    city = parse_args().city

    with open(f"shops_{city}.json", encoding="utf-8") as f:
        shops_in_city = json.load(f)

    shops_formatted = []

    for shop in shops_in_city:
        network_name = shop['name'] if shop['name'] != "Żabka" else "Zabka"

        street = shop['street'] or ""
        housenumber = shop['housenumber'] or ""
        shop_city = shop['city'] or ""

        if street and housenumber:
            address = f"{street} {housenumber}{', ' + shop_city if shop_city else ''}"
        else:
            address = get_address_from_coords(shop['lat'], shop['lon'])
            time.sleep(1) # sleep here cause of limiting in api

        latitude = shop['lat']
        longitude = shop['lon']
        opening_hours = parse_opening_hours(shop["opening_hours"])

        body = {
            'network_name': network_name,
            'status': 'AVAILABLE',
            'address': address,
            'latitude': latitude,
            'longitude': longitude,
            'opening_hours': opening_hours,
        }

        shops_formatted.append(body)

    with open(f"shops_{city}_formatted.json", "w", encoding="utf-8") as f:
        json.dump(shops_formatted, f, indent=2, ensure_ascii=False)

