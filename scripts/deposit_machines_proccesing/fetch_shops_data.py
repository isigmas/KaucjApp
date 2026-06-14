import requests
import json

if __name__ == '__main__':
    brands = {"Żabka", "Biedronka", "Lidl", "Carrefour", "Aldi", "Dino", "Netto", "Kaufland"}
    brand_regex = "|".join(brands)

    city = "Kraków"

    query = f"""
    [out:json][timeout:120];
    area["name"="{city}"]["admin_level"="8"]->.searchArea;
    (
      node["shop"]["name"~"{brand_regex}"](area.searchArea);
      way["shop"]["name"~"{brand_regex}"](area.searchArea);
      relation["shop"]["name"~"{brand_regex}"](area.searchArea);
    );
    out center tags;
    """

    SERVERS = [
        "https://overpass.kumi.systems/api/interpreter",
        "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
        "https://overpass.openstreetmap.ru/api/interpreter",
    ]

    response = None
    for server in SERVERS:
        try:
            r = requests.post(server, data={"data": query}, timeout=30)
            print(f"{server} -> {r.status_code}")
            if r.status_code == 200:
                response = r
                break
        except Exception as e:
            print(f"{server} -> error: {e}")

    if not response:
        print("No response from server")
        exit()

    data = response.json()
    shops = []
    for el in data["elements"]:
        tags = el.get("tags", {})
        name = tags.get("name", "")
        if name not in brands:
            continue
        shops.append({
            "name": name,
            "shop_type": tags.get("shop"),
            "street": tags.get("addr:street"),
            "housenumber": tags.get("addr:housenumber"),
            "city": tags.get("addr:city"),
            "opening_hours": tags.get("opening_hours"),
            "lat": el.get("lat") or el.get("center", {}).get("lat"),
            "lon": el.get("lon") or el.get("center", {}).get("lon"),
        })

    with open(f"shops_{city}.json", "w", encoding="utf-8") as f:
        json.dump(shops, f, indent=2, ensure_ascii=False)

    print(json.dumps(shops[:10], indent=2, ensure_ascii=False))
    print(f"Number of shops: {len(shops)}")