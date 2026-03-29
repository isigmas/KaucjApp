#!/bin/bash

BASE_URL="http://localhost:8080/api"

echo "🚀 Rozpoczynam generowanie PRO danych przez API (wersja macOS)..."

# Tablice z danymi (20 elementów)
NAMES=("Anna" "Jan" "Katarzyna" "Piotr" "Magdalena" "Michal" "Zofia" "Tomasz" "Julia" "Krzysztof" "Maja" "Jakub" "Alicja" "Marcin" "Ewa" "Adam" "Paulina" "Lukasz" "Agnieszka" "Maciej")
SURNAMES=("Kowalska" "Nowak" "Wisniewski" "Wojcik" "Kowalczyk" "Kaminski" "Lewandowski" "Zielinska" "Szymanski" "Wozniak" "Dabrowska" "Kozlowski" "Jankowska" "Mazur" "Kwiatkowski" "Krawczyk" "Kaczmarek" "Piotrowski" "Grabowska" "Pawlowski")
STREETS=("Florianska" "Szewska" "Karmelicka" "Grodzka" "Starowislna" "Dietla" "Krakowska" "Dluga" "Krowoderska" "Czarnowiejska" "Piastowska" "Armii Krajowej" "Lea" "Krolewska" "Bronowicka" "Wroclawska" "Pradnicka" "Lubicz" "Basztowa" "Wielicka")

# ---------------------------------------------------------
# 1. TWORZENIE 20 UŻYTKOWNIKÓW
# ---------------------------------------------------------
echo "👤 Tworzenie 20 realistycznych użytkowników..."
for i in {0..19}
do
  NAME=${NAMES[$i]}
  SURNAME=${SURNAMES[$i]}
  STREET=${STREETS[$i]}
  
  # Zmiana na małe litery - sposób kompatybilny z macOS
  NAME_LOW=$(echo "$NAME" | tr '[:upper:]' '[:lower:]')
  SURNAME_LOW=$(echo "$SURNAME" | tr '[:upper:]' '[:lower:]')
  
  BLDG=$((RANDOM % 80 + 1))
  PHONE="500$((RANDOM % 900 + 100))$((RANDOM % 900 + 100))"
  
  LAT="50.0$((40 + RANDOM % 40))"
  LON="19.9$((10 + RANDOM % 60))"

  curl -s -X POST "$BASE_URL/user" \
    -H "Content-Type: application/json" \
    -d "$(cat <<EOF
    {
      "name": "$NAME",
      "surname": "$SURNAME",
      "username": "${NAME_LOW}.${SURNAME_LOW}$((RANDOM % 99))",
      "phone_number": "$PHONE",
      "email": "${NAME_LOW}.${SURNAME_LOW}@example.com",
      "default_address": "ul. $STREET $BLDG, Kraków",
      "default_latitude": $LAT,
      "default_longitude": $LON
    }
EOF
)" > /dev/null

  echo -n "✅ $NAME $SURNAME | "
done
echo -e "\n"

# ---------------------------------------------------------
# 2. DODAWANIE OCEN (RATING)
# ---------------------------------------------------------
echo "⭐ Dodawanie ocen użytkownikom..."
for i in {1..20}
do
  SCORE=$(( (RANDOM % 3) + 3 ))
  
  curl -s -X POST "$BASE_URL/user/$i/rating" \
    -H "Content-Type: application/json" \
    -d "{\"score\": $SCORE}" > /dev/null
    
  echo -n "⭐ ID:$i -> $SCORE | "
done
echo -e "\n"

# ---------------------------------------------------------
# 3. TWORZENIE 20 OFERT
# ---------------------------------------------------------
echo "📦 Tworzenie 20 unikalnych ofert..."
for i in {0..19}
do
  USER_ID=$((i + 1))
  STREET=${STREETS[$i]}
  BLDG=$((RANDOM % 80 + 1))
  
  LAT="50.0$((40 + RANDOM % 40))"
  LON="19.9$((10 + RANDOM % 60))"
  
  QTY_A=$(( (RANDOM % 20) + 5 ))
  QTY_B=$(( (RANDOM % 15) + 0 ))
  QTY_C=$(( (RANDOM % 5) + 0 ))

  curl -s -X POST "$BASE_URL/offer" \
    -H "Content-Type: application/json" \
    -d "$(cat <<EOF
    {
      "creatorId": $USER_ID,
      "latitude": $LAT,
      "longitude": $LON,
      "aQuantity": $QTY_A,
      "aPrice": 0.50,
      "aFee": 0.30,
      "bQuantity": $QTY_B,
      "bPrice": 0.20,
      "bFee": 0.05,
      "cQuantity": $QTY_C,
      "cPrice": 1.00,
      "cFee": 0.50,
      "pickupAddress": "ul. $STREET $BLDG, Kraków",
      "pickupInstructions": "Proszę zadzwonić pod domofon $BLDG po przybyciu."
    }
EOF
)" > /dev/null

  echo -n "📦 Oferta dla $USER_ID | "
done
echo -e "\n"

echo "🎉 BAZA GOTOWA! Masz teraz piękne, realistyczne dane!"
