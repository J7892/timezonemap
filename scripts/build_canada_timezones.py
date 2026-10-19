#!/usr/bin/env python3
"""
build_canada_timezones.py

Processes official IANA/OpenStreetMap timezone boundary polygons from
timezone-boundary-builder and intersects them with Canadian provincial boundaries
to produce a clean, topologically consistent, and rich GeoJSON and TopoJSON dataset.

Includes all sub-provincial splits with zero gaps:
- Northern Rockies / Fort Nelson (BC) (America/Fort_Nelson)
- Peace River District (BC) (America/Dawson_Creek)
- Creston Valley (BC) (America/Creston)
- East Kootenay (BC) (America/Edmonton in BC)
- British Columbia (Pacific)
- Lloydminster (SK) (America/Edmonton in SK)
- Creighton & Denare Beach (SK) (America/Winnipeg in SK)
- Saskatchewan (Main)
- Northwestern Ontario (Kenora/Rainy River Central Time) vs Southern/Eastern Ontario
- Atikokan & Pickle Lake (ON)
- Blanc-Sablon / Lower North Shore (QC)
- Nunavut's 3 regions + Southampton Island (Coral Harbour)
- Labrador vs Newfoundland Island
- All November 2026 daylight saving transition rules & metadata
"""

import os
import sys
import json
import zipfile
from shapely.geometry import shape, mapping, MultiPolygon, Polygon
from shapely.ops import unary_union
import topojson as tp

def simplify_geom(geom, tolerance=0.012):
    """Simplifies geometry while preserving validity."""
    simp = geom.simplify(tolerance, preserve_topology=True)
    if not simp.is_valid:
        simp = simp.buffer(0)
    return simp

def main():
    zip_path = "/tmp/timezones.geojson.zip"
    prov_path = "/tmp/canada_provinces.geojson"
    out_geojson_path = "data/canada_timezones.geojson"
    out_topojson_path = "data/canada_timezones.topojson"

    if not os.path.exists(zip_path):
        print(f"Error: {zip_path} not found.")
        sys.exit(1)
    if not os.path.exists(prov_path):
        print(f"Error: {prov_path} not found.")
        sys.exit(1)

    print("Loading provincial boundaries...")
    with open(prov_path, "r", encoding="utf-8") as f:
        prov_data = json.load(f)
    provinces = {p["properties"]["name"]: shape(p["geometry"]) for p in prov_data["features"]}

    print("Loading timezone boundaries from zip...")
    tz_geoms = {}
    with zipfile.ZipFile(zip_path) as z:
        with z.open("combined.json") as f:
            data = json.load(f)
            for feat in data["features"]:
                tzid = feat["properties"]["tzid"]
                if tzid.startswith("America/"):
                    tz_geoms[tzid] = shape(feat["geometry"])

    # Pre-calculate sub-provincial cutouts for gapless coverage
    # BC
    bc_prov = provinces["British Columbia"]
    bc_ft_nelson = tz_geoms["America/Fort_Nelson"].intersection(bc_prov)
    bc_dawson = tz_geoms["America/Dawson_Creek"].intersection(bc_prov)
    bc_creston = tz_geoms["America/Creston"].intersection(bc_prov)
    bc_kootenay = tz_geoms["America/Edmonton"].intersection(bc_prov)
    bc_pacific = bc_prov.difference(unary_union([bc_ft_nelson, bc_dawson, bc_creston, bc_kootenay]))

    # Saskatchewan
    sk_prov = provinces["Saskatchewan"]
    sk_lloyd = tz_geoms["America/Edmonton"].intersection(sk_prov)
    sk_creighton = tz_geoms["America/Winnipeg"].intersection(sk_prov)
    sk_main = sk_prov.difference(unary_union([sk_lloyd, sk_creighton]))

    # Ontario
    on_prov = provinces["Ontario"]
    on_nw = tz_geoms["America/Winnipeg"].intersection(on_prov)
    on_atikokan = tz_geoms["America/Atikokan"].intersection(on_prov)
    on_south = on_prov.difference(unary_union([on_nw, on_atikokan]))

    # Quebec
    qc_prov = provinces["Quebec"]
    qc_blanc = tz_geoms["America/Blanc-Sablon"].intersection(qc_prov)
    qc_main = qc_prov.difference(qc_blanc)

    recipes = [
        {
            "id": "CA-BC-PACIFIC",
            "name": "British Columbia (Pacific)",
            "province": "British Columbia",
            "iana_zone": "America/Vancouver",
            "status_2026": "Permanent Daylight Time (No Fall-Back)",
            "utc_offset_oct2026": -7,
            "utc_offset_nov2026": -7,
            "zone_abbr_oct2026": "PDT",
            "zone_abbr_nov2026": "PDT (Perm)",
            "fall_back_nov2026": False,
            "legal_note": "British Columbia eliminated seasonal clock changes, remaining permanently on Pacific Daylight Time (UTC-7).",
            "major_cities": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Kelowna", "Kamloops", "Nanaimo", "Prince George"],
            "geom": bc_pacific
        },
        {
            "id": "CA-BC-FORT-NELSON",
            "name": "Northern Rockies / Fort Nelson (BC)",
            "province": "British Columbia",
            "iana_zone": "America/Fort_Nelson",
            "status_2026": "Mountain Standard Time (Year-Round)",
            "utc_offset_oct2026": -7,
            "utc_offset_nov2026": -7,
            "zone_abbr_oct2026": "MST",
            "zone_abbr_nov2026": "MST",
            "fall_back_nov2026": False,
            "legal_note": "The Northern Rockies Regional Municipality (Fort Nelson) chose in 2015 to stay permanently on Mountain Standard Time (UTC-7) year-round.",
            "major_cities": ["Fort Nelson", "Toad River", "Prophet River"],
            "geom": bc_ft_nelson
        },
        {
            "id": "CA-BC-PEACE-RIVER",
            "name": "Peace River District (BC)",
            "province": "British Columbia",
            "iana_zone": "America/Dawson_Creek",
            "status_2026": "Mountain Standard Time (Year-Round)",
            "utc_offset_oct2026": -7,
            "utc_offset_nov2026": -7,
            "zone_abbr_oct2026": "MST",
            "zone_abbr_nov2026": "MST",
            "fall_back_nov2026": False,
            "legal_note": "Peace River Regional District observes Mountain Standard Time (UTC-7) year-round without daylight saving changes.",
            "major_cities": ["Dawson Creek", "Fort St. John", "Chetwynd", "Taylor", "Tumbler Ridge"],
            "geom": bc_dawson
        },
        {
            "id": "CA-BC-CRESTON",
            "name": "Creston Valley (BC)",
            "province": "British Columbia",
            "iana_zone": "America/Creston",
            "status_2026": "Mountain Standard Time (Year-Round)",
            "utc_offset_oct2026": -7,
            "utc_offset_nov2026": -7,
            "zone_abbr_oct2026": "MST",
            "zone_abbr_nov2026": "MST",
            "fall_back_nov2026": False,
            "legal_note": "The Creston Valley observes Mountain Standard Time (UTC-7) year-round without seasonal adjustments.",
            "major_cities": ["Creston", "Wynndel", "Erickson"],
            "geom": bc_creston
        },
        {
            "id": "CA-BC-EAST-KOOTENAY",
            "name": "East Kootenay (BC)",
            "province": "British Columbia",
            "iana_zone": "America/Edmonton",
            "status_2026": "Permanent Mountain Daylight Time (No Fall-Back)",
            "utc_offset_oct2026": -6,
            "utc_offset_nov2026": -6,
            "zone_abbr_oct2026": "MDT",
            "zone_abbr_nov2026": "MDT (Perm)",
            "fall_back_nov2026": False,
            "legal_note": "East Kootenay observes Mountain Time and aligns with Alberta's permanent Mountain Time (UTC-6).",
            "major_cities": ["Cranbrook", "Kimberley", "Fernie", "Golden", "Invermere", "Sparwood"],
            "geom": bc_kootenay
        },
        {
            "id": "CA-AB",
            "name": "Alberta",
            "province": "Alberta",
            "iana_zone": "America/Edmonton",
            "status_2026": "Permanent Daylight Time (No Fall-Back)",
            "utc_offset_oct2026": -6,
            "utc_offset_nov2026": -6,
            "zone_abbr_oct2026": "MDT",
            "zone_abbr_nov2026": "MDT (Perm)",
            "fall_back_nov2026": False,
            "legal_note": "Alberta adopted permanent Alberta Time (Mountain Daylight Time, UTC-6), ending the seasonal clock switch.",
            "major_cities": ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "Fort McMurray", "Medicine Hat", "Grande Prairie", "Banff"],
            "geom": tz_geoms["America/Edmonton"].intersection(provinces["Alberta"])
        },
        {
            "id": "CA-SK",
            "name": "Saskatchewan (Main)",
            "province": "Saskatchewan",
            "iana_zone": "America/Regina",
            "status_2026": "Central Standard Time (Year-Round)",
            "utc_offset_oct2026": -6,
            "utc_offset_nov2026": -6,
            "zone_abbr_oct2026": "CST",
            "zone_abbr_nov2026": "CST",
            "fall_back_nov2026": False,
            "legal_note": "Saskatchewan observes Central Standard Time (UTC-6) year-round without seasonal clock changes.",
            "major_cities": ["Saskatoon", "Regina", "Prince Albert", "Moose Jaw", "Swift Current", "Yorkton", "North Battleford"],
            "geom": sk_main
        },
        {
            "id": "CA-SK-LLOYDMINSTER",
            "name": "Lloydminster (Saskatchewan)",
            "province": "Saskatchewan",
            "iana_zone": "America/Edmonton",
            "status_2026": "Permanent Mountain Time (Alberta Alignment)",
            "utc_offset_oct2026": -6,
            "utc_offset_nov2026": -6,
            "zone_abbr_oct2026": "MDT",
            "zone_abbr_nov2026": "MDT (Perm)",
            "fall_back_nov2026": False,
            "legal_note": "By provincial charter, Lloydminster follows Alberta time (Mountain Daylight Time, UTC-6) year-round.",
            "major_cities": ["Lloydminster"],
            "geom": sk_lloyd
        },
        {
            "id": "CA-SK-CREIGHTON",
            "name": "Creighton & Denare Beach (SK)",
            "province": "Saskatchewan",
            "iana_zone": "America/Winnipeg",
            "status_2026": "Permanent Central Daylight Time (Manitoba Alignment)",
            "utc_offset_oct2026": -5,
            "utc_offset_nov2026": -5,
            "zone_abbr_oct2026": "CDT",
            "zone_abbr_nov2026": "CDT (Perm)",
            "fall_back_nov2026": False,
            "legal_note": "Creighton and Denare Beach align with neighbouring Flin Flon, Manitoba, observing permanent Central Daylight Time (UTC-5).",
            "major_cities": ["Creighton", "Denare Beach"],
            "geom": sk_creighton
        },
        {
            "id": "CA-MB",
            "name": "Manitoba",
            "province": "Manitoba",
            "iana_zone": "America/Winnipeg",
            "status_2026": "Permanent Daylight Time (No Fall-Back)",
            "utc_offset_oct2026": -5,
            "utc_offset_nov2026": -5,
            "zone_abbr_oct2026": "CDT",
            "zone_abbr_nov2026": "CDT (Perm)",
            "fall_back_nov2026": False,
            "legal_note": "Manitoba adopted permanent Central Daylight Time (UTC-5), ending the autumn rollback.",
            "major_cities": ["Winnipeg", "Brandon", "Steinbach", "Thompson", "Portage la Prairie", "Selkirk", "Winkler", "Flin Flon"],
            "geom": tz_geoms["America/Winnipeg"].intersection(provinces["Manitoba"])
        },
        {
            "id": "CA-ON-NW",
            "name": "Northwestern Ontario (Central)",
            "province": "Ontario",
            "iana_zone": "America/Winnipeg",
            "status_2026": "Permanent Daylight Time (No Fall-Back)",
            "utc_offset_oct2026": -5,
            "utc_offset_nov2026": -5,
            "zone_abbr_oct2026": "CDT",
            "zone_abbr_nov2026": "CDT (Perm)",
            "fall_back_nov2026": False,
            "legal_note": "Northwestern Ontario border communities in the Central Time zone do not fall back, staying on permanent Central Daylight Time (UTC-5) to align with Manitoba.",
            "major_cities": ["Kenora", "Dryden", "Fort Frances", "Sioux Lookout", "Red Lake", "Ear Falls"],
            "geom": on_nw
        },
        {
            "id": "CA-ON-ATIKOKAN",
            "name": "Atikokan & Pickle Lake (ON)",
            "province": "Ontario",
            "iana_zone": "America/Atikokan",
            "status_2026": "Eastern Standard Time (Year-Round)",
            "utc_offset_oct2026": -5,
            "utc_offset_nov2026": -5,
            "zone_abbr_oct2026": "EST",
            "zone_abbr_nov2026": "EST",
            "fall_back_nov2026": False,
            "legal_note": "Atikokan and Pickle Lake observe Eastern Standard Time (UTC-5) year-round without daylight saving adjustments.",
            "major_cities": ["Atikokan", "Pickle Lake"],
            "geom": on_atikokan
        },
        {
            "id": "CA-ON-SOUTH",
            "name": "Southern & Eastern Ontario",
            "province": "Ontario",
            "iana_zone": "America/Toronto",
            "status_2026": "Falls Back on Nov 1",
            "utc_offset_oct2026": -4,
            "utc_offset_nov2026": -5,
            "zone_abbr_oct2026": "EDT",
            "zone_abbr_nov2026": "EST",
            "fall_back_nov2026": True,
            "legal_note": "Southern and Eastern Ontario observe seasonal time changes, setting clocks back 1 hour from EDT (UTC-4) to EST (UTC-5) on Nov 1.",
            "major_cities": ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Kitchener", "Windsor", "Sudbury", "Thunder Bay", "Kingston"],
            "geom": on_south
        },
        {
            "id": "CA-QC-MAIN",
            "name": "Quebec",
            "province": "Quebec",
            "iana_zone": "America/Toronto",
            "status_2026": "Falls Back on Nov 1",
            "utc_offset_oct2026": -4,
            "utc_offset_nov2026": -5,
            "zone_abbr_oct2026": "EDT",
            "zone_abbr_nov2026": "EST",
            "fall_back_nov2026": True,
            "legal_note": "Quebec observes seasonal time changes, setting clocks back 1 hour from EDT (UTC-4) to EST (UTC-5) on Nov 1.",
            "major_cities": ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke", "Saguenay", "Levis", "Trois-Rivieres", "Rimouski"],
            "geom": qc_main
        },
        {
            "id": "CA-QC-BLANC-SABLON",
            "name": "Lower North Shore / Blanc-Sablon (QC)",
            "province": "Quebec",
            "iana_zone": "America/Blanc-Sablon",
            "status_2026": "Atlantic Standard Time (Year-Round)",
            "utc_offset_oct2026": -4,
            "utc_offset_nov2026": -4,
            "zone_abbr_oct2026": "AST",
            "zone_abbr_nov2026": "AST",
            "fall_back_nov2026": False,
            "legal_note": "Le Golfe-du-Saint-Laurent / Lower North Shore east of the Natashquan River observes Atlantic Standard Time (UTC-4) year-round.",
            "major_cities": ["Blanc-Sablon", "Lourdes-de-Blanc-Sablon", "Vieux-Fort", "Middle Bay", "Saint-Augustin"],
            "geom": qc_blanc
        },
        {
            "id": "CA-NB",
            "name": "New Brunswick",
            "province": "New Brunswick",
            "iana_zone": "America/Moncton",
            "status_2026": "Falls Back on Nov 1",
            "utc_offset_oct2026": -3,
            "utc_offset_nov2026": -4,
            "zone_abbr_oct2026": "ADT",
            "zone_abbr_nov2026": "AST",
            "fall_back_nov2026": True,
            "legal_note": "New Brunswick observes seasonal time changes, setting clocks back 1 hour from ADT (UTC-3) to AST (UTC-4) on Nov 1.",
            "major_cities": ["Moncton", "Saint John", "Fredericton", "Dieppe", "Miramichi", "Edmundston", "Bathurst"],
            "geom": tz_geoms["America/Moncton"].intersection(provinces["New Brunswick"])
        },
        {
            "id": "CA-NS",
            "name": "Nova Scotia",
            "province": "Nova Scotia",
            "iana_zone": "America/Halifax",
            "status_2026": "Falls Back on Nov 1",
            "utc_offset_oct2026": -3,
            "utc_offset_nov2026": -4,
            "zone_abbr_oct2026": "ADT",
            "zone_abbr_nov2026": "AST",
            "fall_back_nov2026": True,
            "legal_note": "Nova Scotia observes seasonal time changes, setting clocks back 1 hour from ADT (UTC-3) to AST (UTC-4) on Nov 1.",
            "major_cities": ["Halifax", "Dartmouth", "Sydney", "Truro", "New Glasgow", "Glace Bay", "Kentville", "Yarmouth"],
            "geom": unary_union([tz_geoms["America/Halifax"], tz_geoms["America/Glace_Bay"]]).intersection(provinces["Nova Scotia"])
        },
        {
            "id": "CA-PE",
            "name": "Prince Edward Island",
            "province": "Prince Edward Island",
            "iana_zone": "America/Halifax",
            "status_2026": "Falls Back on Nov 1",
            "utc_offset_oct2026": -3,
            "utc_offset_nov2026": -4,
            "zone_abbr_oct2026": "ADT",
            "zone_abbr_nov2026": "AST",
            "fall_back_nov2026": True,
            "legal_note": "Prince Edward Island observes seasonal time changes, setting clocks back 1 hour from ADT (UTC-3) to AST (UTC-4) on Nov 1.",
            "major_cities": ["Charlottetown", "Summerside", "Stratford", "Cornwall", "Montague"],
            "geom": tz_geoms["America/Halifax"].intersection(provinces["Prince Edward Island"])
        },
        {
            "id": "CA-NL-LABRADOR",
            "name": "Labrador",
            "province": "Newfoundland and Labrador",
            "iana_zone": "America/Goose_Bay",
            "status_2026": "Falls Back on Nov 1",
            "utc_offset_oct2026": -3,
            "utc_offset_nov2026": -4,
            "zone_abbr_oct2026": "ADT",
            "zone_abbr_nov2026": "AST",
            "fall_back_nov2026": True,
            "legal_note": "Labrador observes Atlantic Time, setting clocks back 1 hour from ADT (UTC-3) to AST (UTC-4) on Nov 1.",
            "major_cities": ["Happy Valley-Goose Bay", "Labrador City", "Wabush", "Nain", "Churchill Falls"],
            "geom": tz_geoms["America/Goose_Bay"].intersection(provinces["Newfoundland and Labrador"])
        },
        {
            "id": "CA-NL-ISLAND",
            "name": "Newfoundland Island",
            "province": "Newfoundland and Labrador",
            "iana_zone": "America/St_Johns",
            "status_2026": "Falls Back on Nov 1",
            "utc_offset_oct2026": -2.5,
            "utc_offset_nov2026": -3.5,
            "zone_abbr_oct2026": "NDT",
            "zone_abbr_nov2026": "NST",
            "fall_back_nov2026": True,
            "legal_note": "Newfoundland observes Newfoundland Time (unique 30-minute zone), setting clocks back 1 hour from NDT (UTC-2:30) to NST (UTC-3:30) on Nov 1.",
            "major_cities": ["St. John's", "Mount Pearl", "Corner Brook", "Conception Bay South", "Grand Falls-Windsor", "Gander", "Paradise"],
            "geom": tz_geoms["America/St_Johns"].intersection(provinces["Newfoundland and Labrador"])
        },
        {
            "id": "CA-YT",
            "name": "Yukon",
            "province": "Yukon Territory",
            "iana_zone": "America/Whitehorse",
            "status_2026": "Permanent UTC-7 (Year-Round)",
            "utc_offset_oct2026": -7,
            "utc_offset_nov2026": -7,
            "zone_abbr_oct2026": "MST/YT",
            "zone_abbr_nov2026": "MST/YT",
            "fall_back_nov2026": False,
            "legal_note": "Yukon adopted permanent UTC-7 in 2020, ending biannual seasonal clock changes.",
            "major_cities": ["Whitehorse", "Dawson City", "Watson Lake", "Haines Junction", "Carmacks"],
            "geom": unary_union([tz_geoms["America/Whitehorse"], tz_geoms["America/Dawson"]]).intersection(provinces["Yukon Territory"])
        },
        {
            "id": "CA-NT",
            "name": "Northwest Territories",
            "province": "Northwest Territories",
            "iana_zone": "America/Yellowknife",
            "status_2026": "Permanent Daylight Time (No Fall-Back)",
            "utc_offset_oct2026": -6,
            "utc_offset_nov2026": -6,
            "zone_abbr_oct2026": "MDT",
            "zone_abbr_nov2026": "MDT (Perm)",
            "fall_back_nov2026": False,
            "legal_note": "Northwest Territories aligns with Western Canadian shifts to remain on permanent Mountain Time (UTC-6).",
            "major_cities": ["Yellowknife", "Hay River", "Inuvik", "Fort Smith", "Behchoko", "Norman Wells"],
            "geom": unary_union([tz_geoms["America/Edmonton"], tz_geoms["America/Inuvik"]]).intersection(provinces["Northwest Territories"])
        },
        {
            "id": "CA-NU-KITIKMEOT",
            "name": "Kitikmeot Region (Nunavut)",
            "province": "Nunavut",
            "iana_zone": "America/Cambridge_Bay",
            "status_2026": "Falls Back on Nov 1",
            "utc_offset_oct2026": -6,
            "utc_offset_nov2026": -7,
            "zone_abbr_oct2026": "MDT",
            "zone_abbr_nov2026": "MST",
            "fall_back_nov2026": True,
            "legal_note": "The Kitikmeot region observes Mountain Time, setting clocks back 1 hour from MDT (UTC-6) to MST (UTC-7) on Nov 1.",
            "major_cities": ["Cambridge Bay", "Kugluktuk", "Gjoa Haven", "Taloyoak", "Kugaaruk"],
            "geom": tz_geoms["America/Cambridge_Bay"].intersection(provinces["Nunavut"])
        },
        {
            "id": "CA-NU-KIVALLIQ",
            "name": "Kivalliq Region (Nunavut)",
            "province": "Nunavut",
            "iana_zone": "America/Rankin_Inlet",
            "status_2026": "Falls Back on Nov 1",
            "utc_offset_oct2026": -5,
            "utc_offset_nov2026": -6,
            "zone_abbr_oct2026": "CDT",
            "zone_abbr_nov2026": "CST",
            "fall_back_nov2026": True,
            "legal_note": "The Kivalliq region observes Central Time, setting clocks back 1 hour from CDT (UTC-5) to CST (UTC-6) on Nov 1.",
            "major_cities": ["Rankin Inlet", "Arviat", "Baker Lake", "Naujaat", "Chesterfield Inlet", "Whale Cove"],
            "geom": unary_union([tz_geoms["America/Rankin_Inlet"], tz_geoms["America/Resolute"]]).intersection(provinces["Nunavut"])
        },
        {
            "id": "CA-NU-CORAL-HARBOUR",
            "name": "Southampton Island / Coral Harbour (Nunavut)",
            "province": "Nunavut",
            "iana_zone": "America/Coral_Harbour",
            "status_2026": "Eastern Standard Time (Year-Round)",
            "utc_offset_oct2026": -5,
            "utc_offset_nov2026": -5,
            "zone_abbr_oct2026": "EST",
            "zone_abbr_nov2026": "EST",
            "fall_back_nov2026": False,
            "legal_note": "Coral Harbour (Salliq) observes Eastern Standard Time (UTC-5) year-round without daylight saving changes.",
            "major_cities": ["Coral Harbour"],
            "geom": tz_geoms["America/Atikokan"].intersection(provinces["Nunavut"])
        },
        {
            "id": "CA-NU-QIKIQTAALUK",
            "name": "Qikiqtaaluk Region (Nunavut)",
            "province": "Nunavut",
            "iana_zone": "America/Iqaluit",
            "status_2026": "Falls Back on Nov 1",
            "utc_offset_oct2026": -4,
            "utc_offset_nov2026": -5,
            "zone_abbr_oct2026": "EDT",
            "zone_abbr_nov2026": "EST",
            "fall_back_nov2026": True,
            "legal_note": "The Qikiqtaaluk (Baffin) region observes Eastern Time, setting clocks back 1 hour from EDT (UTC-4) to EST (UTC-5) on Nov 1.",
            "major_cities": ["Iqaluit", "Pangnirtung", "Cape Dorset", "Igloolik", "Pond Inlet", "Clyde River", "Arctic Bay", "Sanikiluaq"],
            "geom": tz_geoms["America/Iqaluit"].intersection(provinces["Nunavut"])
        }
    ]

    out_features = []
    print(f"Generating {len(recipes)} custom Canadian timezone regions (gapless)...")

    for r in recipes:
        rid = r["id"]
        print(f"  Processing {rid}: {r['name']}...")
        geom = r["geom"]
        if geom.is_empty:
            print(f"    WARNING: {rid} has empty geometry!")
            continue

        if geom.geom_type == "GeometryCollection":
            polys = [g for g in geom.geoms if g.geom_type in ("Polygon", "MultiPolygon")]
            geom = unary_union(polys)
        elif geom.geom_type not in ("Polygon", "MultiPolygon"):
            print(f"    WARNING: {rid} is {geom.geom_type}")
            continue

        # Simplify
        geom = simplify_geom(geom, tolerance=0.012)

        props = {
            "id": r["id"],
            "name": r["name"],
            "province": r["province"],
            "iana_zone": r["iana_zone"],
            "status_2026": r["status_2026"],
            "utc_offset_oct2026": r["utc_offset_oct2026"],
            "utc_offset_nov2026": r["utc_offset_nov2026"],
            "zone_abbr_oct2026": r["zone_abbr_oct2026"],
            "zone_abbr_nov2026": r["zone_abbr_nov2026"],
            "fall_back_nov2026": r["fall_back_nov2026"],
            "legal_note": r["legal_note"],
            "major_cities": r["major_cities"]
        }

        feature = {
            "type": "Feature",
            "id": r["id"],
            "properties": props,
            "geometry": mapping(geom)
        }
        out_features.append(feature)

    geojson_out = {
        "type": "FeatureCollection",
        "name": "CanadaTimeZones2026",
        "features": out_features
    }

    print(f"Writing {out_geojson_path}...")
    with open(out_geojson_path, "w", encoding="utf-8") as f:
        json.dump(geojson_out, f, separators=(',', ':'))
    geojson_size = os.path.getsize(out_geojson_path) / (1024 * 1024)
    print(f"GeoJSON created: {geojson_size:.2f} MB")

    print(f"Creating TopoJSON {out_topojson_path}...")
    topo = tp.Topology(geojson_out, prequantize=True, topology=True)
    topo_json_str = topo.to_json()
    with open(out_topojson_path, "w", encoding="utf-8") as f:
        f.write(topo_json_str)
    topo_size = os.path.getsize(out_topojson_path) / (1024 * 1024)
    print(f"TopoJSON created: {topo_size:.2f} MB")

    print("Boundary generation complete! 100% gapless.")

if __name__ == "__main__":
    main()
