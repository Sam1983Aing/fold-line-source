/* The five treks, generated from data/treks.json by tools/make-treks-data.mjs.
   Every number is researched and sourced in data/treks.md (14 Oct 2026). Change the research,
   then run the script, never edit numbers here by hand.
   Kala Patthar is printed as 5 644 m (GPS). Most guides say 5 545 m. Our SRTM data reads about
   5 600 m at the marked point and SRTM reads summits low, which favours 5 644 m.
   Prices are USD per person from real operators, used as a believable "from" price only. */
window.TREKS = [
 {
  "n": 1,
  "key": "tongariro",
  "fullName": "Tongariro Alpine Crossing",
  "name": "Tongariro",
  "line2": "Alpine Crossing",
  "country": "New Zealand",
  "countryShort": "NZ",
  "days": 1,
  "daysLabel": "1 DAY",
  "km": 19.4,
  "kmLabel": "19.4 KM",
  "start": {
   "name": "Mangatepōpō road end",
   "m": 1120
  },
  "end": {
   "name": "Ketetahi road end",
   "m": 760
  },
  "high": {
   "name": "Red Crater",
   "m": 1886
  },
  "ascent": 830,
  "descent": 1196,
  "nightLabel": "No night",
  "nights": [
   {
    "day": 1,
    "name": "No overnight, one-day crossing",
    "m": null,
    "type": "none"
   }
  ],
  "beats": [
   {
    "key": "climb",
    "name": "Devil's Staircase",
    "m": 1650,
    "day": 1,
    "line": "From the Soda Springs turn-off the track climbs steps and old lava flows to the rim of South Crater.",
    "fact": "A climb of around 350 m up a staircase to South Crater (DOC)."
   },
   {
    "key": "night",
    "name": "South Crater",
    "m": 1650,
    "day": 1,
    "line": "No night on this one. The pause is a flat, silent crater floor between the two climbs, with Ngāuruhoe on your right.",
    "fact": "South Crater, about 1,650 m: the only flat stretch between the two big climbs (Wikipedia)."
   },
   {
    "key": "top",
    "name": "Red Crater",
    "m": 1886,
    "day": 1,
    "line": "A rust-red vent on the ridge, with the Emerald Lakes shining in the scree below.",
    "fact": "Red Crater, 1,886 m, the highest point on the crossing (DOC)."
   }
  ],
  "season": {
   "best": "November to April, the summer season, when shuttles run and DOC issues a daily 6 am weather advisory (DOC).",
   "avoid": "May to late October unless guided: winter conditions need crampons, ice axe, helmet and avalanche gear, and shuttles generally do not run (DOC)."
  },
  "seasonShort": "Nov to Apr",
  "permits": [
   "No permit or fee. A free track booking is recommended for everyone and required to use a shuttle or guided walk (DOC).",
   "In summer there is no visitor parking at the Mangatepōpō car park, so book a shuttle or arrange a drop-off (DOC).",
   "DOC advises against parking on State Highway shoulders (DOC).",
   "Drones need a DOC permit. Mountain bikes are not allowed (DOC).",
   "After the November 2025 fires, a 10-year restorative rāhui (a customary Māori restriction) covers the burnt areas: stay on the track (DOC)."
  ],
  "price": {
   "low": 185,
   "high": 253
  },
  "group": {
   "min": 1,
   "max": 15
  },
  "facts": [
   "It is one-way. You finish 19.4 km from where you started, and in summer you cannot park at the start at all, so the shuttle is part of the plan (DOC, Wikipedia).",
   "The Emerald Lakes look swimmable but are off limits: DOC asks walkers not to touch or enter any lake (DOC).",
   "DOC has asked tour operators to stop calling Ngāuruhoe 'Mt Doom' (Wikipedia).",
   "Walker numbers grew from about 10,000 in 1990 to about 125,000 in 2015 (Wikipedia).",
   "No water on the track is safe to drink. Carry 2 to 3 litres (DOC)."
  ],
  "kit": [
   {
    "item": "Waterproof, windproof jacket",
    "why": "Alpine weather changes fast and snow can fall in any month (DOC)."
   },
   {
    "item": "2 to 3 litres of water",
    "why": "No water on the track is safe to drink (DOC)."
   },
   {
    "item": "Boots with real grip",
    "why": "Loose scree (small sliding volcanic stones) on the slopes of Red Crater is the main slip hazard (DOC)."
   },
   {
    "item": "Warm layer, hat and gloves",
    "why": "Hours on exposed ridges above 1,600 m, even on a sunny day."
   },
   {
    "item": "Sunscreen and sunglasses",
    "why": "There is no shade between the valley and the bush on the far side."
   },
   {
    "item": "Lunch and snacks",
    "why": "DOC says to allow 9 hours."
   },
   {
    "item": "Shuttle booking",
    "why": "The track ends 19.4 km from where it starts."
   },
   {
    "item": "Winter only: crampons, ice axe, helmet, avalanche transceiver, probe, shovel",
    "why": "DOC lists these for May to late October, and you need to know how to use them (DOC)."
   }
  ],
  "line": "One way, 19.4 km, and no water you can drink. The shuttle is part of the plan.",
  "marks": [
   {
    "label": "RED CRATER 1 886",
    "lat": -39.136,
    "lon": 175.65,
    "red": true
   },
   {
    "label": "NGĀURUHOE",
    "lat": -39.1567,
    "lon": 175.6322
   }
  ],
  "summit": {
   "name": "Ngāuruhoe",
   "m": 2291,
   "note": "landmark, not climbed on the crossing (GNS Science)"
  },
  "profile": [
   [
    0,
    1120
   ],
   [
    4.3,
    1370
   ],
   [
    6.5,
    1670
   ],
   [
    6.9,
    1650
   ],
   [
    8.2,
    1886
   ],
   [
    8.6,
    1695
   ],
   [
    9.7,
    1720
   ],
   [
    10.1,
    1750
   ],
   [
    13.1,
    1450
   ],
   [
    19.4,
    760
   ]
  ],
  "waypoints": [
   {
    "name": "Mangatepōpō road end",
    "lat": -39.145,
    "lon": 175.581,
    "m": 1120,
    "km": 0
   },
   {
    "name": "Soda Springs turn-off",
    "lat": -39.14,
    "lon": 175.625,
    "m": 1370,
    "km": 4.3
   },
   {
    "name": "South Crater rim, top of the Devil's Staircase",
    "lat": -39.143,
    "lon": 175.636,
    "m": 1670,
    "km": 6.5
   },
   {
    "name": "South Crater",
    "lat": -39.142,
    "lon": 175.641,
    "m": 1650,
    "km": 6.9
   },
   {
    "name": "Red Crater",
    "lat": -39.136,
    "lon": 175.65,
    "m": 1886,
    "km": 8.2
   },
   {
    "name": "Emerald Lakes",
    "lat": -39.134,
    "lon": 175.654,
    "m": 1695,
    "km": 8.6
   },
   {
    "name": "Blue Lake",
    "lat": -39.127,
    "lon": 175.659,
    "m": 1720,
    "km": 9.7
   },
   {
    "name": "North Crater flank",
    "lat": -39.124,
    "lon": 175.656,
    "m": 1750,
    "km": 10.1
   },
   {
    "name": "Ketetahi Shelter",
    "lat": -39.108,
    "lon": 175.653,
    "m": 1450,
    "km": 13.1
   },
   {
    "name": "Ketetahi road end",
    "lat": -39.074,
    "lon": 175.664,
    "m": 760,
    "km": 19.4
   }
  ]
 },
 {
  "n": 2,
  "key": "inca",
  "fullName": "Classic Inca Trail to Machu Picchu",
  "name": "Inca Trail",
  "line2": "to Machu Picchu",
  "country": "Peru",
  "countryShort": "Peru",
  "days": 4,
  "daysLabel": "4 DAYS",
  "km": 42,
  "kmLabel": "42 KM",
  "start": {
   "name": "KM 82, Piscacucho",
   "m": 2720
  },
  "end": {
   "name": "Machu Picchu",
   "m": 2430
  },
  "high": {
   "name": "Warmiwañusca (Dead Woman's Pass)",
   "m": 4215
  },
  "ascent": 2020,
  "descent": 2376,
  "nightLabel": "Tents",
  "nights": [
   {
    "day": 1,
    "name": "Camp near Wayllabamba (some groups use Ayapata)",
    "m": 3100,
    "type": "tent"
   },
   {
    "day": 2,
    "name": "Pacaymayo camp (some groups use Chaquicocha)",
    "m": 3600,
    "type": "tent"
   },
   {
    "day": 3,
    "name": "Wiñay Wayna camp",
    "m": 2650,
    "type": "tent"
   }
  ],
  "beats": [
   {
    "key": "climb",
    "name": "Dead Woman's Pass (Abra Warmiwañusca)",
    "m": 4215,
    "day": 2,
    "line": "A morning of stone stairs, more than 1,100 m of climbing from the valley to the highest pass of the trail.",
    "fact": "4,215 m, the highest point of the trail (Wikipedia, Alpaca Expeditions)."
   },
   {
    "key": "night",
    "name": "Wiñay Wayna",
    "m": 2650,
    "day": 3,
    "line": "The last camp, beside Inca terraces in the cloud forest, an early night before a pre-dawn start.",
    "fact": "Wiñay Wayna is Quechua for 'forever young', and the Sun Gate is about 3 km away (Wikipedia)."
   },
   {
    "key": "top",
    "name": "Inti Punku (Sun Gate)",
    "m": 2745,
    "day": 4,
    "line": "The stone gateway where the trail tops out and Machu Picchu appears below for the first time.",
    "fact": "From about 2,745 m the citadel lies roughly 300 m below you (Andean Trails, Wikipedia)."
   }
  ],
  "season": {
   "best": "May to September (dry season). April and October are quieter shoulder months (operators).",
   "avoid": "February, when the trail is closed for maintenance, and the wettest months, roughly December to March (Andina, operators)."
  },
  "seasonShort": "May to Sep",
  "permits": [
   "About 500 permits a day, including guides, cooks and porters, which leaves roughly 200 places for trekkers (Wikipedia).",
   "No independent hiking: permits are sold only through licensed operators, and a guide is mandatory (Wikipedia, Andina).",
   "Each permit is tied to one passport and cannot be transferred (Wikipedia).",
   "The trail closes every February for maintenance (Andina, 2026 season).",
   "In 2026 the Inca Trail ticket continues into Machu Picchu on Route 3-B, with its own daily quota (Andina)."
  ],
  "price": {
   "low": 835,
   "high": 1695
  },
  "group": {
   "min": 2,
   "max": 16
  },
  "facts": [
   "By law a porter may carry at most 20 kg (men) or 15 kg (women), under Ley 31614 of 2022, and loads are weighed on the trail (El Peruano, Responsible Travel).",
   "Metal-tipped trekking poles are not allowed (Wikipedia).",
   "Heavy rain on 17 and 18 August 2026 shut Routes 1, 2 and 3 of the Inca trail network. They reopened on 26 August 2026 (Panamericana).",
   "Machu Picchu (2,430 m) sits almost 1,000 m lower than Cusco (3,399 m), where most trekkers acclimatise first (Wikipedia)."
  ],
  "kit": [
   {
    "item": "The passport on your permit",
    "why": "Permits are tied to one passport and checked at the start (Wikipedia)."
   },
   {
    "item": "Rubber-tipped trekking poles",
    "why": "Metal tips are not allowed on the Inca stones (Wikipedia)."
   },
   {
    "item": "Headlamp",
    "why": "Day 4 starts in the dark to reach the Sun Gate early."
   },
   {
    "item": "Rain jacket",
    "why": "Day 3 drops into cloud forest, and rain is possible in any month."
   },
   {
    "item": "Warm sleeping bag",
    "why": "Camps sit at 3,000 to 3,600 m and nights are cold."
   },
   {
    "item": "Broken-in boots",
    "why": "Much of the trail is original Inca stone steps."
   },
   {
    "item": "A soft bag within the 7 kg porter allowance",
    "why": "Alpaca Expeditions' porters carry 7 kg per trekker, including sleeping bag and mat (Alpaca Expeditions)."
   }
  ],
  "line": "Four days of stone stairs, and you walk into Machu Picchu through the front gate.",
  "marks": [
   {
    "label": "INTI PUNKU 2 745",
    "lat": -13.17,
    "lon": -72.534,
    "red": true
   },
   {
    "label": "MACHU PICCHU",
    "lat": -13.166,
    "lon": -72.543
   }
  ],
  "summit": null,
  "profile": [
   [
    0,
    2720
   ],
   [
    13.4,
    3100
   ],
   [
    17.2,
    3300
   ],
   [
    19.1,
    3800
   ],
   [
    21.1,
    4215
   ],
   [
    23.7,
    3600
   ],
   [
    25.3,
    3950
   ],
   [
    26.8,
    3610
   ],
   [
    27.8,
    3600
   ],
   [
    31.1,
    3600
   ],
   [
    36.3,
    2650
   ],
   [
    40,
    2745
   ],
   [
    42,
    2430
   ]
  ],
  "waypoints": [
   {
    "name": "KM 82, Piscacucho",
    "lat": -13.215,
    "lon": -72.382,
    "m": 2720,
    "km": 0
   },
   {
    "name": "Wayllabamba (day 1 camp area)",
    "lat": -13.257,
    "lon": -72.443,
    "m": 3100,
    "km": 13.4
   },
   {
    "name": "Ayapata",
    "lat": -13.259,
    "lon": -72.462,
    "m": 3300,
    "km": 17.2
   },
   {
    "name": "Llulluchapampa",
    "lat": -13.251,
    "lon": -72.472,
    "m": 3800,
    "km": 19.1
   },
   {
    "name": "Dead Woman's Pass (Warmiwañusca)",
    "lat": -13.243,
    "lon": -72.484,
    "m": 4215,
    "km": 21.1
   },
   {
    "name": "Pacaymayo camp",
    "lat": -13.234,
    "lon": -72.498,
    "m": 3600,
    "km": 23.7
   },
   {
    "name": "Runkurakay pass",
    "lat": -13.227,
    "lon": -72.505,
    "m": 3950,
    "km": 25.3
   },
   {
    "name": "Sayacmarca",
    "lat": -13.228,
    "lon": -72.516,
    "m": 3610,
    "km": 26.8
   },
   {
    "name": "Chaquicocha camp",
    "lat": -13.223,
    "lon": -72.519,
    "m": 3600,
    "km": 27.8
   },
   {
    "name": "Phuyupatamarca",
    "lat": -13.207,
    "lon": -72.53,
    "m": 3600,
    "km": 31.1
   },
   {
    "name": "Wiñay Wayna",
    "lat": -13.19,
    "lon": -72.537,
    "m": 2650,
    "km": 36.3
   },
   {
    "name": "Inti Punku (Sun Gate)",
    "lat": -13.17,
    "lon": -72.534,
    "m": 2745,
    "km": 40
   },
   {
    "name": "Machu Picchu",
    "lat": -13.166,
    "lon": -72.543,
    "m": 2430,
    "km": 42
   }
  ]
 },
 {
  "n": 3,
  "key": "torres",
  "fullName": "W Trek, Torres del Paine",
  "name": "W Trek",
  "line2": "Torres del Paine",
  "country": "Chile",
  "countryShort": "Chile",
  "days": 5,
  "daysLabel": "5 DAYS",
  "km": 71,
  "kmLabel": "71 KM",
  "start": {
   "name": "Paine Grande (catamaran from Pudeto)",
   "m": 40
  },
  "end": {
   "name": "Welcome Center, Las Torres",
   "m": 140
  },
  "high": {
   "name": "Mirador Base Torres",
   "m": 870
  },
  "ascent": 2350,
  "descent": 2250,
  "nightLabel": "Refugios",
  "nights": [
   {
    "day": 1,
    "name": "Refugio Grey or Grey campsite (Vértice)",
    "m": 80,
    "type": "refugio"
   },
   {
    "day": 2,
    "name": "Refugio Paine Grande or campsite (Vértice)",
    "m": 40,
    "type": "refugio"
   },
   {
    "day": 3,
    "name": "Francés camp, domes or equipped tents (Las Torres)",
    "m": 170,
    "type": "tent"
   },
   {
    "day": 4,
    "name": "Refugio Chileno or campsite (Las Torres)",
    "m": 410,
    "type": "refugio"
   }
  ],
  "beats": [
   {
    "key": "climb",
    "name": "Valle del Francés to Mirador Británico",
    "m": 760,
    "day": 3,
    "line": "Up the French Valley past hanging glaciers into a ring of granite peaks.",
    "fact": "Rangers stop people starting up to Mirador Británico after 14:00 (CONAF, 2025-26 season)."
   },
   {
    "key": "night",
    "name": "Refugio Chileno",
    "m": 410,
    "day": 4,
    "line": "A wooden refugio (mountain hut with bunks and meals) in a beech-forest valley, the last bed below the towers.",
    "fact": "CONAF's Torres campsite, closer to the towers, was closed for 2025-26, so Chileno is the nearest place to sleep (CONAF)."
   },
   {
    "key": "top",
    "name": "Mirador Base Torres",
    "m": 870,
    "day": 5,
    "line": "A last steep scramble up a boulder moraine ends at a glacial lake under the three granite towers.",
    "fact": "The towers rise to about 2,500 m, over 1,600 m above the lake (Wikipedia)."
   }
  ],
  "season": {
   "best": "December to March for the longest, warmest days. Refugios and campsites run from about September to April (Las Torres, CONAF).",
   "avoid": "May to August. CONAF closed the W in June and July 2026, and most services shut over winter (CONAF via The Clinic, CONAF bulletin)."
  },
  "seasonShort": "Dec to Mar",
  "permits": [
   "Park entry, bought online at pasesparques.cl: CLP 48,500 (about USD 50) for foreign adults staying more than 2 days, CLP 32,400 for a day pass (parquetorresdelpaine.cl, 2026).",
   "Every night must be booked in advance at a refugio or campsite, or you are not allowed into the mountain area (CONAF bulletin 2025-26).",
   "Bookings are split between two companies: Chileno, Cuernos, Francés and Central through Las Torres, Paine Grande and Grey through Vértice (CONAF bulletin, Worldly Adventurer).",
   "Trails have cut-off times, for example last start for Mirador Británico at 14:00 and Paine Grande to Grey at 15:30 (CONAF bulletin 2025-26).",
   "Camping only in authorised areas, and stoves only in the designated cooking areas (CONAF map)."
  ],
  "price": {
   "low": 1450,
   "high": 4975
  },
  "group": {
   "min": 4,
   "max": 12
  },
  "facts": [
   "Wind ranges from a 20 km/h breeze to gusts of up to 110 km/h, and summer is the windiest season (Las Torres).",
   "Walking after dark is forbidden, partly because of puma risk (CONAF map).",
   "Any heat source outside the designated areas is illegal under Law 20,653, with fines up to CLP 2,000,000 or up to three years in prison. A fire in 2011 and 2012 burned about 17,600 ha (CONAF map, Wikipedia).",
   "Swimming is banned in every lake, lagoon and river in the park, and so are drones (CONAF map).",
   "CONAF's own campsites Torres, Italiano and Paso were closed for 2025-26 (CONAF bulletin)."
  ],
  "kit": [
   {
    "item": "Hardshell jacket and overtrousers",
    "why": "Gusts up to 110 km/h and rain that arrives sideways (Las Torres)."
   },
   {
    "item": "Trekking poles",
    "why": "CONAF suggests them for the boulder climb to Base Torres (CONAF bulletin)."
   },
   {
    "item": "Warm hat, gloves and a fleece",
    "why": "Temperatures drop fast when the wind picks up, even in summer."
   },
   {
    "item": "Printed bookings and park ticket",
    "why": "You may have to show every night's reservation at park entry (Worldly Adventurer)."
   },
   {
    "item": "Some Chilean pesos in cash",
    "why": "The connection bus from Laguna Amarga to the Welcome Center is CLP 4,500 cash (CONAF bulletin)."
   },
   {
    "item": "Pack liner or dry bags",
    "why": "Rain and spray on the lakeside stretches."
   },
   {
    "item": "Sunglasses and sunscreen",
    "why": "Long summer days and glare off glaciers and lakes."
   }
  ],
  "line": "Five days in a wind that gusts to 110 km/h. Every bed is booked before you land.",
  "marks": [
   {
    "label": "BASE TORRES 870",
    "lat": -50.943,
    "lon": -72.95,
    "red": true
   },
   {
    "label": "MIRADOR BRITÁNICO",
    "lat": -50.983,
    "lon": -73.054
   }
  ],
  "summit": null,
  "profile": [
   [
    0,
    40
   ],
   [
    10.5,
    80
   ],
   [
    21,
    40
   ],
   [
    28.4,
    160
   ],
   [
    29.3,
    230
   ],
   [
    34.1,
    760
   ],
   [
    39.9,
    160
   ],
   [
    41.1,
    170
   ],
   [
    44.6,
    80
   ],
   [
    55.7,
    460
   ],
   [
    56.7,
    410
   ],
   [
    61.1,
    870
   ],
   [
    65.5,
    410
   ],
   [
    71.1,
    140
   ]
  ],
  "waypoints": [
   {
    "name": "Paine Grande",
    "lat": -51.073,
    "lon": -73.094,
    "m": 40,
    "km": 0
   },
   {
    "name": "Refugio Grey",
    "lat": -51.008,
    "lon": -73.176,
    "m": 80,
    "km": 10.5
   },
   {
    "name": "Paine Grande (return)",
    "lat": -51.073,
    "lon": -73.094,
    "m": 40,
    "km": 21
   },
   {
    "name": "Italiano ranger station",
    "lat": -51.027,
    "lon": -73.04,
    "m": 160,
    "km": 28.4
   },
   {
    "name": "Mirador Francés",
    "lat": -51.02,
    "lon": -73.045,
    "m": 230,
    "km": 29.3
   },
   {
    "name": "Mirador Británico",
    "lat": -50.983,
    "lon": -73.054,
    "m": 760,
    "km": 34.1
   },
   {
    "name": "Italiano (return)",
    "lat": -51.027,
    "lon": -73.04,
    "m": 160,
    "km": 39.9
   },
   {
    "name": "Francés camp",
    "lat": -51.026,
    "lon": -73.027,
    "m": 170,
    "km": 41.1
   },
   {
    "name": "Refugio Los Cuernos",
    "lat": -51.024,
    "lon": -72.986,
    "m": 80,
    "km": 44.6
   },
   {
    "name": "Paso de los Vientos",
    "lat": -50.963,
    "lon": -72.903,
    "m": 460,
    "km": 55.7
   },
   {
    "name": "Refugio Chileno",
    "lat": -50.957,
    "lon": -72.911,
    "m": 410,
    "km": 56.7
   },
   {
    "name": "Mirador Base Torres",
    "lat": -50.943,
    "lon": -72.95,
    "m": 870,
    "km": 61.1
   },
   {
    "name": "Refugio Chileno (return)",
    "lat": -50.957,
    "lon": -72.911,
    "m": 410,
    "km": 65.5
   },
   {
    "name": "Welcome Center, Las Torres",
    "lat": -50.965,
    "lon": -72.864,
    "m": 140,
    "km": 71.1
   }
  ]
 },
 {
  "n": 4,
  "key": "kili",
  "fullName": "Kilimanjaro, Machame Route",
  "name": "Kilimanjaro",
  "line2": "by the Machame route",
  "country": "Tanzania",
  "countryShort": "Tanzania",
  "days": 7,
  "daysLabel": "7 DAYS",
  "km": 62,
  "kmLabel": "62 KM",
  "start": {
   "name": "Machame Gate",
   "m": 1800
  },
  "end": {
   "name": "Mweka Gate",
   "m": 1640
  },
  "high": {
   "name": "Uhuru Peak",
   "m": 5895
  },
  "ascent": 5000,
  "descent": 5200,
  "nightLabel": "Tents",
  "nights": [
   {
    "day": 1,
    "name": "Machame Camp",
    "m": 2850,
    "type": "tent"
   },
   {
    "day": 2,
    "name": "Shira 2 Camp",
    "m": 3810,
    "type": "tent"
   },
   {
    "day": 3,
    "name": "Barranco Camp",
    "m": 3976,
    "type": "tent"
   },
   {
    "day": 4,
    "name": "Karanga Camp",
    "m": 3995,
    "type": "tent"
   },
   {
    "day": 5,
    "name": "Barafu Camp",
    "m": 4673,
    "type": "tent"
   },
   {
    "day": 6,
    "name": "Mweka Camp",
    "m": 3068,
    "type": "tent"
   }
  ],
  "beats": [
   {
    "key": "climb",
    "name": "Barranco Wall",
    "m": 3976,
    "day": 4,
    "line": "Straight out of camp onto a steep rock wall, hands on the rock, porters with loads passing by.",
    "fact": "A non-technical scramble of nearly 900 ft, about 270 m (Ultimate Kilimanjaro)."
   },
   {
    "key": "night",
    "name": "Barafu Camp",
    "m": 4673,
    "day": 5,
    "line": "A rocky high camp on a ridge. Early dinner, a few hours of sleep, then boots on in the dark.",
    "fact": "The summit push starts around midnight (Ultimate Kilimanjaro)."
   },
   {
    "key": "top",
    "name": "Uhuru Peak",
    "m": 5895,
    "day": 6,
    "line": "The crater-rim summit, reached after 7 to 8 hours of climbing through the night.",
    "fact": "5,895 m, the highest point in Africa and the highest free-standing mountain in the world (Wikipedia)."
   }
  ],
  "season": {
   "best": "January to early March, and June to October (Duma Explorer).",
   "avoid": "The rainy months outside those windows, roughly mid-March to May and November."
  },
  "seasonShort": "Jan to Mar, Jun to Oct",
  "permits": [
   "No independent climbs: you must go with a licensed operator and a park-licensed guide (Altezza Travel).",
   "Park fees for foreign adults: USD 70 a day conservation fee, USD 50 a night camping, USD 20 rescue fee per trip, plus 18% VAT, rates published for 1 January 2025 to 30 June 2026 (Altezza Travel).",
   "Children under 10 are kept to lower altitudes: 3,700 m in the 2003 park regulations, 3,100 m according to some operators (TanzLII, Ultimate Kilimanjaro).",
   "Porter loads are weighed at the park gate before the climb (Kandoo Adventures)."
  ],
  "price": {
   "low": 2657,
   "high": 4266
  },
  "group": {
   "min": 1,
   "max": 14
  },
  "facts": [
   "Summit night starts around midnight, and the climb to Uhuru takes 7 to 8 hours (Ultimate Kilimanjaro).",
   "Porters should carry no more than 20 kg of company load, on top of their own kit (KPAP).",
   "Park fees make up about half the price of a climb (Altezza Travel).",
   "The mountain lost about 85% of its ice between 1912 and 2011 (Wikipedia).",
   "On 29 September 2026 a wildfire closed the Lemosho and Londorosi routes, and climbers were sent to Machame, Marangu and Rongai instead (Bernama, TANAPA)."
  ],
  "kit": [
   {
    "item": "Down jacket and insulated mitts",
    "why": "Wind and cold on summit night 'can be extreme' (Ultimate Kilimanjaro)."
   },
   {
    "item": "Headlamp and spare batteries",
    "why": "The summit push is several hours in darkness (Ultimate Kilimanjaro)."
   },
   {
    "item": "Trekking poles",
    "why": "The descent from the summit is rocky and hard on the knees (Ultimate Kilimanjaro)."
   },
   {
    "item": "Sleeping bag rated well below freezing",
    "why": "Barafu Camp sits at 4,673 m."
   },
   {
    "item": "Duffel within the porter limit",
    "why": "Your main bag, sleeping bag included, is limited to 15 kg (Kandoo Adventures)."
   },
   {
    "item": "Water bottles and purification tablets",
    "why": "Water is collected from streams and treated at camp."
   },
   {
    "item": "Cash for crew tips",
    "why": "Altezza recommends USD 250 to 350 per climber (Altezza Travel)."
   }
  ],
  "line": "Seven days to the roof of Africa. Summit night starts at midnight.",
  "marks": [
   {
    "label": "UHURU PEAK 5 895",
    "lat": -3.076,
    "lon": 37.354,
    "red": true
   },
   {
    "label": "BARAFU CAMP",
    "lat": -3.1,
    "lon": 37.379
   }
  ],
  "summit": null,
  "profile": [
   [
    0,
    1800
   ],
   [
    11,
    2850
   ],
   [
    16,
    3810
   ],
   [
    23,
    4630
   ],
   [
    26,
    3976
   ],
   [
    31,
    3995
   ],
   [
    35,
    4673
   ],
   [
    39,
    5756
   ],
   [
    40,
    5895
   ],
   [
    44.7,
    4673
   ],
   [
    52,
    3068
   ],
   [
    62,
    1640
   ]
  ],
  "waypoints": [
   {
    "name": "Machame Gate",
    "lat": -3.174,
    "lon": 37.239,
    "m": 1800,
    "km": 0
   },
   {
    "name": "Machame Camp",
    "lat": -3.095,
    "lon": 37.266,
    "m": 2850,
    "km": 11
   },
   {
    "name": "Shira 2 Camp",
    "lat": -3.055,
    "lon": 37.276,
    "m": 3810,
    "km": 16
   },
   {
    "name": "Lava Tower",
    "lat": -3.068,
    "lon": 37.327,
    "m": 4630,
    "km": 23
   },
   {
    "name": "Barranco Camp",
    "lat": -3.095,
    "lon": 37.33,
    "m": 3976,
    "km": 26
   },
   {
    "name": "Karanga Camp",
    "lat": -3.113,
    "lon": 37.355,
    "m": 3995,
    "km": 31
   },
   {
    "name": "Barafu Camp",
    "lat": -3.1,
    "lon": 37.379,
    "m": 4673,
    "km": 35
   },
   {
    "name": "Stella Point",
    "lat": -3.079,
    "lon": 37.362,
    "m": 5756,
    "km": 39
   },
   {
    "name": "Uhuru Peak",
    "lat": -3.076,
    "lon": 37.354,
    "m": 5895,
    "km": 40
   },
   {
    "name": "Barafu Camp (descent)",
    "lat": -3.1,
    "lon": 37.379,
    "m": 4673,
    "km": 44.7
   },
   {
    "name": "Mweka Camp",
    "lat": -3.157,
    "lon": 37.367,
    "m": 3068,
    "km": 52
   },
   {
    "name": "Mweka Gate",
    "lat": -3.22,
    "lon": 37.342,
    "m": 1640,
    "km": 62
   }
  ]
 },
 {
  "n": 5,
  "key": "everest",
  "fullName": "Everest Base Camp and Kala Patthar",
  "name": "Everest",
  "line2": "Base Camp and Kala Patthar",
  "country": "Nepal",
  "countryShort": "Nepal",
  "days": 12,
  "daysLabel": "12 DAYS",
  "km": 120,
  "kmLabel": "120 KM",
  "start": {
   "name": "Lukla",
   "m": 2860
  },
  "end": {
   "name": "Lukla",
   "m": 2860
  },
  "high": {
   "name": "Kala Patthar",
   "m": 5644
  },
  "ascent": 6000,
  "descent": 6000,
  "nightLabel": "Teahouses",
  "nights": [
   {
    "day": 1,
    "name": "Phakding",
    "m": 2610,
    "type": "teahouse"
   },
   {
    "day": 2,
    "name": "Namche Bazaar",
    "m": 3440,
    "type": "teahouse"
   },
   {
    "day": 3,
    "name": "Namche Bazaar (acclimatisation day)",
    "m": 3440,
    "type": "teahouse"
   },
   {
    "day": 4,
    "name": "Tengboche",
    "m": 3867,
    "type": "teahouse"
   },
   {
    "day": 5,
    "name": "Dingboche",
    "m": 4410,
    "type": "teahouse"
   },
   {
    "day": 6,
    "name": "Dingboche (acclimatisation day)",
    "m": 4410,
    "type": "teahouse"
   },
   {
    "day": 7,
    "name": "Lobuche",
    "m": 4940,
    "type": "teahouse"
   },
   {
    "day": 8,
    "name": "Gorak Shep",
    "m": 5164,
    "type": "teahouse"
   },
   {
    "day": 9,
    "name": "Pheriche",
    "m": 4371,
    "type": "teahouse"
   },
   {
    "day": 10,
    "name": "Namche Bazaar",
    "m": 3440,
    "type": "teahouse"
   },
   {
    "day": 11,
    "name": "Lukla",
    "m": 2860,
    "type": "teahouse"
   }
  ],
  "beats": [
   {
    "key": "climb",
    "name": "Namche Hill",
    "m": 3440,
    "day": 2,
    "line": "Over the high suspension bridges, then a long switchback climb to the horseshoe-shaped town of Namche Bazaar.",
    "fact": "Monjo to Namche climbs about 660 m in 6.5 km (Stingy Nomads)."
   },
   {
    "key": "night",
    "name": "Gorak Shep",
    "m": 5164,
    "day": 8,
    "line": "A huddle of teahouses on a frozen, sand-covered lakebed, the highest bed of the trek.",
    "fact": "Gorak Shep, 5,164 m, was the first Everest base camp, used by the 1952 Swiss expedition (Wikipedia)."
   },
   {
    "key": "top",
    "name": "Kala Patthar",
    "m": 5644,
    "day": 9,
    "line": "A dawn climb up a dark ridge above Gorak Shep for the closest view of Everest's summit.",
    "fact": "The most accessible close-up view of Everest, 5,644 m by GPS (5,545 m in many guides) (Wikipedia)."
   }
  ],
  "season": {
   "best": "March to May, and late September to November (Stingy Nomads, operators).",
   "avoid": "June to August, the monsoon: rain, leeches, slippery trails and cancelled flights. December to February is quiet but very cold (operators)."
  },
  "seasonShort": "Mar to May, Oct to Nov",
  "permits": [
   "Sagarmatha National Park entry: NPR 3,000 for foreigners (Himalayan Times). Some counters add 13% VAT, making NPR 3,390 (Setopati, via search).",
   "Khumbu Pasang Lhamu Rural Municipality trek card: NPR 3,000 for most foreigners, NPR 2,000 for SAARC countries and China, issued in Lukla (municipality website, Himal Press).",
   "TIMS card: the local trek card replaced it in Khumbu, but the national position is disputed, so confirm with a registered agency (Explore Vision Nepal).",
   "Guides: Nepal made licensed guides mandatory for foreign trekkers in 2023, but the Khumbu municipality said solo trekkers are still allowed in the Everest region. Check the current position (Kathmandu Post, Explore Vision Nepal).",
   "In peak season Lukla flights leave from Manthali (Ramechhap), not Kathmandu (Ekantipur, October 2026)."
  ],
  "price": {
   "low": 1048,
   "high": 2695
  },
  "group": {
   "min": 1,
   "max": 16
  },
  "facts": [
   "Lukla's runway is 527 m long with an 11.7% slope (Wikipedia).",
   "In good weather up to 60 flights a day shuttle between Manthali and Lukla, but cloud grounds them for days at a time (Rising Nepal, 2024).",
   "On the Everest Base Camp route, altitude illness can approach 30% at higher elevations even on standard schedules (CDC).",
   "Nuptse hides Everest's summit from much of the area, which is why Kala Patthar is the classic viewpoint (Wikipedia).",
   "Tengboche monastery has been destroyed twice, by an earthquake in 1934 and a fire in 1989 (Wikipedia)."
  ],
  "kit": [
   {
    "item": "Down jacket",
    "why": "Teahouse rooms are unheated, and Gorak Shep sits at 5,164 m."
   },
   {
    "item": "Sleeping bag rated well below freezing",
    "why": "Teahouse bedding is thin, and nights above 4,000 m are cold."
   },
   {
    "item": "Refillable bottle and purification",
    "why": "Khumbu announced a single-use plastic ban from January 2020 (Himalayan Times)."
   },
   {
    "item": "Cash in Nepali rupees",
    "why": "The trek card is issued over the counter in Lukla (municipality website)."
   },
   {
    "item": "Insurance that covers helicopter rescue above 5,000 m",
    "why": "The route tops out at about 5,600 m."
   },
   {
    "item": "Trekking poles",
    "why": "Long stone-stair descents on the way back to Lukla."
   },
   {
    "item": "Buff or face cover",
    "why": "Dry, dusty, cold air on the trail."
   },
   {
    "item": "Headlamp",
    "why": "The Kala Patthar climb starts before dawn."
   }
  ],
  "line": "Twelve days, eleven teahouse beds, and one dawn with Everest across the valley.",
  "marks": [
   {
    "label": "KALA PATTHAR 5 644",
    "lat": 27.996,
    "lon": 86.828,
    "red": true
   },
   {
    "label": "EVEREST 8 849",
    "lat": 27.9881,
    "lon": 86.925
   },
   {
    "label": "BASE CAMP",
    "lat": 28.003,
    "lon": 86.856
   }
  ],
  "summit": null,
  "profile": [
   [
    0,
    2860
   ],
   [
    8,
    2610
   ],
   [
    13,
    2780
   ],
   [
    19.5,
    3440
   ],
   [
    30.5,
    3867
   ],
   [
    35.1,
    3985
   ],
   [
    41,
    4410
   ],
   [
    49.7,
    4940
   ],
   [
    54.7,
    5164
   ],
   [
    58.2,
    5364
   ],
   [
    61.7,
    5164
   ],
   [
    63.7,
    5644
   ],
   [
    65.7,
    5164
   ],
   [
    77.7,
    4371
   ],
   [
    98.2,
    3440
   ],
   [
    118.2,
    2860
   ]
  ],
  "waypoints": [
   {
    "name": "Lukla",
    "lat": 27.688,
    "lon": 86.731,
    "m": 2860,
    "km": 0
   },
   {
    "name": "Phakding",
    "lat": 27.74,
    "lon": 86.713,
    "m": 2610,
    "km": 8
   },
   {
    "name": "Monjo (park entrance)",
    "lat": 27.771,
    "lon": 86.723,
    "m": 2780,
    "km": 13
   },
   {
    "name": "Namche Bazaar",
    "lat": 27.805,
    "lon": 86.713,
    "m": 3440,
    "km": 19.5
   },
   {
    "name": "Tengboche",
    "lat": 27.836,
    "lon": 86.764,
    "m": 3867,
    "km": 30.5
   },
   {
    "name": "Pangboche",
    "lat": 27.858,
    "lon": 86.794,
    "m": 3985,
    "km": 35.1
   },
   {
    "name": "Dingboche",
    "lat": 27.892,
    "lon": 86.831,
    "m": 4410,
    "km": 41
   },
   {
    "name": "Lobuche",
    "lat": 27.948,
    "lon": 86.811,
    "m": 4940,
    "km": 49.7
   },
   {
    "name": "Gorak Shep",
    "lat": 27.98,
    "lon": 86.829,
    "m": 5164,
    "km": 54.7
   },
   {
    "name": "Everest Base Camp",
    "lat": 28.003,
    "lon": 86.856,
    "m": 5364,
    "km": 58.2
   },
   {
    "name": "Gorak Shep (return)",
    "lat": 27.98,
    "lon": 86.829,
    "m": 5164,
    "km": 61.7
   },
   {
    "name": "Kala Patthar",
    "lat": 27.996,
    "lon": 86.828,
    "m": 5644,
    "km": 63.7
   },
   {
    "name": "Gorak Shep (return)",
    "lat": 27.98,
    "lon": 86.829,
    "m": 5164,
    "km": 65.7
   },
   {
    "name": "Pheriche",
    "lat": 27.894,
    "lon": 86.82,
    "m": 4371,
    "km": 77.7
   },
   {
    "name": "Namche Bazaar (return)",
    "lat": 27.805,
    "lon": 86.713,
    "m": 3440,
    "km": 98.2
   },
   {
    "name": "Lukla (return)",
    "lat": 27.688,
    "lon": 86.731,
    "m": 2860,
    "km": 118.2
   }
  ]
 }
];
