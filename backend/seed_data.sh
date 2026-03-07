#!/bin/bash

CONTAINER_NAME="postgres"
DB_USER="myuser"
DB_NAME="kaucjappdb"

echo "Inserting test data"

docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME <<EOF
INSERT INTO bottle_price (bottle_id, price) VALUES
                                                (1, 0.50),
                                                (2, 0.00)
ON CONFLICT DO NOTHING;

INSERT INTO users (user_id, username, phone_number, default_address) VALUES
                                                                         (1, 'JanKowalski', '111000111', 'ul. Floriańska 1, Kraków'),
                                                                         (2, 'AnnaNowak', '222000222', 'ul. Karmelicka 10, Kraków'),
                                                                         (3, 'ZbieraczButelek', '333000333', 'ul. Powstańcza 31, Kraków'),
                                                                         (4, 'PiotrPolak', '444000444', 'ul. Szewska 5, Kraków'),
                                                                         (5, 'KasiaM', '555000555', 'ul. Grodzka 12, Kraków'),
                                                                         (6, 'TomaszK', '666000666', 'ul. Starowiślna 40, Kraków'),
                                                                         (7, 'MagdaL', '777000777', 'ul. Dietla 50, Kraków'),
                                                                         (8, 'MarcinW', '888000888', 'ul. Kalwaryjska 20, Kraków'),
                                                                         (9, 'AgnieszkaS', '999000999', 'ul. Krakowska 15, Kraków'),
                                                                         (10, 'MichalG', '123123123', 'ul. Długa 30, Kraków'),
                                                                         (11, 'OlaB', '234234234', 'ul. Krowoderska 11, Kraków'),
                                                                         (12, 'KrzysiekP', '345345345', 'ul. Czarnowiejska 50, Kraków'),
                                                                         (13, 'EwaD', '456456456', 'ul. Reymonta 17, Kraków'),
                                                                         (14, 'AdamJ', '567567567', 'ul. Piastowska 20, Kraków'),
                                                                         (15, 'MartaC', '678678678', 'ul. Armii Krajowej 10, Kraków'),
                                                                         (16, 'LukaszR', '789789789', 'ul. Lea 44, Kraków'),
                                                                         (17, 'ZofiaW', '890890890', 'ul. Królewska 55, Kraków'),
                                                                         (18, 'KamilN', '112112112', 'ul. Bronowicka 100, Kraków'),
                                                                         (19, 'KarolinaZ', '223223223', 'ul. Wrocławska 80, Kraków'),
                                                                         (20, 'BartekT', '334334334', 'ul. Prądnicka 22, Kraków')
ON CONFLICT DO NOTHING;

INSERT INTO offers (offer_id, creator_id) VALUES
                                              (101, 1), (102, 2), (103, 3), (104, 4), (105, 5),
                                              (106, 6), (107, 7), (108, 8), (109, 9), (110, 10),
                                              (111, 11), (112, 12), (113, 13), (114, 14), (115, 15),
                                              (116, 16), (117, 17), (118, 18), (119, 19), (120, 20)
ON CONFLICT DO NOTHING;

INSERT INTO offer_info (offer_id, pickup_address, pickup_instructions, latitude, longitude, status) VALUES
                                                                                                        (101, 'ul. Floriańska 1, Kraków', 'Zadzwoń domofonem, kod 123', 50.0614, 19.9393, 'OPEN'),
                                                                                                        (102, 'ul. Karmelicka 10, Kraków', 'Odbiór w sklepie na rogu', 50.0646, 19.9325, 'OPEN'),
                                                                                                        (103, 'ul. Powstańcza 31, Kraków', 'Zostawię w czarnym worku przy śmietniku', 50.0410, 19.9600, 'OPEN'),
                                                                                                        (104, 'ul. Szewska 5, Kraków', 'Poczekam na ławce przed kamienicą', 50.0620, 19.9350, 'OPEN'),
                                                                                                        (105, 'ul. Grodzka 12, Kraków', 'Wejdź w bramę, pierwsze drzwi po prawej', 50.0570, 19.9380, 'OPEN'),
                                                                                                        (106, 'ul. Starowiślna 40, Kraków', 'Worek stoi na klatce schodowej', 50.0530, 19.9450, 'OPEN'),
                                                                                                        (107, 'ul. Dietla 50, Kraków', 'Proszę o SMS 10 min przed przyjazdem', 50.0510, 19.9400, 'OPEN'),
                                                                                                        (108, 'ul. Kalwaryjska 20, Kraków', 'Odbiór z warsztatu samochodowego', 50.0400, 19.9480, 'OPEN'),
                                                                                                        (109, 'ul. Krakowska 15, Kraków', 'Tylko po godzinie 18:00', 50.0480, 19.9440, 'OPEN'),
                                                                                                        (110, 'ul. Długa 30, Kraków', 'Zostawiam u portiera', 50.0680, 19.9370, 'OPEN'),
                                                                                                        (111, 'ul. Krowoderska 11, Kraków', 'Drugie piętro, brak windy', 50.0690, 19.9340, 'OPEN'),
                                                                                                        (112, 'ul. Czarnowiejska 50, Kraków', 'Butelki są w dwóch kartonach', 50.0660, 19.9200, 'OPEN'),
                                                                                                        (113, 'ul. Reymonta 17, Kraków', 'Odbiór pod Miasteczkiem Studenckim', 50.0657, 19.9187, 'OPEN'),
                                                                                                        (114, 'ul. Piastowska 20, Kraków', 'Domofon zepsuty, proszę dzwonić na telefon', 50.0690, 19.9050, 'OPEN'),
                                                                                                        (115, 'ul. Armii Krajowej 10, Kraków', 'Czekam na parkingu przed biurowcem', 50.0750, 19.8950, 'OPEN'),
                                                                                                        (116, 'ul. Lea 44, Kraków', 'Worek jest dość ciężki', 50.0720, 19.9150, 'OPEN'),
                                                                                                        (117, 'ul. Królewska 55, Kraków', 'Odbiór z tyłu budynku', 50.0740, 19.9200, 'OPEN'),
                                                                                                        (118, 'ul. Bronowicka 100, Kraków', 'Proszę podjechać pod samą klatkę', 50.0800, 19.8900, 'OPEN'),
                                                                                                        (119, 'ul. Wrocławska 80, Kraków', 'Butelki opłukane, spakowane w reklamówki', 50.0820, 19.9300, 'OPEN'),
                                                                                                        (120, 'ul. Prądnicka 22, Kraków', 'Zostawiam przed drzwiami mieszkania', 50.0850, 19.9400, 'OPEN')
ON CONFLICT DO NOTHING;

INSERT INTO counts (offer_id, bottle_id, quantity) VALUES
                                                       (101, 1, 15), (101, 2, 5),
                                                       (102, 1, 40),
                                                       (103, 2, 20),
                                                       (104, 1, 12), (104, 2, 8),
                                                       (105, 1, 30),
                                                       (106, 1, 10), (106, 2, 10),
                                                       (107, 2, 50),
                                                       (108, 1, 25),
                                                       (109, 1, 18), (109, 2, 2),
                                                       (110, 1, 35),
                                                       (111, 2, 15),
                                                       (112, 1, 40), (112, 2, 10),
                                                       (113, 1, 60),
                                                       (114, 1, 14), (114, 2, 6),
                                                       (115, 1, 22),
                                                       (116, 2, 30),
                                                       (117, 1, 5), (117, 2, 5),
                                                       (118, 1, 45),
                                                       (119, 1, 20), (119, 2, 15),
                                                       (120, 1, 50)
ON CONFLICT DO NOTHING;
EOF

echo "Done"
