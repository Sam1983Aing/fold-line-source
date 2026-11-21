# Five treks: researched figures

Researched 14 Oct 2026. Recheck every figure before publishing: park rules, fees and prices change every season, and two of these treks had fire or flood closures in the last twelve months.

## How to read this file

- Every number is followed by its source as a link. Where sources disagree, the section's "Conflicts and ranges" note gives the spread and who says what.
- Some numbers are my own measurements, marked **(measured)**. Waypoint distances were measured along the trek's OpenStreetMap route trace, and elevations marked this way were read from a terrain model through [OpenTopoData](https://www.opentopodata.org/) (the 8 m [NZ DEM](https://www.opentopodata.org/datasets/nzdem/) for New Zealand, 30 m [SRTM](https://www.opentopodata.org/datasets/srtm/) elsewhere). I used them only to place waypoints and to fill gaps where no published figure exists. Checked against the published figures, they agree within about 20 to 60 m.
- In each "Sources" list, links I opened and read are listed first. Links I only saw in search results are listed separately and are lower confidence.
- `treks.json` carries the same numbers. Each trek has an extra `estimated_fields` list naming the values that are measured or derived rather than published.
- Prices in USD use the rates of 14 Oct 2026 from [open.er-api.com](https://open.er-api.com/v6/latest/USD): 1 USD = 1.7817 NZD, 1.4221 CAD, 976.09 CLP, 152.50 NPR, 3.4404 PEN.

A few trekking words used below:

- **Acclimatisation**: letting the body adjust to thinner air by climbing slowly and resting at a height before going higher.
- **Porter**: a local worker who carries the group's food, tents and your bag between camps.
- **Refugio**: a mountain hut with bunk rooms and meals, run by a park concession.
- **Teahouse**: a family-run lodge on Himalayan trails with simple rooms and a shared dining room.
- **Pass**: the lowest crossing point of a ridge, usually the high point of a trail day.
- **Scree**: loose broken rock on a slope that slides under your boots.
- **Moraine**: a ridge of boulders and gravel left behind by a glacier.

## Headline numbers

| # | Trek | Days | Distance | High point | Climb | Night | Top |
|---|---|---|---|---|---|---|---|
| 01 | Tongariro Alpine Crossing | 1 | 19.4 km | Red Crater, 1,886 m | Devil's Staircase | South Crater (no night) | Red Crater, 1,886 m |
| 02 | Classic Inca Trail | 4 | 42 km | Dead Woman's Pass, 4,215 m | Dead Woman's Pass | Wiñay Wayna, 2,650 m | Inti Punku (Sun Gate), 2,745 m |
| 03 | W Trek, Torres del Paine | 5 | 71 km | Mirador Base Torres, 870 m | Valle del Francés to Mirador Británico | Refugio Chileno, 410 m | Mirador Base Torres, 870 m |
| 04 | Kilimanjaro, Machame | 7 | 62 km | Uhuru Peak, 5,895 m | Barranco Wall | Barafu Camp, 4,673 m | Uhuru Peak, 5,895 m |
| 05 | Everest Base Camp | 12 | 120 km | Kala Patthar, 5,644 m | Namche Hill | Gorak Shep, 5,164 m | Kala Patthar, 5,644 m |

---

## 01 Tongariro Alpine Crossing, New Zealand

### The numbers

- **Distance:** 19.4 km, one way ([Wikipedia](https://en.wikipedia.org/wiki/Tongariro_Alpine_Crossing), citing DOC, the Department of Conservation). The OpenStreetMap route relation is also tagged 19.4 km, and its trace measures 19.7 km **(measured)**.
- **Days:** 1.
- **Walking time:** DOC says "allow 9 hours" ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/)). Wikipedia says about 7 hours of steady walking in good weather ([Wikipedia](https://en.wikipedia.org/wiki/Tongariro_Alpine_Crossing)).
- **Start:** Mangatepōpō road end, 1,120 m ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/description)).
- **End:** Ketetahi road end, 760 m ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/description)).
- **High point:** Red Crater, 1,886 m ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/description)).
- **Descent:** 1,196 m. DOC's elevation profile gives "+/- 1196 m" ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/description)), and the terrain model gives 1,195 m of descent along the track **(measured)**.
- **Ascent:** about 830 m **(measured)**. The simple difference between start and high point is 766 m, and the extra comes from the climbs after Red Crater.
- The first 5.4 km share the track with the Soda Springs Walk ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/)).

### Day by day

| Day | From | To | Distance | Hours | Overnight | Night type |
|---|---|---|---|---|---|---|
| 1 | Mangatepōpō road end, 1,120 m | Ketetahi road end, 760 m | 19.4 km | allow 9 h | none | none |

Along the way **(measured, scaled to 19.4 km)**: Soda Springs turn-off at about 4.3 km, top of the Devil's Staircase at 6.5 km, South Crater at 6.9 km, Red Crater at 8.2 km, Emerald Lakes at 8.6 km, Blue Lake at 9.7 km, Ketetahi Shelter at 13.1 km.

### Waypoints for the elevation profile

Coordinates from OpenStreetMap. Distances measured along the OSM trace and scaled to the 19.4 km total.

| # | Point | Lat | Lon | Elev (m) | Elevation source | km |
|---|---|---|---|---|---|---|
| 1 | Mangatepōpō road end | -39.145 | 175.581 | 1,120 | [DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/description) | 0.0 |
| 2 | Soda Springs turn-off | -39.140 | 175.625 | 1,370 | measured (NZ DEM) | 4.3 |
| 3 | South Crater rim, top of the Devil's Staircase | -39.143 | 175.636 | 1,670 | measured (NZ DEM) | 6.5 |
| 4 | South Crater | -39.142 | 175.641 | 1,650 | [Wikipedia](https://en.wikipedia.org/wiki/Tongariro_Alpine_Crossing) | 6.9 |
| 5 | Red Crater | -39.136 | 175.650 | 1,886 | [DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/description) | 8.2 |
| 6 | Emerald Lakes | -39.134 | 175.654 | 1,695 | [Wikipedia](https://en.wikipedia.org/wiki/Tongariro_Alpine_Crossing) (Emerald Lakes turn-off) | 8.6 |
| 7 | Blue Lake | -39.127 | 175.659 | 1,720 | measured (NZ DEM) | 9.7 |
| 8 | North Crater flank | -39.124 | 175.656 | 1,750 | measured (NZ DEM) | 10.1 |
| 9 | Ketetahi Shelter | -39.108 | 175.653 | 1,450 | [Wikipedia](https://en.wikipedia.org/wiki/Tongariro_Alpine_Crossing) (Ketetahi Hut) | 13.1 |
| 10 | Ketetahi road end | -39.074 | 175.664 | 760 | [DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/description) | 19.4 |

### The three beats

| Beat | Name | Elev | Day | What happens | Fact to print |
|---|---|---|---|---|---|
| THE CLIMB | Devil's Staircase | 1,650 m at the top | 1 | From the Soda Springs turn-off the track climbs steps and old lava flows to the rim of South Crater. | "A climb of around 350 m up a staircase to South Crater" ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/description)) |
| THE NIGHT (middle moment) | South Crater | 1,650 m | 1 | No night on this one. The pause is a flat, silent crater floor between the two climbs, with Ngāuruhoe on your right. | South Crater, about 1,650 m ([Wikipedia](https://en.wikipedia.org/wiki/Tongariro_Alpine_Crossing)): the only flat stretch between the two big climbs. |
| THE TOP | Red Crater | 1,886 m | 1 | A rust-red vent on the ridge, with the Emerald Lakes shining in the scree below. | Red Crater, 1,886 m, the highest point on the crossing ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/description)). |

Why these: the Devil's Staircase is the hardest sustained climb of the day. South Crater is the natural breath between the two climbs, and it keeps the three beats in walking order (climb, pause, top). Red Crater is the high point and the view down onto the Emerald Lakes.

Alternative: if the colour matters more than the order, use the **Emerald Lakes** (1,695 m, 8.6 km) as the middle moment. They are the most photographed stop and the usual lunch spot, but they come about 400 m after the high point, so on an elevation profile the "night" marker would sit after the "top" marker.

### Permits and rules

- No permit or fee. A track booking is recommended for everyone, is free, and is required if you use a shuttle or a guided walk ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/)).
- Parking: "During the summer there is no parking for visitors doing the Tongariro Alpine Crossing at Mangatepopo car park." At the far end there is a private car park near Ketetahi ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/getting-there)). DOC advises against parking on State Highway shoulders (same source).
- Shuttles are the recommended way in, from Ohakune, Taumarunui, Tūrangi and Taupō ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/getting-there)).
- In summer DOC checks the forecast at 6 am every day and can issue a "Not Recommended Today" advisory. No advisories are issued from May to October ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/)).
- Drones need a permit. Mountain bikes are not allowed ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/)).
- Fires started on 8 November 2025 and burned an estimated 2,935 ha. The Crossing reopened at 9 am on 17 November 2025. Mangatepopo Track stayed closed, the Mangatepopo Road car park was damaged, and for a time only shuttle drop-offs were allowed on Mangatepopo Road ([DOC release](https://www.doc.govt.nz/news/media-releases/2025-media-releases/tongariro-alpine-crossing-reopens/)).
- The hapū Ngāti Hikairo ki Tongariro placed a 10-year restorative rāhui (a customary Māori restriction) over the burnt area. Stay on the tracks ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/description)).
- DOC does not recommend the crossing for children under 10 ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/)).

### Season

- **Best:** November to April, the summer season, when shuttles run and the daily advisory operates ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/)).
- **Avoid (unless guided):** May to late October. DOC says winter needs alpine skills and a helmet, crampons, ice axe, avalanche transceiver, probe and shovel, shuttles generally do not run, and winter daylight is only 9 to 11 hours ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/)).

### Altitude

Not a factor. The high point, 1,886 m, is below the 2,450 m sleeping altitude where the CDC says altitude illness starts to become a risk ([CDC](https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/high-altitude-travel-and-altitude-illness.html)), and nobody sleeps up there. The real hazards DOC lists are weather, loose rock on Red Crater, geothermal ground and volcanic activity ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/)).

### Group size and price

- **Adrift Tongariro, Premium Tongariro Crossing Guided Group Walk:** high season adult NZD 450 (about USD 253). A special of NZD 329 per person (about USD 185) runs only until 15 Oct 2026 ([Visit Ruapehu](https://www.visitruapehu.com/see-and-do/all-activities/premium-tongariro-crossing-guided-walk_1)). Another listing shows NZD 425 (about USD 239) high season. The booking page lists guides, transport, winter equipment and a NZD 60 clothing and footwear hire allowance as included ([Adrift on Rezdy, search result](https://adriftnz.rezdy.com/123189/premium-tongariro-crossing-guided-group-walk)).
- **Private guided walk:** NZD 2,550 on newzealand.com, currency and per-person basis not stated ([newzealand.com, search result](https://www.newzealand.com/nz/plan/business/private-tongariro-crossing-guided-walk)).
- **Shuttles only:** about NZD 35 one way from Ketetahi to the start ([Adventure HQ on Bookme, search result](https://www.bookme.co.nz/things-to-do/rotorua-taupo/activity/tongariro-alpine-crossing-shuttle-one-way-transport-ketetahi-to-mangatepopo/4198/lang/fr)), NZD 130 return from Taupō ([Tongariro Expeditions on newzealand.com, search result](https://www.newzealand.com/nz/plan/business/taupo-return-shuttle-for-the-tongariro-alpine-crossing/)). DOC puts a typical shuttle fee at about NZD 40, part of which funds conservation work ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/)).
- **Group size:** in DOC's 2023 guiding concession applications, several operators proposed a cap of 15 people including the guide, and Adrift asked for 50 ([DOC consultation, search result](https://www.doc.govt.nz/get-involved/have-your-say/all-consultations/2023-consultations/consultations-on-authorisation-applications/applications-for-guiding-on-the-tongariro-alpine-crossing/)). Chris Jolly Outdoors advertises a maximum of 4 ([newzealand.com, search result](https://www.newzealand.com/uk/plan/business/chris-jolly-outdoors-4922142/)).
- For the booking panel: USD 185 to 253 per person for a guided group walk, groups of 1 to 15.

### What you need to know

1. It is one-way. You finish 19.4 km from where you started, and in summer you cannot park at the start at all, so the shuttle is part of the plan ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/getting-there), [Wikipedia](https://en.wikipedia.org/wiki/Tongariro_Alpine_Crossing)).
2. The Emerald Lakes look swimmable but are off limits. DOC asks walkers not to touch or enter any lake ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/)).
3. DOC has asked tour operators to stop calling Ngāuruhoe "Mt Doom" ([Wikipedia](https://en.wikipedia.org/wiki/Tongariro_National_Park)). Climbing it as a side trip is no longer permitted, at the request of local iwi ([Wikipedia](https://en.wikipedia.org/wiki/Tongariro_Alpine_Crossing)).
4. Walker numbers grew from about 10,000 in 1990 to about 125,000 in 2015 ([Wikipedia](https://en.wikipedia.org/wiki/Tongariro_National_Park)).
5. No water on the track is safe to drink. Carry 2 to 3 litres. There are toilets every 1 to 2 hours ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/)).

### Kit

| Item | Why |
|---|---|
| Waterproof, windproof jacket | Alpine weather changes fast and snow can fall in any month ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/)). |
| 2 to 3 litres of water | No water on the track is safe to drink ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/)). |
| Boots with real grip | Loose rock on the slopes of Red Crater is the main slip hazard ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/description)). |
| Warm layer, hat and gloves | Hours on exposed ridges above 1,600 m, even on a sunny day. |
| Sunscreen and sunglasses | No shade between the valley and the bush on the far side. |
| Lunch and snacks | DOC says to allow 9 hours. |
| Shuttle booking | The track ends 19.4 km from where it starts. |
| Winter only: crampons, ice axe, helmet, avalanche transceiver, probe, shovel | DOC lists these for May to late October, and you need to know how to use them ([DOC](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/)). |

### Conflicts and ranges

- **Distance:** 19.4 km (Wikipedia citing DOC, and the OpenStreetMap tag). DOC's current pages no longer print a total. The OSM trace measures 19.7 km. The Te Araroa long trail uses a 17.5 km section with a different start.
- **Time:** DOC says allow 9 h. Wikipedia says about 7 h of steady walking. Adrift's listing says about 8 h.
- **Red Crater:** 1,886 m (DOC, Wikipedia). One travel site and the OpenStreetMap peak tag give 1,868 m, which looks like swapped digits.
- **Start:** 1,120 m (DOC, Wikipedia). One tour PDF gives 1,100 m. The terrain model reads 1,122 m.
- **Ascent:** 766 m is the simple difference. The terrain model gives about 830 m. DOC's "+/- 1196 m" matches the measured descent of 1,195 m, so it is the descent figure.
- **Soda Springs:** DOC says the first 5.4 km share the Soda Springs Walk. On the OSM trace the spring itself sits 4.4 km in, and the staircase starts soon after.
- **Parking:** earlier seasons had 4-hour limits at the road ends (an operator listing still cites a 4-hour limit at Ketetahi). DOC's current page says there is no visitor parking at Mangatepōpō in summer at all. Treat the current DOC wording as the rule.
- **Walking time vs daylight:** DOC's 9 h and winter daylight of 9 to 11 h leave little margin, which is why winter walks start very early.

### Sources

Opened and read:
- [DOC, Tongariro Alpine Crossing](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/)
- [DOC, track description](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/description)
- [DOC, getting there](https://www.doc.govt.nz/parks-and-recreation/places-to-go/central-north-island/places/tongariro-national-park/things-to-do/tracks/tongariro-alpine-crossing/getting-there)
- [DOC media release, Crossing reopens after fire, Nov 2025](https://www.doc.govt.nz/news/media-releases/2025-media-releases/tongariro-alpine-crossing-reopens/)
- [Wikipedia, Tongariro Alpine Crossing](https://en.wikipedia.org/wiki/Tongariro_Alpine_Crossing)
- [Wikipedia, Tongariro National Park](https://en.wikipedia.org/wiki/Tongariro_National_Park)
- [Visit Ruapehu, Adrift guided walk listing](https://www.visitruapehu.com/see-and-do/all-activities/premium-tongariro-crossing-guided-walk_1)
- [CDC Yellow Book, high-altitude travel](https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/high-altitude-travel-and-altitude-illness.html)
- [OpenStreetMap route relation 104369](https://www.openstreetmap.org/relation/104369) and [NZ DEM via OpenTopoData](https://www.opentopodata.org/datasets/nzdem/) for the measured values

Seen only in search results (lower confidence):
- [Adrift booking page on Rezdy](https://adriftnz.rezdy.com/123189/premium-tongariro-crossing-guided-group-walk)
- [newzealand.com, private guided walk](https://www.newzealand.com/nz/plan/business/private-tongariro-crossing-guided-walk)
- [newzealand.com, Tongariro Expeditions Taupō shuttle](https://www.newzealand.com/nz/plan/business/taupo-return-shuttle-for-the-tongariro-alpine-crossing/)
- [Bookme, Ketetahi one-way shuttle](https://www.bookme.co.nz/things-to-do/rotorua-taupo/activity/tongariro-alpine-crossing-shuttle-one-way-transport-ketetahi-to-mangatepopo/4198/lang/fr)
- [DOC, 2023 guiding concession applications](https://www.doc.govt.nz/get-involved/have-your-say/all-consultations/2023-consultations/consultations-on-authorisation-applications/applications-for-guiding-on-the-tongariro-alpine-crossing/)
- [newzealand.com, Chris Jolly Outdoors](https://www.newzealand.com/uk/plan/business/chris-jolly-outdoors-4922142/)

### The map in V4's interior (15 Oct 2026)

- **Track:** the geometry of [OpenStreetMap relation 104369](https://www.openstreetmap.org/relation/104369) (tagged operator Department of Conservation, distance 19.4), fetched through the [Overpass API](https://overpass-api.de/) on 15 Oct 2026. Its 42 ways chain end to end into one line of 3,468 points, 19.63 km by my measure. © OpenStreetMap contributors, [ODbL](https://www.openstreetmap.org/copyright). The page's km readouts are scaled to the published 19.4 km.
- **Ground:** [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) at zoom 14 (about 7.4 m a pixel here, the New Zealand DEM in this area), 110 tiles. Checked against the published heights: the road end reads 1,125 m (DOC 1,120), Soda Springs 1,371 (measured 1,370), the staircase top 1,670 (1,670), Ketetahi road end 760 (760). Summits read low, as before: Ngāuruhoe 2,200 against 2,291, Red Crater 1,851 against 1,886. Printed heights come from this file, never from the grid.
- How the strip map and the skyline bands are made: `tools/terrain/README.md`.

---

## 02 Classic Inca Trail to Machu Picchu, Peru

### The numbers

- **Distance:** 42 km ([Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu)). Operators' daily figures add up to 45 km ([Intrepid](https://www.intrepidtravel.com/uk/peru/peru-trek-inca-trail-4-days-159971): 12, 12, 15 and 6 km. [Alpaca Expeditions](https://www.alpacaexpeditions.com/classic-inca-trail-trek-4d3n-group-service/): 14, 16, 10 and 5 km).
- **Days:** 4, with 3 nights in tents.
- **Walking hours:** about 8, 8, 10 and 4 hours ([Intrepid](https://www.intrepidtravel.com/uk/peru/peru-trek-inca-trail-4-days-159971)). Alpaca gives 6 to 7, 7 to 8 and 5 hours for days 1 to 3 ([Alpaca Expeditions](https://www.alpacaexpeditions.com/classic-inca-trail-trek-4d3n-group-service/)).
- **Start:** KM 82 at Piscacucho, 2,720 m ([Alpaca Expeditions](https://www.alpacaexpeditions.com/classic-inca-trail-trek-4d3n-group-service/)).
- **End:** Machu Picchu, 2,430 m ([Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu)).
- **High point:** Warmiwañusca, known as Dead Woman's Pass, 4,215 m ([Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu), [Alpaca Expeditions](https://www.alpacaexpeditions.com/classic-inca-trail-trek-4d3n-group-service/)).
- **Ascent and descent:** Intrepid's daily figures add up to 2,020 m up and 2,376 m down ([Intrepid](https://www.intrepidtravel.com/uk/peru/peru-trek-inca-trail-4-days-159971)). Wikipedia gives an approximate gain of 2,500 m ([Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu)).

### Day by day

Campsites are allocated, so day 1 and day 2 camps vary by group. Intrepid's pattern is shown, with Alpaca's in the notes.

| Day | From | To | Distance | Hours | Overnight elev | Night type |
|---|---|---|---|---|---|---|
| 1 | KM 82, Piscacucho | Camp near Wayllabamba | 12 km ([Intrepid](https://www.intrepidtravel.com/uk/peru/peru-trek-inca-trail-4-days-159971)) | about 8 h | 3,100 m ([Intrepid](https://www.intrepidtravel.com/uk/peru/peru-trek-inca-trail-4-days-159971)) | tent |
| 2 | Wayllabamba, over Dead Woman's Pass (4,215 m) | Pacaymayo camp | 12 km | about 8 h | 3,650 m ([Intrepid](https://www.intrepidtravel.com/uk/peru/peru-trek-inca-trail-4-days-159971)) | tent |
| 3 | Pacaymayo, over Runkurakay pass, past Sayacmarca and Phuyupatamarca | Wiñay Wayna camp | 15 km | about 10 h | 2,650 m ([Wikipedia](https://en.wikipedia.org/wiki/Wi%C3%B1ay_Wayna)) | tent |
| 4 | Wiñay Wayna, through Inti Punku (Sun Gate) | Machu Picchu | 6 km | about 4 h | none (the night is in Aguas Calientes or Cusco, outside the trek) | none |

Alpaca's pattern: day 1 to Ayapata (14 km, camp 3,300 m), day 2 over both passes to Chaquicocha (16 km, camp 3,600 m), day 3 to Wiñay Wayna (10 km), day 4 to Machu Picchu (5 km) ([Alpaca Expeditions](https://www.alpacaexpeditions.com/classic-inca-trail-trek-4d3n-group-service/)).

### Waypoints for the elevation profile

Coordinates from OpenStreetMap. The OSM trace measures 35.6 km from KM 82 to the Machu Picchu control gate, shorter than every published figure because the stairs and switchbacks are simplified, so positions are scaled to the 42 km total **(measured, scaled)**.

| # | Point | Lat | Lon | Elev (m) | Elevation source | km |
|---|---|---|---|---|---|---|
| 1 | KM 82, Piscacucho | -13.215 | -72.382 | 2,720 | [Alpaca](https://www.alpacaexpeditions.com/classic-inca-trail-trek-4d3n-group-service/) | 0.0 |
| 2 | Wayllabamba (day 1 camp area) | -13.257 | -72.443 | 3,100 | [Intrepid](https://www.intrepidtravel.com/uk/peru/peru-trek-inca-trail-4-days-159971) (day 1 camp) | 13.4 |
| 3 | Ayapata | -13.259 | -72.462 | 3,300 | [Alpaca](https://www.alpacaexpeditions.com/classic-inca-trail-trek-4d3n-group-service/) | 17.2 |
| 4 | Llulluchapampa | -13.251 | -72.472 | 3,800 | [Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu) | 19.1 |
| 5 | Dead Woman's Pass (Warmiwañusca) | -13.243 | -72.484 | 4,215 | [Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu) | 21.1 |
| 6 | Pacaymayo camp | -13.234 | -72.498 | 3,600 | [Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu) (about 600 m below the pass) | 23.7 |
| 7 | Runkurakay pass | -13.227 | -72.505 | 3,950 | [Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu) | 25.3 |
| 8 | Sayacmarca | -13.228 | -72.516 | 3,610 | measured (SRTM) | 26.8 |
| 9 | Chaquicocha camp | -13.223 | -72.519 | 3,600 | [Alpaca](https://www.alpacaexpeditions.com/classic-inca-trail-trek-4d3n-group-service/) | 27.8 |
| 10 | Phuyupatamarca | -13.207 | -72.530 | 3,600 | [Alpaca](https://www.alpacaexpeditions.com/classic-inca-trail-trek-4d3n-group-service/) | 31.1 |
| 11 | Wiñay Wayna | -13.190 | -72.537 | 2,650 | [Wikipedia](https://en.wikipedia.org/wiki/Wi%C3%B1ay_Wayna) | 36.3 |
| 12 | Inti Punku (Sun Gate) | -13.170 | -72.534 | 2,745 | [Andean Trails, search result](https://www.andeantrails.co.uk/blog/sun-gate-machu-picchu) | 40.0 |
| 13 | Machu Picchu | -13.166 | -72.543 | 2,430 | [Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu) | 42.0 |

### The three beats

| Beat | Name | Elev | Day | What happens | Fact to print |
|---|---|---|---|---|---|
| THE CLIMB | Dead Woman's Pass (Abra Warmiwañusca) | 4,215 m | 2 | A morning of stone stairs, more than 1,100 m of climbing from the valley to the highest pass of the trail (Intrepid's day 2 gain is 1,127 m). | 4,215 m, the highest point of the trail ([Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu), [Alpaca](https://www.alpacaexpeditions.com/classic-inca-trail-trek-4d3n-group-service/)). |
| THE NIGHT | Wiñay Wayna camp | 2,650 m | 3 | The last camp, beside Inca terraces in the cloud forest, an early night before a pre-dawn start. | Wiñay Wayna is Quechua for "forever young" ([Wikipedia](https://en.wikipedia.org/wiki/Wi%C3%B1ay_Wayna)), and the Sun Gate is about 3 km away ([Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu)). |
| THE TOP | Inti Punku (Sun Gate) | 2,745 m | 4 | The stone gateway where the trail tops out and Machu Picchu appears below for the first time. | From about 2,745 m the citadel lies roughly 300 m below you ([Andean Trails](https://www.andeantrails.co.uk/blog/sun-gate-machu-picchu), [Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu)). |

Why these: the pass is the hardest day and the trail's high point, and its name is already a story. Wiñay Wayna is the night that sets up the ending, because the whole camp gets up in the dark to walk to the Sun Gate. The Sun Gate is the emotional top even though it is 1,470 m lower than the pass, so the page should not call it a summit.

Alternative night: **Pacaymayo** (3,600 m, day 2), the camp you reach after coming down from the pass, if the page wants the night to feel colder and higher.

### Permits and rules

- About 500 people a day are allowed on the trail, including guides, cooks and porters, of which about 200 are trekkers. Quotas have applied since 2001 ([Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu)).
- No independent hiking. A guide is mandatory and permits are sold only through government-registered operators ([Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu)). For 2026, the Ministry of Culture said Inca Trail places must be reserved and paid in advance through authorised agencies ([Andina](https://andina.pe/agencia/noticia-iras-a-machu-picchu-2026-ten-cuenta-estas-medidas-para-una-optima-visita-1056293.aspx)).
- Each permit is paired with one passport and is not transferable ([Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu)).
- The trail closes every February for maintenance. Bookings for the whole of 2026 opened between 17 and 25 November 2025 ([Andina](https://andina.pe/agencia/noticia-iras-a-machu-picchu-2026-ten-cuenta-estas-medidas-para-una-optima-visita-1056293.aspx)).
- In 2026, Inca Trail trekkers continue into the citadel on Route 3-B, with a daily quota set by the Cusco culture office (Resolución Ministerial 000306-2025-MC). A new Route 6 is being prepared but has no opening date ([Andina](https://andina.pe/agencia/noticia-iras-a-machu-picchu-2026-ten-cuenta-estas-medidas-para-una-optima-visita-1056293.aspx)).
- Pack animals are barred beyond Wayllabamba, and camping at Quchapata is no longer allowed ([Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu)).

### Season

- **Best:** May to September, the dry season. April and October are quieter shoulder months ([Salkantay Trekking, search result](https://www.salkantaytrekking.com/blog/best-time-to-visit-inca-trail/)).
- **Avoid:** February (closed, [Andina](https://andina.pe/agencia/noticia-iras-a-machu-picchu-2026-ten-cuenta-estas-medidas-para-una-optima-visita-1056293.aspx)) and the wettest months, roughly December to March (operators).
- Permits for June to August go first. Operators report them selling out months ahead.

### Altitude

- The CDC says anyone sleeping at 2,450 m or higher without acclimatising is at risk of acute mountain sickness, and that spending nights at altitude before going higher is protective ([CDC](https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/high-altitude-travel-and-altitude-illness.html)).
- Every camp on the trail is above that line, but the bigger jump is arriving in Cusco, at 3,399 m ([Wikipedia](https://en.wikipedia.org/wiki/Cusco)). Days spent in Cusco or the lower Sacred Valley before the trek do the acclimatising.
- The highest point, 4,215 m, is crossed by day. The highest camp is about 3,600 to 3,800 m depending on the allocation.

### Group size and price

- **Alpaca Expeditions, classic 4D/3N group:** USD 835 per person, USD 800 for students. Includes permits, Machu Picchu entry, guided tour, train back and a personal porter for 7 kg ([Alpaca Expeditions](https://www.alpacaexpeditions.com/classic-inca-trail-trek-4d3n-group-service/)). Private version USD 1,695 ([Alpaca trips page, search result](https://www.alpacaexpeditions.com/trips/)).
- **Intrepid, Peru: Trek the Inca Trail (4 days):** groups of 1 to 16 ([Intrepid](https://www.intrepidtravel.com/uk/peru/peru-trek-inca-trail-4-days-159971)). The page I opened showed no price. Resellers list it from USD 995 to 1,343 ([Travelstride, search result](https://app.travelstride.com/trips/intrepid-travel-peru-trek-the-inca-trail-4-days)).
- **Other listings:** classic 4-day trips from USD 830 and USD 1,095 per person on TourRadar ([TourRadar, search result](https://www.tourradar.com/t/252036)). Infobae puts typical 4-day packages at USD 700 to 800 ([Infobae, search result](https://www.infobae.com/peru/2025/11/18/viajaras-a-cusco-en-2026-conoce-como-reservar-y-comprar-tus-boletos-online-a-machu-picchu-precios-y-mas-detalles/)).
- **Group size:** Intrepid caps at 16. Tierras Vivas runs from 2 people and sends 2 guides for groups of 9 to 16 ([Tierras Vivas, search result](https://www.tierrasvivas.com/en/classic-inca-trail-to-machu-picchu)).
- For the booking panel: USD 835 to 1,695 per person, groups of 2 to 16.

### What you need to know

1. By law a porter may carry at most 20 kg if male and 15 kg if female, under Ley 31614, the 2022 New Porter Worker Law ([El Peruano](https://www.elperuano.pe/noticia/196818-nueva-ley-del-porteador-garantiza-sus-derechos)). Loads are weighed at checkpoints on the trail ([Responsible Travel](https://www.responsibletravel.com/holidays/inca-trail-trek/travel-guide/porters-rights)).
2. Metal-tipped trekking poles are not allowed ([Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu)).
3. Heavy rain on 17 and 18 August 2026 damaged the trail network and access was suspended. Routes 1, 2 and 3 reopened on 26 August 2026 ([Panamericana](https://panamericana.pe/nacionales/473183-cusco-26-agosto-reanuda-ingreso-rutas-1-2-3-red-caminos-inca/amp)).
4. Machu Picchu, at 2,430 m, sits almost 1,000 m lower than Cusco at 3,399 m ([Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu), [Wikipedia](https://en.wikipedia.org/wiki/Cusco)). The hardest altitude of the trip is the pass, not the finish.

### Kit

| Item | Why |
|---|---|
| The passport on your permit | Permits are tied to one passport ([Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu)). |
| Rubber-tipped trekking poles | Metal tips are not allowed ([Wikipedia](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu)). |
| Headlamp | Day 4 starts in the dark to reach the Sun Gate early. |
| Rain jacket | Day 3 drops into cloud forest, and rain is possible in any month. |
| Warm sleeping bag | Camps sit between about 2,650 and 3,600 m and nights are cold. |
| Broken-in boots | Much of the trail is original Inca stone steps. |
| A soft bag within the 7 kg porter allowance | Alpaca's personal porter carries 7 kg per trekker, sleeping bag and mat included ([Alpaca Expeditions](https://www.alpacaexpeditions.com/classic-inca-trail-trek-4d3n-group-service/)). |

### Conflicts and ranges

- **Distance:** 42 km (Wikipedia), 45 km (sum of Intrepid's and of Alpaca's daily figures), 43 km (another Alpaca page), 50 km (one blog), 26 km (one Alpaca article, clearly wrong). The OSM trace measures 35.6 km.
- **Start elevation:** 2,720 m (Alpaca), 2,688 m (Intrepid), about 2,600 m (Wikipedia). The terrain model reads 2,660 m.
- **Dead Woman's Pass:** 4,215 m (Wikipedia, Alpaca), 4,200 m (Intrepid and several operators), 4,205 m (one blog).
- **Runkurakay pass:** 3,950 m (Wikipedia), 3,980 m (Intrepid), 3,850 m (one blog). Park signs mapped in OpenStreetMap read 3,970 to 3,998 m.
- **Phuyupatamarca:** 3,600 m (Alpaca, and a park sign mapped in OSM at 3,601 m), 3,650 m (Wikipedia's crossing before the site), 3,850 m (Intrepid).
- **Pacaymayo:** about 3,600 m (Wikipedia), 3,650 m (Intrepid).
- **Wiñay Wayna:** 2,650 m (Wikipedia), 2,680 m and 2,600 m (both on Alpaca's page). Explorandes prints 3,650 m, which is a typo.
- **Sun Gate:** 2,745 m (Andean Trails). I could not find a source for the 2,720 m figure some pages use, and the terrain model reads about 2,690 m at the gate.
- **Machu Picchu:** 2,430 m (Wikipedia), 2,400 m (Alpaca).
- **Ascent:** 2,020 m (Intrepid's daily sums), about 2,290 m (measured), 2,500 m (Wikipedia).
- **Porter load:** 20 kg for men and 15 kg for women in Ley 31614 (2022). Alpaca still describes a "government limit" of 25 kg, which matches the older rules, and caps its own porters at 20 kg.
- **Permit split:** 500 a day total is consistent. The 200 trekkers and 300 staff split comes from Wikipedia and one guide, not from a Ministry document I could open.
- **Permit price:** sources disagree (one gives S/444 including Machu Picchu entry, another USD 90, another says the price rose about USD 50 to include the Route 3 ticket). Not confirmed, so it is left out.
- **Sun Gate opening time:** one trekker's 2024 blog says walkers wait at the Wiñay Wayna checkpoint until 5:30 am. Not confirmed by an official source.

### Sources

Opened and read:
- [Wikipedia, Inca Trail to Machu Picchu](https://en.wikipedia.org/wiki/Inca_Trail_to_Machu_Picchu)
- [Wikipedia, Wiñay Wayna](https://en.wikipedia.org/wiki/Wi%C3%B1ay_Wayna)
- [Wikipedia, Cusco](https://en.wikipedia.org/wiki/Cusco)
- [Andina (Peru state news agency), 2026 Machu Picchu and Inca Trail measures](https://andina.pe/agencia/noticia-iras-a-machu-picchu-2026-ten-cuenta-estas-medidas-para-una-optima-visita-1056293.aspx)
- [El Peruano, Nueva Ley del Porteador, Nov 2022](https://www.elperuano.pe/noticia/196818-nueva-ley-del-porteador-garantiza-sus-derechos)
- [Panamericana, Inca trail routes 1 to 3 reopen 26 Aug 2026](https://panamericana.pe/nacionales/473183-cusco-26-agosto-reanuda-ingreso-rutas-1-2-3-red-caminos-inca/amp)
- [Alpaca Expeditions, Classic Inca Trail 4D/3N](https://www.alpacaexpeditions.com/classic-inca-trail-trek-4d3n-group-service/)
- [Intrepid, Peru: Trek the Inca Trail 4 days](https://www.intrepidtravel.com/uk/peru/peru-trek-inca-trail-4-days-159971)
- [Responsible Travel, porters' rights](https://www.responsibletravel.com/holidays/inca-trail-trek/travel-guide/porters-rights)
- [Explorandes, Wiñay Wayna](https://www.explorandes.com/blog/winay-wayna-peru) (only for the typo note)
- [CDC Yellow Book, high-altitude travel](https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/high-altitude-travel-and-altitude-illness.html)
- [OpenStreetMap route relation 15703494](https://www.openstreetmap.org/relation/15703494) and [SRTM via OpenTopoData](https://www.opentopodata.org/datasets/srtm/) for the measured values

Seen only in search results (lower confidence):
- [Andean Trails, Sun Gate](https://www.andeantrails.co.uk/blog/sun-gate-machu-picchu)
- [Alpaca Expeditions, trips and prices](https://www.alpacaexpeditions.com/trips/)
- [Travelstride, Intrepid 4-day prices](https://app.travelstride.com/trips/intrepid-travel-peru-trek-the-inca-trail-4-days)
- [TourRadar, classic 4-day listing](https://www.tourradar.com/t/252036)
- [Infobae, 2026 Machu Picchu tickets and trek prices](https://www.infobae.com/peru/2025/11/18/viajaras-a-cusco-en-2026-conoce-como-reservar-y-comprar-tus-boletos-online-a-machu-picchu-precios-y-mas-detalles/)
- [Tierras Vivas, classic Inca Trail](https://www.tierrasvivas.com/en/classic-inca-trail-to-machu-picchu)
- [Salkantay Trekking, best time for the Inca Trail](https://www.salkantaytrekking.com/blog/best-time-to-visit-inca-trail/)
- [Vakantio trekker blog, Wiñay Wayna checkpoint](https://vakantio.de/en/blog/kristins-abenteuer/machu-picchu-10)

---

## 03 W Trek, Torres del Paine, Chile

### The numbers

- **Distance:** 71 km for the five-day west-to-east route below, including the side trips to Mirador Británico and Mirador Base Torres **(measured on the OSM trace)**. Published totals run from 62 km to 80 km (see conflicts). [Wildland Trekking](https://wildlandtrekking.com/patagonia-treks/torres-del-paine-w.html) gives 72 km.
- **Days:** 4 to 5. Las Torres sells a 4-day, 3-night self-guided W ([Las Torres](https://lastorres.com/en/circuitos-de-trekking/w-circuit/)). Most guides describe 5 days ([Worldly Adventurer](https://worldlyadventurer.com/torres-del-paine-w-hike-without-tour/)).
- **Direction:** both work. The trail is signed as bidirectional, from Torres to Grey or the other way ([CONAF map](https://parquetorresdelpaine.cl/wp-content/uploads/2026/01/Mapa-Rutero-Ingles.pdf)). West to east saves Base Torres for the last day, which suits the page's "top" beat.
- **Start (west to east):** Paine Grande, reached by catamaran from Pudeto, about 40 m **(measured)**.
- **End:** the Welcome Center at Las Torres, about 140 m **(measured)**.
- **High point:** Mirador Base Torres, 870 m ([The World Travel Guy](https://theworldtravelguy.com/las-torres-day-hike/)), 850 m according to [Nomades](https://www.nomades.com/pt/blog/trekking-base-torres-todo-debes-saber/). The terrain model reads 867 m.
- **Ascent and descent:** about 2,350 m up and 2,250 m down **(measured)**. Wildland's daily gains for its version add up to about 2,300 m ([Wildland Trekking](https://wildlandtrekking.com/patagonia-treks/torres-del-paine-w.html)).

### Day by day (west to east, 5 days)

Book a night in Puerto Natales before day 1. Las Torres calls this essential ([Las Torres](https://lastorres.com/en/circuitos-de-trekking/w-circuit/)).

| Day | From | To | Distance | Hours | Overnight elev | Night type |
|---|---|---|---|---|---|---|
| 1 | Pudeto, catamaran to Paine Grande | Refugio Grey | 11 km ([Worldly Adventurer](https://worldlyadventurer.com/torres-del-paine-w-hike-without-tour/)), 10.5 km measured | 3 to 4 h | about 80 m (measured) | refugio or campsite (Vértice) |
| 2 | Refugio Grey | Paine Grande | 11 km ([Patagonline](https://www.patagonline.com/en/w-trek-patagonia-map-tips-routes-distances/)), plus about 6 km if you visit the suspension bridges | 3 to 4 h | about 40 m (measured) | refugio or campsite (Vértice) |
| 3 | Paine Grande, Italiano, Mirador Francés, Mirador Británico and back to Italiano | Francés camp | 20.5 km (11.5 km plus 9 km for Británico, [Worldly Adventurer](https://worldlyadventurer.com/torres-del-paine-w-hike-without-tour/)), 20.2 km measured | about 7.5 h | about 170 m (measured) | domes or equipped tents (Las Torres) |
| 4 | Francés, Los Cuernos, Paso de los Vientos | Refugio Chileno | 17 km ([Worldly Adventurer](https://worldlyadventurer.com/torres-del-paine-w-hike-without-tour/)), 15.6 km measured | 4 to 5 h | 410 m (OSM, terrain model 415 m) | refugio or campsite (Las Torres) |
| 5 | Chileno, Mirador Base Torres, back to Chileno | Welcome Center | 13 km ([Worldly Adventurer](https://worldlyadventurer.com/torres-del-paine-w-hike-without-tour/)), 14.4 km measured | about 6 h | none | none |

East to west, Worldly Adventurer's version: day 1 Laguna Amarga to Torres Central or Norte including the climb to the towers (18.4 km), day 2 to Francés (14.5 km), day 3 to Paine Grande via Británico (11.5 km plus 9 km), day 4 to Grey (11 km), day 5 back to Paine Grande and the catamaran (11 km) ([Worldly Adventurer](https://worldlyadventurer.com/torres-del-paine-w-hike-without-tour/)).

### Waypoints for the elevation profile

Coordinates from OpenStreetMap. Distances measured along the OSM trace of the W, in the walking order above. Few published elevations exist for points on the W, so most come from the terrain model.

| # | Point | Lat | Lon | Elev (m) | Elevation source | km |
|---|---|---|---|---|---|---|
| 1 | Paine Grande | -51.073 | -73.094 | 40 | measured (SRTM) | 0.0 |
| 2 | Refugio Grey | -51.008 | -73.176 | 80 | measured (SRTM) | 10.5 |
| 3 | Paine Grande (return) | -51.073 | -73.094 | 40 | measured (SRTM) | 21.0 |
| 4 | Italiano ranger station | -51.027 | -73.040 | 160 | measured (SRTM) | 28.4 |
| 5 | Mirador Francés | -51.020 | -73.045 | 230 | measured (SRTM) | 29.3 |
| 6 | Mirador Británico | -50.983 | -73.054 | 760 | measured (SRTM) | 34.1 |
| 7 | Italiano (return) | -51.027 | -73.040 | 160 | measured (SRTM) | 39.9 |
| 8 | Francés camp | -51.026 | -73.027 | 170 | measured (SRTM) | 41.1 |
| 9 | Refugio Los Cuernos | -51.024 | -72.986 | 80 | measured (SRTM) | 44.6 |
| 10 | Paso de los Vientos | -50.963 | -72.903 | 460 | measured (SRTM) | 55.7 |
| 11 | Refugio Chileno | -50.957 | -72.911 | 410 | OpenStreetMap tag, SRTM 415 | 56.7 |
| 12 | Mirador Base Torres | -50.943 | -72.950 | 870 | [The World Travel Guy](https://theworldtravelguy.com/las-torres-day-hike/) | 61.1 |
| 13 | Refugio Chileno (return) | -50.957 | -72.911 | 410 | as above | 65.5 |
| 14 | Welcome Center, Las Torres | -50.965 | -72.864 | 140 | measured (SRTM) | 71.1 |

### The three beats

| Beat | Name | Elev | Day | What happens | Fact to print |
|---|---|---|---|---|---|
| THE CLIMB | Valle del Francés to Mirador Británico | about 760 m | 3 | Up the French Valley past hanging glaciers into a ring of granite peaks. | Rangers stop people starting up to Mirador Británico after 14:00 ([CONAF bulletin 2025-26](https://parquetorresdelpaine.cl/wp-content/uploads/2025/10/Boletin-informativo-pntp-1.pdf)). |
| THE NIGHT | Refugio Chileno | 410 m | 4 | A wooden refugio in a beech-forest valley, the last bed below the towers. | CONAF's Torres campsite, closer to the towers, was closed for 2025-26, so Chileno is the nearest place to sleep ([CONAF bulletin](https://parquetorresdelpaine.cl/wp-content/uploads/2025/10/Boletin-informativo-pntp-1.pdf)). |
| THE TOP | Mirador Base Torres | 870 m | 5 | A last steep scramble up a boulder moraine ends at a glacial lake under the three granite towers. | The towers rise to about 2,500 m ([Wikipedia](https://en.wikipedia.org/wiki/Torres_del_Paine_National_Park)), more than 1,600 m above the lake viewpoint. |

Why these: Valle del Francés is the biggest climb of the W and the most dramatic scenery. Chileno is the night closest to the towers. Base Torres is the postcard and the highest point, and finishing there gives the page a true summit ending.

Watch the copy here: "sunrise at the towers" is a classic line, but the park map says walking the trails without daylight is forbidden ([CONAF map](https://parquetorresdelpaine.cl/wp-content/uploads/2026/01/Mapa-Rutero-Ingles.pdf)), so describe a morning climb, not a dark start.

### Permits and rules

- **Park entry:** CLP 48,500 (about USD 50) for foreign adults staying more than 2 days, CLP 32,400 (about USD 33) for a day pass, free for children up to 12 ([parquetorresdelpaine.cl, 2026 fees](https://parquetorresdelpaine.cl/tarifas-y-horarios-2026/)). Buy it at pasesparques.cl ([CONAF bulletin](https://parquetorresdelpaine.cl/wp-content/uploads/2025/10/Boletin-informativo-pntp-1.pdf)).
- **Every night booked in advance:** to walk the W you must hold reservations at the refugios or campsites, and without them you cannot enter the mountain area ([CONAF bulletin](https://parquetorresdelpaine.cl/wp-content/uploads/2025/10/Boletin-informativo-pntp-1.pdf)).
- **Two booking companies:** Chileno, Cuernos, Francés and Central are booked through Las Torres, Paine Grande and Grey through Vértice ([CONAF bulletin](https://parquetorresdelpaine.cl/wp-content/uploads/2025/10/Boletin-informativo-pntp-1.pdf), [Worldly Adventurer](https://worldlyadventurer.com/torres-del-paine-w-hike-without-tour/)).
- **Cut-off times (2025-26):** last start for Mirador Británico 14:00, Mirador Francés 14:00, Paine Grande to Grey 15:30, Paine Grande to Cuernos and Francés 16:00. For Base Torres from the Laguna Amarga gate, latest start is 10:00 in December to February and 09:30 in October, November, March and April ([CONAF bulletin](https://parquetorresdelpaine.cl/wp-content/uploads/2025/10/Boletin-informativo-pntp-1.pdf)). Rangers close trails in extreme wind or flooding (same source).
- **Camping and cooking:** only in authorised areas, and only with stoves that do not burn plant material, in designated cooking areas ([CONAF map](https://parquetorresdelpaine.cl/wp-content/uploads/2026/01/Mapa-Rutero-Ingles.pdf)).
- **Winter:** the W required an accredited guide until 30 September 2025 ([CONAF bulletin](https://parquetorresdelpaine.cl/wp-content/uploads/2025/10/Boletin-informativo-pntp-1.pdf)). In May 2026 CONAF announced the W would close in June and July 2026, leaving only the Base Torres trail open with accredited guides ([The Clinic, search result](https://www.theclinic.cl/2026/05/25/conaf-anuncia-cierre-temporal-del-circuito-w-en-torres-del-paine-y-las-navegaciones-en-lagos-pehoe-y-grey-por-temporada-de-invierno/amp/)).

### Season

- **Best:** December to March, the summer, for the longest and warmest days ([Las Torres](https://lastorres.com/en/torres-del-paine/weather/)). Services opened between 1 September and 1 November 2025 and close between 30 March and 27 April 2026 ([CONAF bulletin](https://parquetorresdelpaine.cl/wp-content/uploads/2025/10/Boletin-informativo-pntp-1.pdf)).
- **Avoid:** May to August. Refugios close and in 2026 the W itself was closed in June and July (see above). Note that the windiest months are November to January, inside peak season ([Wikipedia](https://en.wikipedia.org/wiki/Torres_del_Paine_National_Park)).

### Altitude

Not a factor. The highest point is about 870 m. The hazards are wind, cold rain and river crossings.

### Group size and price

- **Las Torres, W Circuit 4D/3N self-guided:** from USD 1,450 per person in a fully equipped camp (2 sharing a tent), USD 2,610 single, USD 1,750 in a Mountain Stay dorm. Includes all meals, transport from Puerto Natales, the catamaran and park entry. The booking form takes 1 to 10 travellers ([Las Torres](https://lastorres.com/en/circuitos-de-trekking/w-circuit/)).
- **Wildland Trekking, guided W:** USD 4,975 per person, 7 days from Puerto Natales, groups of 4 to 12 ([Wildland Trekking](https://wildlandtrekking.com/patagonia-treks/torres-del-paine-w.html)).
- **G Adventures, Torres del Paine W Trek with Santiago:** 8 days, maximum 12 (one FAQ on the same page says 16), price not shown on the page I opened ([G Adventures](https://www.gadventures.com/trips/torres-del-paine-w-trek-with-santiago/SCSW/itinerary)).
- For the booking panel: USD 1,450 to 4,975 per person, guided groups of 4 to 12.

### What you need to know

1. Wind runs from a 20 km/h breeze to gusts of up to 110 km/h, and summer is the windiest season ([Las Torres](https://lastorres.com/en/torres-del-paine/weather/)).
2. Walking after dark is forbidden. The park map warns of getting lost, falling or meeting a puma ([CONAF map](https://parquetorresdelpaine.cl/wp-content/uploads/2026/01/Mapa-Rutero-Ingles.pdf)).
3. Using any heat source outside the designated areas breaks Law 20,653, with fines of up to CLP 2,000,000 or up to three years in prison ([CONAF map](https://parquetorresdelpaine.cl/wp-content/uploads/2026/01/Mapa-Rutero-Ingles.pdf)). A fire in late December 2011 burned about 17,600 ha ([Wikipedia](https://en.wikipedia.org/wiki/Torres_del_Paine_National_Park)).
4. Swimming is banned in every lake, lagoon and river in the park, and drones are banned too ([CONAF map](https://parquetorresdelpaine.cl/wp-content/uploads/2026/01/Mapa-Rutero-Ingles.pdf)).
5. CONAF's own free campsites, Torres, Italiano and Paso, were closed for 2025-26, so every night on the W is at a paid concession site ([CONAF bulletin](https://parquetorresdelpaine.cl/wp-content/uploads/2025/10/Boletin-informativo-pntp-1.pdf)).

### Kit

| Item | Why |
|---|---|
| Hardshell jacket and overtrousers | Gusts up to 110 km/h and rain that arrives sideways ([Las Torres](https://lastorres.com/en/torres-del-paine/weather/)). |
| Trekking poles | CONAF suggests them for the climb to Base Torres ([CONAF bulletin](https://parquetorresdelpaine.cl/wp-content/uploads/2025/10/Boletin-informativo-pntp-1.pdf)). |
| Warm hat, gloves and a fleece | Temperatures drop fast when the wind picks up, even in summer. |
| Printed bookings and park ticket | You may have to show every night's reservation at park entry ([Worldly Adventurer](https://worldlyadventurer.com/torres-del-paine-w-hike-without-tour/)). |
| Some Chilean pesos in cash | The connection bus from Laguna Amarga to the Welcome Center is CLP 4,500 cash ([CONAF bulletin](https://parquetorresdelpaine.cl/wp-content/uploads/2025/10/Boletin-informativo-pntp-1.pdf)). |
| Pack liner or dry bags | Rain and spray on the lakeside stretches. |
| Sunglasses and sunscreen | Long summer days and glare off glaciers and lakes. |

### Conflicts and ranges

- **Distance:** 62 km ([G Adventures](https://www.gadventures.com/trips/torres-del-paine-w-trek-with-santiago/SCSW/itinerary)), 71 km (Nomades and measured), 72 km ([Wildland](https://wildlandtrekking.com/patagonia-treks/torres-del-paine-w.html)), 76 km and 80 km (both on [Patagonline](https://www.patagonline.com/en/w-trek-patagonia-map-tips-routes-distances/)), 80 km ([Worldly Adventurer](https://worldlyadventurer.com/torres-del-paine-w-hike-without-tour/)), 50 miles ([Wikipedia](https://en.wikipedia.org/wiki/Torres_del_Paine_National_Park), which looks too high). The spread comes from which side trips are counted.
- **Base Torres elevation:** 870 m (The World Travel Guy), 850 m (Nomades), 867 m measured. Climb to the towers: 900 m or about 800 m of gain (both on Worldly Adventurer), 1,015 m round trip from the Welcome Center (The World Travel Guy).
- **Mirador Británico:** no published elevation found. The terrain model reads 764 m at the OSM viewpoint. Cascada lists a maximum of 686 m for its French Valley day (search result), so it may stop lower.
- **Base Torres opening hours:** the 2025-26 bulletin gives latest starts of 09:30 or 10:00 from the Laguna Amarga gate. The park's 2026 fee page says entry until 09:00 and exit by 15:00. Check the current season's bulletin.
- **Entry fees:** the official 2026 page lists CLP 32,400 and 48,500. Worldly Adventurer quotes older figures of CLP 34,000 and 51,000. One site reports a new per-section ticket system from 1 May 2026 ([Patagonia Tourism, search result](https://www.patagoniatourism.org/torres-del-paine-tickets/)), which I could not confirm on an official page.
- **Days:** 4 (Las Torres package) or 5 (most guides).

### Sources

Opened and read:
- [CONAF, Torres del Paine information bulletin, 2025-26 season (PDF)](https://parquetorresdelpaine.cl/wp-content/uploads/2025/10/Boletin-informativo-pntp-1.pdf)
- [Parque Nacional Torres del Paine, fees and hours 2026](https://parquetorresdelpaine.cl/tarifas-y-horarios-2026/)
- [CONAF, official route map in English (PDF)](https://parquetorresdelpaine.cl/wp-content/uploads/2026/01/Mapa-Rutero-Ingles.pdf) and [map page with trail closing times](https://parquetorresdelpaine.cl/mapa-oficial/)
- [Las Torres, W Circuit 4D/3N](https://lastorres.com/en/circuitos-de-trekking/w-circuit/)
- [Las Torres, weather](https://lastorres.com/en/torres-del-paine/weather/)
- [Worldly Adventurer, W trek without a tour](https://worldlyadventurer.com/torres-del-paine-w-hike-without-tour/)
- [Wildland Trekking, Torres del Paine W](https://wildlandtrekking.com/patagonia-treks/torres-del-paine-w.html)
- [G Adventures, W Trek with Santiago](https://www.gadventures.com/trips/torres-del-paine-w-trek-with-santiago/SCSW/itinerary)
- [The World Travel Guy, Mirador Las Torres day hike](https://theworldtravelguy.com/las-torres-day-hike/)
- [Nomades, Base Torres trek guide](https://www.nomades.com/pt/blog/trekking-base-torres-todo-debes-saber/)
- [Patagonline, W trek distances](https://www.patagonline.com/en/w-trek-patagonia-map-tips-routes-distances/)
- [Wikipedia, Torres del Paine National Park](https://en.wikipedia.org/wiki/Torres_del_Paine_National_Park)
- [OpenStreetMap route relation 2203617](https://www.openstreetmap.org/relation/2203617) and [SRTM via OpenTopoData](https://www.opentopodata.org/datasets/srtm/) for the measured values

Seen only in search results (lower confidence):
- [The Clinic, CONAF closes the W in June and July 2026](https://www.theclinic.cl/2026/05/25/conaf-anuncia-cierre-temporal-del-circuito-w-en-torres-del-paine-y-las-navegaciones-en-lagos-pehoe-y-grey-por-temporada-de-invierno/amp/)
- [Patagonia Tourism, ticket system](https://www.patagoniatourism.org/torres-del-paine-tickets/)
- [Nomades, Circuito W guide (71 km)](https://www.nomades.com/blog/circuito-w-de-torres-del-paine-todo-lo-que-necesitas-saber/)
- [Cascada, W trek](https://cascada.travel/en/tour/torres-del-paine-w-trek-winter)

---

## 04 Kilimanjaro via the Machame Route, Tanzania (7 days)

### The numbers

- **Distance:** 62 km ([Ultimate Kilimanjaro](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf), [Duma Explorer](https://www.dumaexplorer.com/blog/kilimanjaro-machame-route)). The OSM trace measures 59.9 km.
- **Days:** 7, with 6 nights in tents.
- **Start:** Machame Gate, 1,800 m ([Duma Explorer](https://www.dumaexplorer.com/blog/kilimanjaro-machame-route)). The terrain model reads 1,822 m.
- **End:** Mweka Gate, 1,640 m ([Ultimate Kilimanjaro](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf)). The terrain model reads 1,632 m.
- **High point:** Uhuru Peak, 5,895 m, the figure used by the Tanzania National Parks Authority and UNESCO, from a 1952 survey ([Wikipedia](https://en.wikipedia.org/wiki/Mount_Kilimanjaro)).
- **Ascent and descent:** about 5,000 m up and 5,200 m down along the trail **(measured)**. Counting only camp-to-camp differences from Ultimate Kilimanjaro's table (with the gate at 1,800 m) gives at least 4,750 m up and 4,910 m down.

### Day by day

Distances, hours and elevations from [Ultimate Kilimanjaro](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf). [Duma Explorer](https://www.dumaexplorer.com/blog/kilimanjaro-machame-route) figures in brackets where they differ.

| Day | From | To | Distance | Hours | Overnight elev | Night type |
|---|---|---|---|---|---|---|
| 1 | Machame Gate, 1,800 m | Machame Camp | 11 km | 5 to 7 h | 2,850 m (3,000 m) | tent |
| 2 | Machame Camp | Shira 2 Camp | 5 km | 4 to 6 h | 3,810 m (3,840 m) | tent |
| 3 | Shira 2, up to Lava Tower (4,630 m) | Barranco Camp | 7 km plus 3 km | 4 to 5 h plus 2 to 3 h | 3,976 m (3,950 m) | tent |
| 4 | Barranco Camp, up the Barranco Wall | Karanga Camp | 5 km | 4 to 5 h | 3,995 m (4,035 m) | tent |
| 5 | Karanga Camp | Barafu Camp | 4 km | 4 to 5 h | 4,673 m (4,600 m) | tent |
| 6 | Barafu, Stella Point (5,756 m), Uhuru Peak (5,895 m) | Mweka Camp | 5 km up plus 12 km down | 7 to 8 h plus 4 to 6 h | 3,068 m (3,100 m) | tent |
| 7 | Mweka Camp | Mweka Gate, 1,640 m | 10 km | 3 to 4 h | none | none |

### Waypoints for the elevation profile

Coordinates from park signposts as mapped in OpenStreetMap. Cumulative distances from Ultimate Kilimanjaro's daily figures. Stella Point and the second Barafu are placed using the OSM trace **(measured)**.

| # | Point | Lat | Lon | Elev (m) | Elevation source | km |
|---|---|---|---|---|---|---|
| 1 | Machame Gate | -3.174 | 37.239 | 1,800 | [Duma](https://www.dumaexplorer.com/blog/kilimanjaro-machame-route) | 0 |
| 2 | Machame Camp | -3.096 | 37.266 | 2,850 | [UK](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf) | 11 |
| 3 | Shira 2 Camp | -3.055 | 37.276 | 3,810 | [UK](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf) | 16 |
| 4 | Lava Tower | -3.068 | 37.327 | 4,630 | [UK](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf) | 23 |
| 5 | Barranco Camp | -3.095 | 37.330 | 3,976 | [UK](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf) | 26 |
| 6 | Karanga Camp | -3.113 | 37.355 | 3,995 | [UK](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf) | 31 |
| 7 | Barafu Camp | -3.100 | 37.379 | 4,673 | [UK](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf) | 35 |
| 8 | Stella Point | -3.079 | 37.363 | 5,756 | [Duma](https://www.dumaexplorer.com/blog/kilimanjaro-machame-route) | 39 |
| 9 | Uhuru Peak | -3.076 | 37.354 | 5,895 | [Wikipedia](https://en.wikipedia.org/wiki/Mount_Kilimanjaro) | 40 |
| 10 | Barafu Camp (descent) | -3.100 | 37.379 | 4,673 | [UK](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf) | 44.7 |
| 11 | Mweka Camp | -3.157 | 37.367 | 3,068 | [UK](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf) | 52 |
| 12 | Mweka Gate | -3.220 | 37.342 | 1,640 | [UK](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf) | 62 |

UK = Ultimate Kilimanjaro.

### The three beats

| Beat | Name | Elev | Day | What happens | Fact to print |
|---|---|---|---|---|---|
| THE CLIMB | Barranco Wall | starts at 3,976 m | 4 | Straight out of camp onto a steep rock wall, hands on the rock, porters with loads passing by. | A non-technical scramble of "nearly 900 ft" ([Ultimate Kilimanjaro](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf)), 257 m according to [Duma Explorer](https://www.dumaexplorer.com/blog/kilimanjaro-machame-route). |
| THE NIGHT | Barafu Camp | 4,673 m | 5 | A rocky high camp on a ridge. Early dinner, a few hours of sleep, then boots on in the dark. | The summit push starts around midnight ([Ultimate Kilimanjaro](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf)). |
| THE TOP | Uhuru Peak | 5,895 m | 6 | The crater-rim summit, after 7 to 8 hours of climbing through the night, with sunrise near Stella Point. | 5,895 m, the highest point in Africa and the highest free-standing mountain in the world ([Wikipedia](https://en.wikipedia.org/wiki/Mount_Kilimanjaro)). |

Why these: the Barranco Wall is the most visual climb of the route and the one people remember. Barafu is where the night is short and the nerves are real. Uhuru is the obvious top.

If the profile needs the climb marker at the top of the wall, it sits at roughly 4,200 to 4,250 m (3,976 m plus the 257 to 270 m scramble). That is arithmetic, not a published figure. Alternative climb: **Lava Tower** (4,630 m, day 3), the "climb high, sleep low" day, which has clean published numbers.

### Permits and rules

- **Guide required:** independent ascents are not allowed. You must climb with a licensed operator ([Altezza Travel](https://altezzatravel.com/articles/kilimanjaro-park-fees)).
- **Park fees for foreign adults (16+):** USD 70 per day conservation fee, USD 50 per night camping, USD 20 rescue fee once per climb, plus 18% VAT on each. Altezza lists these as valid 1 January 2025 to 30 June 2026 ([Altezza Travel](https://altezzatravel.com/articles/kilimanjaro-park-fees)). For a 7-day, 6-night Machame climb that is roughly USD 870 to 960 per person including VAT, depending on whether 6 or 7 conservation days are charged (my arithmetic from Altezza's table).
- **Children:** under-10s are kept to lower altitudes. The 2003 Mountains National Parks Regulations set the limit at 3,700 m ([TanzLII, search result](https://tanzlii.org/en/akn/tz/act/gn/2003/191/eng@2003-07-25)). Ultimate Kilimanjaro says 3,100 m and gives 10 as the official minimum age to climb ([Ultimate Kilimanjaro](https://www.ultimatekilimanjaro.com/can-children-climb-kilimanjaro-minimum-age-requirements/)).
- **Porter loads** are weighed at the park gate on day 1 ([Kandoo Adventures](https://www.kandooadventures.com/blog/tipping-your-porters-on-kilimanjaro-393.html)).

### Season

- **Best:** January to early March, and June to October ([Duma Explorer](https://www.dumaexplorer.com/blog/kilimanjaro-machame-route)).
- **Avoid:** the months outside those windows, roughly mid-March to May and November, which are the rainy periods. This is inferred from Duma's best months, not quoted.

### Altitude

- The CDC's guidance: risk begins at sleeping altitudes of 2,450 m and above, avoid going straight to a sleeping altitude of 2,750 m or more in one day, and once above 3,000 m gain no more than 500 m of sleeping altitude per night, with an extra night for every 1,000 m ([CDC](https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/high-altitude-travel-and-altitude-illness.html)).
- Machame cannot keep to that. Day 1 sleeps at about 2,850 m, day 2 gains about 960 m of sleeping altitude, and summit day climbs about 1,220 m above Barafu. The route answers with "climb high, sleep low": day 3 goes up to Lava Tower at 4,630 m and comes back down to sleep at Barranco, at about the same height as the night before ([Ultimate Kilimanjaro](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf)). The 7-day version adds the night at Karanga for more acclimatisation (same source).
- Summit success: Wikipedia gives 70 to 80% across all routes, without a citation ([Wikipedia](https://en.wikipedia.org/wiki/Mount_Kilimanjaro)). Duma Explorer gives about 85% for the 7-day Machame ([Duma Explorer](https://www.dumaexplorer.com/blog/kilimanjaro-machame-route)).

### Group size and price

- **Ultimate Kilimanjaro, 7-day Machame group climbs in 2026:** USD 2,799 and USD 2,939 per person, including park fees, rescue fees and VAT. Groups are capped at 14 ([Ultimate Kilimanjaro](https://ultimatekilimanjaro.com/dates-prices/)).
- **Altezza Travel, Classic 7-day Machame 2026:** USD 4,266 for a solo climber down to USD 2,657 each for 8 or more. Premium version USD 9,236 down to USD 5,282. All park fees included, which Altezza says are about half the price ([Altezza Travel](https://altezzatravel.com/climbing-kilimanjaro/price)).
- **G Adventures, 8-day Machame:** USD 3,164 to 3,375 brochure prices for July to August 2026 departures ([Travelstride, search result](https://www.travelstride.com/trips/gadventures-machame-8-day-route-from-g-adventures)).
- Altezza's own market guide: USD 2,500 to 3,500 for a standard 7-day climb, USD 4,000 to more than 8,000 for premium ([Altezza Travel](https://altezzatravel.com/articles/how-much-does-it-cost-to-climb-kilimanjaro)).
- For the booking panel: USD 2,657 to 4,266 per person, groups of 1 to 14.

### What you need to know

1. Summit night starts around midnight, and the climb to Uhuru takes 7 to 8 hours ([Ultimate Kilimanjaro](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf)).
2. Porters should carry no more than 20 kg of company load, on top of their own kit ([KPAP, Kilimanjaro Porters Assistance Project](https://kiliporters.org/get-involved/tipping-recommendations/)).
3. Park fees make up about half the price of a climb ([Altezza Travel](https://altezzatravel.com/climbing-kilimanjaro/price)).
4. The mountain lost about 85% of its ice between 1912 and 2011 ([Wikipedia](https://en.wikipedia.org/wiki/Mount_Kilimanjaro)).
5. On 29 September 2026 TANAPA closed the Lemosho and Londorosi routes because of a wildfire spreading towards Shira, and sent climbers to Machame, Marangu and Rongai instead ([Bernama](https://bernama.com/en/world/news.php?id=2613203)).

### Kit

| Item | Why |
|---|---|
| Down jacket and insulated mitts | Wind and cold on summit night "can be extreme" ([Ultimate Kilimanjaro](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf)). |
| Headlamp and spare batteries | The summit push is several hours in darkness ([Ultimate Kilimanjaro](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf)). |
| Trekking poles | The descent from the summit is rocky and hard on the knees ([Ultimate Kilimanjaro](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf)). |
| Sleeping bag rated well below freezing | Barafu Camp sits at 4,673 m. |
| Duffel within the porter limit | Your main bag, sleeping bag included, is limited to 15 kg ([Kandoo Adventures](https://www.kandooadventures.com/blog/tipping-your-porters-on-kilimanjaro-393.html)). |
| Water bottles and purification tablets | Water is collected from streams and treated at camp. |
| Cash for crew tips | Altezza recommends USD 250 to 350 per climber ([Altezza Travel](https://altezzatravel.com/climbing-kilimanjaro/price)). |

### Conflicts and ranges

- **Machame Gate:** 1,800 m (Duma, Life Happens Outdoors, and the park signpost mapped in OSM), 1,640 m in Ultimate Kilimanjaro's table, which is the same figure it gives for Mweka Gate. The terrain model reads 1,822 m, so 1,800 m is used.
- **Camps:** Machame Camp 2,850 m (UK) or 3,000 m (Duma). Shira 2 3,810 m (UK) or 3,840 m (Duma). Barranco 3,976 m (UK) or 3,950 m (Duma). Karanga 3,995 m (UK) or 4,035 m (Duma). Barafu 4,673 m (UK) or 4,600 m (Duma). Mweka Camp 3,068 m (UK) or 3,100 m (Duma). Some itineraries sleep at Shira Cave Camp instead of Shira 2.
- **Total distance:** 62 km (UK, Duma), 60 to 65 km ([Life Happens Outdoors](https://lifehappensoutdoors.com/machame_route_itinerary_kilimanjaro_7_days/)), about 49 km (Wikipedia).
- **Barranco Wall:** "nearly 900 ft", about 274 m (UK), or 257 m (Duma).
- **Stella Point:** 5,756 m (Duma) or 18,900 ft, about 5,761 m (UK).
- **Uhuru Peak:** 5,895 m is the official figure. Later surveys measured 5,892 to 5,902 m ([Wikipedia](https://en.wikipedia.org/wiki/Mount_Kilimanjaro)).
- **Under-10 altitude limit:** 3,700 m (2003 regulations, seen in search) or 3,100 m (Ultimate Kilimanjaro).
- **Porter weights:** 20 kg is the cap on what a porter carries for the company (KPAP). 15 kg is the cap on your own duffel (Kandoo). They are different limits, not a conflict.
- **Park fees after 30 June 2026:** Altezza's rates are published only to that date, so check the current TANAPA tariff.

### Sources

Opened and read:
- [Ultimate Kilimanjaro, 7-day Machame itinerary (PDF)](https://ultimatekilimanjaro.com/wp-content/uploads/2024/10/Ultimate_Kilimanjaro_Machame_Route.pdf)
- [Ultimate Kilimanjaro, dates and prices](https://ultimatekilimanjaro.com/dates-prices/)
- [Ultimate Kilimanjaro, minimum age](https://www.ultimatekilimanjaro.com/can-children-climb-kilimanjaro-minimum-age-requirements/)
- [Duma Explorer, Machame route guide 2026](https://www.dumaexplorer.com/blog/kilimanjaro-machame-route)
- [Life Happens Outdoors, 7-day Machame](https://lifehappensoutdoors.com/machame_route_itinerary_kilimanjaro_7_days/)
- [Altezza Travel, Kilimanjaro park fees](https://altezzatravel.com/articles/kilimanjaro-park-fees)
- [Altezza Travel, prices](https://altezzatravel.com/climbing-kilimanjaro/price)
- [Altezza Travel, cost guide](https://altezzatravel.com/articles/how-much-does-it-cost-to-climb-kilimanjaro)
- [KPAP, porter treatment guidelines](https://kiliporters.org/get-involved/tipping-recommendations/)
- [Kandoo Adventures, porters and tipping](https://www.kandooadventures.com/blog/tipping-your-porters-on-kilimanjaro-393.html)
- [Wikipedia, Mount Kilimanjaro](https://en.wikipedia.org/wiki/Mount_Kilimanjaro)
- [Bernama, Kilimanjaro routes suspended after fire, 29 Sep 2026](https://bernama.com/en/world/news.php?id=2613203)
- [CDC Yellow Book, high-altitude travel](https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/high-altitude-travel-and-altitude-illness.html)
- [OpenStreetMap relations 8737224 (Machame)](https://www.openstreetmap.org/relation/8737224) and [8737225 (Mweka)](https://www.openstreetmap.org/relation/8737225), [SRTM via OpenTopoData](https://www.opentopodata.org/datasets/srtm/) for the measured values

Seen only in search results (lower confidence):
- [TanzLII, Mountains National Parks Regulations 2003](https://tanzlii.org/en/akn/tz/act/gn/2003/191/eng@2003-07-25)
- [Travelstride, G Adventures Machame 8 days](https://www.travelstride.com/trips/gadventures-machame-8-day-route-from-g-adventures)
- [The Citizen, Kilimanjaro fire closes two routes](https://thecitizen.co.tz/tanzania/news/national/kilimanjaro-fire-prompts-temporary-closure-of-two-routes-used-for-climbing-the-mountain-5612568)

---

## 05 Everest Base Camp trek with Kala Patthar, Nepal

### The numbers

- **Distance:** about 120 km Lukla to Lukla ([Stingy Nomads](https://stingynomads.com/everest-base-camp-trek-itinerary-nepal/)). The daily figures below add up to about 118 km, before the acclimatisation-day hikes.
- **Days:** 12 from Lukla to Lukla (11 walking days and a flight day). Operators sell it as 14 to 15 days from Kathmandu ([G Adventures](https://www.gadventures.com/checkout/22946/overview), Intrepid).
- **Start and end:** Lukla, 2,860 m ([Wikipedia](https://en.wikipedia.org/wiki/Lukla)). The airport is at 2,845 m ([Wikipedia](https://en.wikipedia.org/wiki/Tenzing%E2%80%93Hillary_Airport)).
- **High point:** Kala Patthar, 5,644.5 m by a 2008 GPS reading, though 5,545 to 5,550 m is the figure most guides print ([Wikipedia](https://en.wikipedia.org/wiki/Kala_Patthar)). Everest Base Camp itself: 5,364 m ([Wikipedia](https://en.wikipedia.org/wiki/Everest_base_camps)).
- **Ascent and descent:** about 6,000 m up and the same down. Stingy Nomads' daily figures for its 12-day version add up to 6,015 m up and 5,821 m down ([Stingy Nomads](https://stingynomads.com/everest-base-camp-trek-itinerary-nepal/)). A round trip balances, so the gap is rounding in their table.

### Day by day

Distances and times from [Stingy Nomads](https://stingynomads.com/everest-base-camp-trek-itinerary-nepal/) (their times exclude long breaks). Overnight elevations from Wikipedia.

| Day | From | To | Distance | Hours | Overnight elev | Night type |
|---|---|---|---|---|---|---|
| 1 | Lukla, 2,860 m | Phakding | 8 km | not given | 2,610 m ([Wikipedia](https://en.wikipedia.org/wiki/Phakding)) | teahouse |
| 2 | Phakding, via Monjo and the park entrance | Namche Bazaar | 11.5 km | not given | 3,440 m ([Wikipedia](https://en.wikipedia.org/wiki/Namche_Bazaar)) | teahouse |
| 3 | Acclimatisation day: a hike above Namche and back down to sleep | Namche Bazaar | short | | 3,440 m | teahouse |
| 4 | Namche Bazaar | Tengboche | 11 km | 3 h 50 | 3,867 m ([Wikipedia](https://en.wikipedia.org/wiki/Tengboche_Monastery)) | teahouse |
| 5 | Tengboche, via Pangboche | Dingboche | 10.5 km | 3 h 50 | 4,410 m ([Wikipedia](https://en.wikipedia.org/wiki/Dingboche)) | teahouse |
| 6 | Acclimatisation day: a hike above Dingboche and back down | Dingboche | short | | 4,410 m | teahouse |
| 7 | Dingboche | Lobuche | 8.7 km | 3 h 25 | 4,940 m ([Wikipedia](https://en.wikipedia.org/wiki/Lobuche,_Nepal)) | teahouse |
| 8 | Lobuche, Gorak Shep, Everest Base Camp (5,364 m) and back | Gorak Shep | 12 km | 5 h | 5,164 m ([Wikipedia](https://en.wikipedia.org/wiki/Gorak_Shep)) | teahouse |
| 9 | Gorak Shep, Kala Patthar at dawn, back to Gorak Shep | Pheriche | about 16 km (4 km for Kala Patthar plus 12 km) | not given | 4,371 m ([Wikipedia](https://en.wikipedia.org/wiki/Pheriche)) | teahouse |
| 10 | Pheriche, via Pangboche | Namche Bazaar | about 20 km (estimate: 15.5 km from Pangboche plus the stretch from Pheriche) | not given | 3,440 m | teahouse |
| 11 | Namche Bazaar | Lukla | 20 km | 5 h 20 | 2,860 m | teahouse |
| 12 | Flight from Lukla to Manthali (Ramechhap) or Kathmandu | | | | | none |

### Waypoints for the elevation profile

Coordinates from OpenStreetMap and Wikipedia. Cumulative distances from Stingy Nomads' figures, with Pangboche and the Pheriche to Namche stretch estimated from the OSM trace **(measured)**.

| # | Point | Lat | Lon | Elev (m) | Elevation source | km |
|---|---|---|---|---|---|---|
| 1 | Lukla | 27.688 | 86.731 | 2,860 | [Wikipedia](https://en.wikipedia.org/wiki/Lukla) | 0 |
| 2 | Phakding | 27.740 | 86.713 | 2,610 | [Wikipedia](https://en.wikipedia.org/wiki/Phakding) | 8 |
| 3 | Monjo (park entrance) | 27.771 | 86.723 | 2,780 | [Stingy Nomads](https://stingynomads.com/everest-base-camp-trek-itinerary-nepal/) | 13 |
| 4 | Namche Bazaar | 27.805 | 86.713 | 3,440 | [Wikipedia](https://en.wikipedia.org/wiki/Namche_Bazaar) | 19.5 |
| 5 | Tengboche | 27.836 | 86.764 | 3,867 | [Wikipedia](https://en.wikipedia.org/wiki/Tengboche_Monastery) | 30.5 |
| 6 | Pangboche | 27.858 | 86.794 | 3,985 | [Wikipedia](https://en.wikipedia.org/wiki/Pangboche) | 35.1 |
| 7 | Dingboche | 27.893 | 86.831 | 4,410 | [Wikipedia](https://en.wikipedia.org/wiki/Dingboche) | 41 |
| 8 | Lobuche | 27.948 | 86.811 | 4,940 | [Wikipedia](https://en.wikipedia.org/wiki/Lobuche,_Nepal) | 49.7 |
| 9 | Gorak Shep | 27.981 | 86.829 | 5,164 | [Wikipedia](https://en.wikipedia.org/wiki/Gorak_Shep) | 54.7 |
| 10 | Everest Base Camp | 28.003 | 86.856 | 5,364 | [Wikipedia](https://en.wikipedia.org/wiki/Everest_base_camps) | 58.2 |
| 11 | Gorak Shep (return) | 27.981 | 86.829 | 5,164 | as above | 61.7 |
| 12 | Kala Patthar | 27.996 | 86.828 | 5,644 | [Wikipedia](https://en.wikipedia.org/wiki/Kala_Patthar) | 63.7 |
| 13 | Gorak Shep (return) | 27.981 | 86.829 | 5,164 | as above | 65.7 |
| 14 | Pheriche | 27.894 | 86.820 | 4,371 | [Wikipedia](https://en.wikipedia.org/wiki/Pheriche) | 77.7 |
| 15 | Namche Bazaar (return) | 27.805 | 86.713 | 3,440 | as above | 98.2 |
| 16 | Lukla (return) | 27.688 | 86.731 | 2,860 | as above | 118.2 |

### The three beats

| Beat | Name | Elev | Day | What happens | Fact to print |
|---|---|---|---|---|---|
| THE CLIMB | Namche Hill | 3,440 m at the top | 2 | Over the high suspension bridges, then a long switchback climb to the horseshoe-shaped town of Namche Bazaar. | Monjo to Namche climbs about 660 m in 6.5 km ([Stingy Nomads](https://stingynomads.com/everest-base-camp-trek-itinerary-nepal/)). |
| THE NIGHT | Gorak Shep | 5,164 m | 8 | A huddle of teahouses on a frozen, sand-covered lakebed, the highest bed of the trek. | Gorak Shep was the first Everest base camp, used by the 1952 Swiss expedition ([Wikipedia](https://en.wikipedia.org/wiki/Gorak_Shep)). |
| THE TOP | Kala Patthar | 5,644 m | 9 | A dawn climb up a dark ridge above Gorak Shep for the closest view of Everest's summit. | "The most accessible closeup view of Everest" ([Wikipedia](https://en.wikipedia.org/wiki/Kala_Patthar)). |

Why these: Namche Hill is the first big climb and the gateway to the Khumbu. Gorak Shep is the highest night and has a real history. Kala Patthar, not base camp, is the true top of the trek and the place for the Everest photo.

Before printing the Kala Patthar elevation, pick one figure and say which: 5,644 m (GPS) or 5,545 m (most guides). See conflicts.

### Permits and rules

- **Sagarmatha National Park entry:** NPR 3,000 for foreigners, NPR 1,500 for SAARC nationals ([Himalayan Times](https://thehimalayantimes.com/nepal/around-9000-trekkers-visitsagarmatha-region-in-a-month)). Some reports give NPR 3,390 including 13% VAT ([Setopati, search result](https://en.setopati.com/social/120249)). About USD 20 to 22.
- **Khumbu Pasang Lhamu Rural Municipality trek card:** NPR 3,000 for most foreigners, NPR 2,000 for SAARC countries and China, issued at the Lukla tourist information centre with a passport and photo ([municipality website](https://khumbupasanglhamumun.gov.np/)). The fee rose by NPR 1,000 from 16 July 2024 ([Himal Press](https://en.himalpress.com/entry-fee-to-everest-region-hiked-by-rs-1000/)).
- **TIMS card:** the local trek card replaced it in the Khumbu, but the national rule is disputed, so confirm with a registered agency ([Explore Vision Nepal](https://explorevisionnepal.com/everest-base-camp-trek-permit/)).
- **Guides:** Nepal's 2023 rule requires licensed guides for foreign trekkers, but the Khumbu municipality said solo trekkers are still allowed in the Everest region if they carry its trek card ([Kathmandu Post, search result](https://kathmandupost.com/money/2023/04/03/everest-region-nepal-tourism-board-dispute-over-solo-trek-ban-heats-up), [Explore Vision Nepal](https://explorevisionnepal.com/everest-base-camp-trek-permit/)). For a guided premium company this does not matter, but do not print "no guide needed".
- **Flights:** in peak seasons Lukla flights leave from Manthali (Ramechhap) instead of Kathmandu. More Manthali to Lukla flights were added from early October 2026 ([Ekantipur](https://ekantipur.com/bagmati-pradesh/2026/10/04/en/manthali-lukla-flights-added-kathmandu-ramechhap-flights-prepared-08-24.html)).

### Season

- **Best:** March to May, and late September to November ([Stingy Nomads, search result](https://stingynomads.com/best-time-for-everest-base-camp-trek)). The Himalayan Rescue Association clinic at Pheriche only opens in the trekking seasons, March to May and October to December ([Wikipedia](https://en.wikipedia.org/wiki/Pheriche)).
- **Avoid:** June to August, the monsoon, with rain, leeches, slippery trails and disrupted flights. December to February is quieter but very cold (operators, via search).

### Altitude

- The CDC's rule of thumb: risk starts at sleeping altitudes of 2,450 m, and above 3,000 m sleeping altitude should rise no more than 500 m a night, with an extra night for every 1,000 m. On certain Nepal routes, "particularly the Everest base camp route", altitude illness "can approach 30%" at higher elevations even on standard schedules ([CDC](https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/high-altitude-travel-and-altitude-illness.html)).
- The flight lands at 2,845 m, so day 1 walks down to Phakding at 2,610 m to sleep lower.
- The two rest days follow the CDC logic: one at Namche (3,440 m) and one at Dingboche (4,410 m), about 1,000 m apart. On rest days you hike higher and come back down to sleep.
- The highest sleeping altitude is Gorak Shep at 5,164 m.

### Group size and price

- **Intrepid, Everest Base Camp Trek, 15 days from Kathmandu:** from USD 1,408 to 1,656 for August to October 2026 departures ([Affordable Tours, search result](https://www.affordabletours.com/t/111434-everest-base-camp-trek)), maximum group 16 ([Travelstride, search result](https://www.travelstride.com/trips/intrepid-everest-base-camp-trek-15-days)).
- **G Adventures, Everest Base Camp Trek, 14 days:** CAD 1,490 to 2,249 for October to December 2026 departures, about USD 1,048 to 1,581 ([G Adventures](https://www.gadventures.com/checkout/22946/overview)).
- **Exodus, 16 days:** USD 2,695 for a February 2025 departure, an older price ([TourRadar, search result](https://tourradar.com/t/33554)).
- Kathmandu to Lukla flights alone cost around USD 254 one way ([Nepal Hiking Team, search result](https://www.nepalhikingteam.com/everest-base-camp-trek-cost)).
- For the booking panel: USD 1,048 to 2,695 per person, groups of 1 to 16.

### What you need to know

1. Lukla's runway is 527 m long with an 11.7% slope ([Wikipedia](https://en.wikipedia.org/wiki/Tenzing%E2%80%93Hillary_Airport)).
2. In good weather up to 60 flights a day run between Manthali and Lukla, but cloud grounds them for days at a time. In October 2024 flights stopped for three days from 9 October and again from 14 October ([Rising Nepal](https://risingnepaldaily.com/news/50477)).
3. Altitude illness can approach 30% at the higher elevations of this route, even on standard schedules ([CDC](https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/high-altitude-travel-and-altitude-illness.html)).
4. Nuptse blocks Everest's high summit from much of the area, which is why the classic summit view is from Kala Patthar ([Wikipedia](https://en.wikipedia.org/wiki/Kala_Patthar)).
5. Tengboche monastery has been destroyed twice, by an earthquake in 1934 and by a fire in 1989 ([Wikipedia](https://en.wikipedia.org/wiki/Tengboche_Monastery)).

### Kit

| Item | Why |
|---|---|
| Down jacket | Teahouse rooms are unheated, and Gorak Shep sits at 5,164 m. |
| Sleeping bag rated well below freezing | Teahouse bedding is thin, and nights above 4,000 m are cold. |
| Refillable bottle and purification | The Khumbu announced a single-use plastic ban from January 2020 ([Himalayan Times, search result](https://thehimalayantimes.com/nepal/everest-region-bans-single-use-plastic-to-reduce-waste/)). |
| Cash in Nepali rupees | The trek card is issued over the counter in Lukla ([municipality website](https://khumbupasanglhamumun.gov.np/)). |
| Insurance that covers helicopter rescue above 5,000 m | The route tops out at about 5,600 m. |
| Trekking poles | Long stone-stair descents on the way back to Lukla. |
| Buff or face cover | Dry, dusty, cold air on the trail. |
| Headlamp | The Kala Patthar climb starts before dawn. |

### Conflicts and ranges

- **Distance:** 120 km (Stingy Nomads), about 130 km ([Ace the Himalaya, search result](https://www.acethehimalaya.com/everest-base-camp-trek-distance/)). The OSM trace measures 53.7 km one way from Lukla to base camp, shorter than every published figure.
- **Lukla:** 2,860 m (Wikipedia, town), 2,845 m (Wikipedia, airport), 2,840 m and 2,800 m (operators).
- **Tengboche:** 3,867 m (Wikipedia), 3,860 m and 3,890 m (operators).
- **Dingboche:** 4,410 m (Wikipedia), 4,350 m (Stingy Nomads). The terrain model reads 4,320 m.
- **Lobuche:** 4,940 m (Wikipedia), 4,910 to 4,920 m (operators).
- **Gorak Shep:** 5,164 m (Wikipedia), 5,130 m (Stingy Nomads).
- **Base Camp:** 5,364 m (Wikipedia), 5,340 m (Stingy Nomads). The camp moves with the glacier and the season.
- **Kala Patthar:** 5,644.5 m (2008 GPS) and 5,643 m (2006 GPS), against 5,545 to 5,550 m in most guides and 5,600 m in one ([Wikipedia](https://en.wikipedia.org/wiki/Kala_Patthar)). Wikipedia notes the climbed point may be a local high point on the Pumori ridge. JSON uses 5,644.
- **Khumbu trek card:** NPR 2,000 in older guides, NPR 3,000 for most foreigners since July 2024.
- **Park fee VAT:** NPR 3,000 with or without 13% VAT, depending on the source.
- **TIMS and guides:** both disputed between national and local authorities (see permits).
- **Plastic ban:** reports from 2019 disagree on whether plastic water bottles were included, and I found no confirmation of how it is enforced today.

### Sources

Opened and read:
- [Wikipedia, Lukla](https://en.wikipedia.org/wiki/Lukla), [Tenzing-Hillary Airport](https://en.wikipedia.org/wiki/Tenzing%E2%80%93Hillary_Airport), [Phakding](https://en.wikipedia.org/wiki/Phakding), [Namche Bazaar](https://en.wikipedia.org/wiki/Namche_Bazaar), [Tengboche Monastery](https://en.wikipedia.org/wiki/Tengboche_Monastery), [Pangboche](https://en.wikipedia.org/wiki/Pangboche), [Dingboche](https://en.wikipedia.org/wiki/Dingboche), [Pheriche](https://en.wikipedia.org/wiki/Pheriche), [Lobuche, Nepal](https://en.wikipedia.org/wiki/Lobuche,_Nepal), [Gorak Shep](https://en.wikipedia.org/wiki/Gorak_Shep), [Kala Patthar](https://en.wikipedia.org/wiki/Kala_Patthar), [Everest base camps](https://en.wikipedia.org/wiki/Everest_base_camps)
- [Stingy Nomads, EBC itinerary](https://stingynomads.com/everest-base-camp-trek-itinerary-nepal/)
- [Khumbu Pasang Lhamu Rural Municipality, official website](https://khumbupasanglhamumun.gov.np/)
- [Himal Press, Everest region entry fee raised, July 2024](https://en.himalpress.com/entry-fee-to-everest-region-hiked-by-rs-1000/)
- [Himalayan Times, Sagarmatha park fees, Oct 2024](https://thehimalayantimes.com/nepal/around-9000-trekkers-visitsagarmatha-region-in-a-month)
- [Explore Vision Nepal, EBC permits 2026](https://explorevisionnepal.com/everest-base-camp-trek-permit/)
- [Ekantipur, Manthali to Lukla flights, 4 Oct 2026](https://ekantipur.com/bagmati-pradesh/2026/10/04/en/manthali-lukla-flights-added-kathmandu-ramechhap-flights-prepared-08-24.html)
- [Rising Nepal, Manthali to Lukla flights, Oct 2024](https://risingnepaldaily.com/news/50477)
- [G Adventures, EBC trek departures](https://www.gadventures.com/checkout/22946/overview)
- [CDC Yellow Book, high-altitude travel](https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/high-altitude-travel-and-altitude-illness.html)
- [OpenStreetMap relation 1189003, Everest Base Camp Trek](https://www.openstreetmap.org/relation/1189003) and [SRTM via OpenTopoData](https://www.opentopodata.org/datasets/srtm/) for the measured values

Seen only in search results (lower confidence):
- [Setopati, park fee with VAT](https://en.setopati.com/social/120249)
- [Kathmandu Post, Everest region and the solo trek ban, Apr 2023](https://kathmandupost.com/money/2023/04/03/everest-region-nepal-tourism-board-dispute-over-solo-trek-ban-heats-up)
- [Himalayan Times, Everest region bans single-use plastic, 2019](https://thehimalayantimes.com/nepal/everest-region-bans-single-use-plastic-to-reduce-waste/)
- [Stingy Nomads, best time for EBC](https://stingynomads.com/best-time-for-everest-base-camp-trek)
- [Ace the Himalaya, EBC distance](https://www.acethehimalaya.com/everest-base-camp-trek-distance/)
- [Affordable Tours, Intrepid EBC departures](https://www.affordabletours.com/t/111434-everest-base-camp-trek)
- [Travelstride, Intrepid EBC 15 days](https://www.travelstride.com/trips/intrepid-everest-base-camp-trek-15-days)
- [TourRadar, Exodus EBC](https://tourradar.com/t/33554)
- [Nepal Hiking Team, EBC cost](https://www.nepalhikingteam.com/everest-base-camp-trek-cost)


## Landmark heights (added by the lead, 14 Oct 2026)

Heights the page prints for landmarks that are not a trek's own high point.

- **Ngāuruhoe, 2,291 m.** The cone beside the Tongariro Alpine Crossing. The crossing does not climb it. Sources: [GNS Science volcano fact sheet](https://www.gns.cri.nz/assets/Our-Science/Subfiles/Natural-Hazards-and-Risks/Subfiles/Volcanoes/Volcano-Fact-Sheet-Ngauruhoe.pdf), [Wikipedia](https://en.wikipedia.org/wiki/Mount_Ngauruhoe). Britannica gives 2,287 m.
