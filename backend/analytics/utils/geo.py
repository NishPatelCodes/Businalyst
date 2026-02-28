"""
Geographic coordinates for map markers (state, region, country names).
"""

# US regions (Superstore-style)
REGION_COORDS = {
    "south": [-86.9, 32.4],
    "west": [-119.4, 36.8],
    "east": [-75.5, 43.0],
    "central": [-98.0, 39.5],
    "northeast": [-74.0, 41.5],
    "southeast": [-84.4, 33.7],
    "north": [-98.0, 47.5],
    "midwest": [-93.1, 42.0],
    "northwest": [-120.7, 47.0],
    "southwest": [-111.0, 34.0],
}

# US states – approximate center [lng, lat] for map markers
STATE_COORDS = {
    "alabama": [-86.9, 32.4], "alaska": [-153.5, 64.8], "arizona": [-111.4, 34.3],
    "arkansas": [-92.4, 34.9], "california": [-119.4, 36.8], "colorado": [-105.3, 38.9],
    "connecticut": [-72.8, 41.6], "delaware": [-75.5, 38.9], "florida": [-81.5, 27.7],
    "georgia": [-83.6, 32.2], "hawaii": [-155.6, 19.7], "idaho": [-114.4, 44.4],
    "illinois": [-89.2, 40.0], "indiana": [-86.1, 40.3], "iowa": [-93.1, 42.0],
    "kansas": [-98.5, 38.5], "kentucky": [-84.3, 37.7], "louisiana": [-91.9, 31.2],
    "maine": [-69.4, 45.4], "maryland": [-76.6, 39.0], "massachusetts": [-71.4, 42.4],
    "michigan": [-84.5, 43.3], "minnesota": [-94.7, 46.3], "mississippi": [-89.6, 32.7],
    "missouri": [-91.8, 37.9], "montana": [-110.4, 47.0], "nebraska": [-99.9, 41.1],
    "nevada": [-116.4, 39.3], "new hampshire": [-71.6, 43.2], "new jersey": [-74.4, 40.2],
    "new mexico": [-105.8, 34.5], "new york": [-75.5, 43.0], "north carolina": [-79.0, 35.5],
    "north dakota": [-100.4, 47.5], "ohio": [-82.9, 40.4], "oklahoma": [-97.5, 35.5],
    "oregon": [-120.6, 43.9], "pennsylvania": [-77.2, 40.9], "rhode island": [-71.5, 41.6],
    "south carolina": [-81.2, 33.8], "south dakota": [-99.9, 44.4], "tennessee": [-86.6, 35.8],
    "texas": [-99.2, 31.4], "utah": [-111.6, 39.3], "vermont": [-72.6, 44.1],
    "virginia": [-78.7, 37.5], "washington": [-120.7, 47.0], "west virginia": [-80.5, 38.6],
    "wisconsin": [-89.6, 44.3], "wyoming": [-107.6, 43.0], "district of columbia": [-77.0, 38.9],
    "washington d.c.": [-77.0, 38.9], "dc": [-77.0, 38.9],
}

# Countries
COUNTRY_COORDS = {
    "united states": [-98.0, 38.0], "usa": [-98.0, 38.0], "canada": [-106.3, 56.1],
    "united kingdom": [-2.6, 54.5], "uk": [-2.6, 54.5], "germany": [10.5, 51.2],
    "france": [2.2, 46.2], "australia": [133.8, -25.3], "india": [78.0, 21.0],
    "china": [105.2, 35.9], "japan": [138.3, 36.2], "brazil": [-55.0, -10.8],
    "mexico": [-102.6, 23.6], "spain": [-3.7, 40.4], "italy": [12.6, 42.8],
    "netherlands": [5.3, 52.1], "russia": [105.3, 61.5], "south korea": [127.8, 36.4],
}


def coords_for_place(name):
    """Return [lng, lat] for a place name (state, region, or country). Normalize to lowercase key."""
    if not name or not isinstance(name, str):
        return None
    key = name.strip().lower()
    if not key or key in ("nan", ""):
        return None
    if key in STATE_COORDS:
        return STATE_COORDS[key]
    if key in REGION_COORDS:
        return REGION_COORDS[key]
    if key in COUNTRY_COORDS:
        return COUNTRY_COORDS[key]
    return None
