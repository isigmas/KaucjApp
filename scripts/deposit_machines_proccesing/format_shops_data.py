import requests
import json
import time


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


def parse_opening_hours(oh_string):
    DAY_MAP = {"Mo": 1, "Tu": 2, "We": 3, "Th": 4, "Fr": 5, "Sa": 6, "Su": 7}

    CLOSED_DAY = {
        "open_time": "00:00:00",
        "close_time": "23:59:59",
        "is_closed": True
    }

    if oh_string is None:
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
        if "-" not in time_part:
            continue

        open_t, close_t = time_part.split("-")
        open_t = open_t.strip() + ":00"
        close_t = close_t.strip() + ":00"
        if close_t == "24:00:00":
            close_t = "23:59:59"
        if open_t == "24:00:00":
            open_t = "23:59:59"

        for d in days:
            if open_t >= close_t:
                result[d] = ("00:00:00", "23:59:59", True)
            else:
                result[d] = (open_t, close_t, False)

    output = []
    for i in range(1, 8):
        if i in result:
            open_t, close_t, is_closed = result[i]
            output.append({"day_of_week": i, "open_time": open_t, "close_time": close_t, "is_closed": is_closed})
        else:
            output.append({"day_of_week": i, **CLOSED_DAY})
    return output

if __name__ == "__main__":
    city = "Kraków"
    with open(f'shops_{city}.json', 'r') as f:
        shops_in_city = json.load(f)

    shops_formatted = []

    for shop in shops_in_city:
        network_name = shop['name'] if shop['name'] != "Żabka" else "Zabka"

        street = shop['street'] or ""
        housenumber = shop['housenumber'] or ""
        city = shop['city'] or ""

        if street and housenumber:
            address = f"{street} {housenumber}{', ' + city if city else ''}"
        else:
            address = get_address_from_coords(shop['lat'], shop['lon'])
            time.sleep(1)

        latitude = shop['lat']
        longitude = shop['lon']
        opening_hours = parse_opening_hours(shop["opening_hours"])

        body = {'network_name': network_name,'status':'AVAILABLE', 'address': address, 'latitude': latitude, 'longitude': longitude,'opening_hours': opening_hours}

        shops_formatted.append(body)

    with open(f"shops_{city}_formatted.json", "w", encoding="utf-8") as f:
        json.dump(shops_formatted, f, indent=2, ensure_ascii=False)

