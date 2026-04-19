#!/usr/bin/env python3
"""
Fix coordinate systems for campus-nav project.

Problem:
- OSM buildings were converted WGS84 -> GCJ02 (wrong, since we use CartoDB/WGS84 tiles)
- POI data is in GCJ02 (from 高德API)

Solution:
- Re-parse OSM XML and keep original WGS84 coordinates (no conversion)
- Convert POI coordinates from GCJ02 -> WGS84
- Match unnamed buildings to nearest POIs
- Generate rectangular buildings for POIs without nearby OSM buildings
- Output: real_buildings.json (WGS84) + pois.ts (WGS84)
"""

import json
import math
import xml.etree.ElementTree as ET
from typing import Optional

# ============================================================
# GCJ02 <-> WGS84 conversion
# ============================================================

PI = math.pi
A = 6378245.0  # semi-major axis
EE = 0.00669342162296594323  # eccentricity squared


def _transform_lat(lng, lat):
    ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + \
          0.1 * lng * lat + 0.2 * math.sqrt(abs(lng))
    ret += (20.0 * math.sin(6.0 * lng * PI) + 20.0 *
            math.sin(2.0 * lng * PI)) * 2.0 / 3.0
    ret += (20.0 * math.sin(lat * PI) + 40.0 *
            math.sin(lat / 3.0 * PI)) * 2.0 / 3.0
    ret += (160.0 * math.sin(lat / 12.0 * PI) + 320.0 *
            math.sin(lat * PI / 30.0)) * 2.0 / 3.0
    return ret


def _transform_lng(lng, lat):
    ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + \
          0.1 * lng * lat + 0.1 * math.sqrt(abs(lng))
    ret += (20.0 * math.sin(6.0 * lng * PI) + 20.0 *
            math.sin(2.0 * lng * PI)) * 2.0 / 3.0
    ret += (20.0 * math.sin(lng * PI) + 40.0 *
            math.sin(lng / 3.0 * PI)) * 2.0 / 3.0
    ret += (150.0 * math.sin(lng / 12.0 * PI) + 300.0 *
            math.sin(lng / 30.0 * PI)) * 2.0 / 3.0
    return ret


def gcj02_to_wgs84(lng, lat):
    """Convert GCJ02 coordinates to WGS84."""
    dlat = _transform_lat(lng - 105.0, lat - 35.0)
    dlng = _transform_lng(lng - 105.0, lat - 35.0)
    radlat = lat / 180.0 * PI
    magic = math.sin(radlat)
    magic = 1 - EE * magic * magic
    sqrtmagic = math.sqrt(magic)
    dlat = (dlat * 180.0) / ((A * (1 - EE)) / (magic * sqrtmagic) * PI)
    dlng = (dlng * 180.0) / (A / sqrtmagic * math.cos(radlat) * PI)
    mglat = lat + dlat
    mglng = lng + dlng
    return (lng * 2 - mglng, lat * 2 - mglat)


# ============================================================
# Haversine distance (meters)
# ============================================================

def haversine(lon1, lat1, lon2, lat2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ============================================================
# POI data (GCJ02 coordinates from 高德)
# ============================================================

POIS = [
    {"id": 1, "name": "哈尔滨商业大学(北校区)", "type": "地标", "lng": 126.563532, "lat": 45.816893, "description": "校园中心"},
    {"id": 2, "name": "A区", "type": "教学区", "lng": 126.564296, "lat": 45.820344, "description": "北校区A区(北区)"},
    {"id": 3, "name": "B区", "type": "教学区", "lng": 126.563531, "lat": 45.812324, "description": "北校区B区(东区)"},
    {"id": 4, "name": "C区", "type": "教学区", "lng": 126.559721, "lat": 45.810841, "description": "北校区C区(西区)"},
    {"id": 5, "name": "A区会计学院", "type": "教学楼", "lng": 126.565646, "lat": 45.817591, "description": "会计学院教学楼"},
    {"id": 6, "name": "A区设计艺术学院", "type": "教学楼", "lng": 126.565682, "lat": 45.818514, "description": "设计艺术学院"},
    {"id": 7, "name": "A区体育学院", "type": "教学楼", "lng": 126.564059, "lat": 45.821450, "description": "体育学院"},
    {"id": 8, "name": "B区能源与建筑工程学院", "type": "教学楼", "lng": 126.562600, "lat": 45.812339, "description": "能源与建筑工程学院"},
    {"id": 9, "name": "B区基础科学学院", "type": "教学楼", "lng": 126.562196, "lat": 45.811559, "description": "基础科学学院"},
    {"id": 10, "name": "C区轻工学院", "type": "教学楼", "lng": 126.559963, "lat": 45.812659, "description": "轻工学院"},
    {"id": 11, "name": "C区管理学院", "type": "教学楼", "lng": 126.559819, "lat": 45.811815, "description": "管理学院"},
    {"id": 12, "name": "A区图书馆", "type": "图书馆", "lng": 126.564299, "lat": 45.819395, "description": "北校区A区图书馆"},
    {"id": 13, "name": "A区食堂", "type": "食堂", "lng": 126.565422, "lat": 45.822546, "description": "北校区A区学生食堂"},
    {"id": 14, "name": "A区体育场", "type": "体育设施", "lng": 126.566277, "lat": 45.821177, "description": "北校区A区体育场(操场)"},
    {"id": 15, "name": "A区体育馆", "type": "体育设施", "lng": 126.563650, "lat": 45.821319, "description": "北校区A区室内体育馆"},
    {"id": 16, "name": "体育馆(丁香大道)", "type": "体育设施", "lng": 126.566180, "lat": 45.821224, "description": "体育馆"},
    {"id": 17, "name": "A区足球场", "type": "体育设施", "lng": 126.563159, "lat": 45.820643, "description": "足球场"},
    {"id": 18, "name": "体育文化传播发展中心", "type": "体育设施", "lng": 126.566190, "lat": 45.820237, "description": "体育文化传播发展中心"},
    {"id": 19, "name": "A区研究生宿舍", "type": "宿舍", "lng": 126.566046, "lat": 45.824617, "description": "研究生宿舍区"},
    {"id": 20, "name": "第十四学生宿舍", "type": "宿舍", "lng": 126.565308, "lat": 45.823958, "description": "14号学生宿舍"},
    {"id": 21, "name": "A区14公寓", "type": "宿舍", "lng": 126.567563, "lat": 45.822552, "description": "A区14号公寓"},
    {"id": 22, "name": "第十八学生宿舍", "type": "宿舍", "lng": 126.562870, "lat": 45.823841, "description": "18号学生宿舍(北区)"},
    {"id": 23, "name": "C区学生公寓", "type": "宿舍", "lng": 126.559508, "lat": 45.809452, "description": "C区管理学院学生公寓"},
    {"id": 24, "name": "行政楼", "type": "行政办公", "lng": 126.562982, "lat": 45.818896, "description": "学校行政楼"},
    {"id": 25, "name": "征兵工作站", "type": "行政办公", "lng": 126.563694, "lat": 45.821415, "description": "北区征兵工作站"},
    {"id": 26, "name": "邮局(商大邮电所)", "type": "生活服务", "lng": 126.566366, "lat": 45.814818, "description": "中国邮政商大邮电所"},
    {"id": 27, "name": "教师公寓", "type": "生活服务", "lng": 126.559456, "lat": 45.814210, "description": "商大教师公寓"},
    {"id": 28, "name": "B区食堂(美食街)", "type": "食堂", "lng": 126.563525, "lat": 45.813575, "description": "B区食堂区域，含多家餐饮"},
    {"id": 29, "name": "校门(北门/1号门)", "type": "出入口", "lng": 126.560696, "lat": 45.818172, "description": "北校区主入口(学海街)"},
]

# ============================================================
# Color scheme for building categories
# ============================================================

CATEGORY_COLORS = {
    "教学楼": "#60a5fa",
    "图书馆": "#fbbf24",
    "食堂": "#f87171",
    "宿舍": "#a78bfa",
    "体育设施": "#4ade80",
    "校园建筑": "#22d3ee",
    "行政办公": "#38bdf8",
    "生活服务": "#fb923c",
    "出入口": "#f472b6",
    "其他": "#94a3b8",
}

# Map POI types to building categories
TYPE_TO_CATEGORY = {
    "教学楼": "教学楼",
    "教学区": "教学楼",
    "图书馆": "图书馆",
    "食堂": "食堂",
    "宿舍": "宿舍",
    "体育设施": "体育设施",
    "行政办公": "行政办公",
    "生活服务": "生活服务",
    "出入口": "出入口",
    "地标": "校园建筑",
}


def get_category_from_tags(tags: dict) -> str:
    """Determine building category from OSM tags."""
    name = tags.get("name", "")
    building = tags.get("building", "yes")
    amenity = tags.get("amenity", "")

    if "图书" in name:
        return "图书馆"
    if "食堂" in name or "餐" in name or amenity == "restaurant":
        return "食堂"
    if any(k in name for k in ["公寓", "宿舍", "寝室"]) or building == "apartments":
        return "宿舍"
    if any(k in name for k in ["体育", "球场", "运动"]):
        return "体育设施"
    if any(k in name for k in ["行政", "办公"]):
        return "行政办公"
    if any(k in name for k in ["教学", "学院", "教室"]):
        return "教学楼"
    if any(k in name for k in ["邮局", "超市", "商店", "服务"]):
        return "生活服务"
    if any(k in name for k in ["门", "入口"]):
        return "出入口"
    if building == "university":
        return "校园建筑"
    return "其他"


def get_color(category: str) -> str:
    return CATEGORY_COLORS.get(category, CATEGORY_COLORS["其他"])


# ============================================================
# Parse OSM XML -> GeoJSON features (WGS84, NO conversion)
# ============================================================

def parse_osm_buildings(osm_path: str) -> list:
    """Parse OSM XML and extract building ways as GeoJSON features in WGS84."""
    tree = ET.parse(osm_path)
    root = tree.getroot()

    # Build node lookup: id -> (lon, lat) in WGS84
    nodes = {}
    for node in root.iter("node"):
        nid = node.get("id")
        lat = float(node.get("lat"))
        lon = float(node.get("lon"))
        nodes[nid] = (lon, lat)

    features = []
    for way in root.iter("way"):
        tags = {}
        for tag in way.findall("tag"):
            tags[tag.get("k")] = tag.get("v")

        if "building" not in tags:
            continue

        # Get node references
        nd_refs = [nd.get("ref") for nd in way.findall("nd")]
        coords = []
        for ref in nd_refs:
            if ref in nodes:
                coords.append(list(nodes[ref]))  # [lon, lat] WGS84

        if len(coords) < 3:
            continue

        # Ensure closed polygon
        if coords[0] != coords[-1]:
            coords.append(coords[0])

        # Determine category and color
        name = tags.get("name", "")
        levels = tags.get("building:levels", "")
        category = get_category_from_tags(tags)
        color = get_color(category)

        # Estimate height
        height = 15  # default
        if levels:
            try:
                height = float(levels) * 3.5
            except ValueError:
                pass

        feature = {
            "type": "Feature",
            "properties": {
                "id": way.get("id"),
                "name": name,
                "building": tags.get("building", "yes"),
                "levels": levels,
                "height": height,
                "color": color,
                "category": category,
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [coords],
            },
        }
        features.append(feature)

    return features


def polygon_centroid(coords):
    """Calculate centroid of a polygon (list of [lon, lat])."""
    # Exclude closing point
    pts = coords[:-1] if coords[0] == coords[-1] else coords
    n = len(pts)
    if n == 0:
        return (0, 0)
    cx = sum(p[0] for p in pts) / n
    cy = sum(p[1] for p in pts) / n
    return (cx, cy)


def make_rect_building(lon, lat, name, category, width_m=30, height_m=20):
    """Create a rectangular building polygon centered at (lon, lat)."""
    # Approximate degrees per meter at this latitude
    dlat = height_m / 111320.0
    dlon = width_m / (111320.0 * math.cos(math.radians(lat)))

    half_dlon = dlon / 2
    half_dlat = dlat / 2

    coords = [
        [lon - half_dlon, lat - half_dlat],
        [lon + half_dlon, lat - half_dlat],
        [lon + half_dlon, lat + half_dlat],
        [lon - half_dlon, lat + half_dlat],
        [lon - half_dlon, lat - half_dlat],
    ]

    color = get_color(category)
    return {
        "type": "Feature",
        "properties": {
            "id": f"gen_{name}",
            "name": name,
            "building": "yes",
            "levels": "",
            "height": 15,
            "color": color,
            "category": category,
        },
        "geometry": {
            "type": "Polygon",
            "coordinates": [coords],
        },
    }


def main():
    osm_path = "/tmp/osm_full.xml"
    output_buildings = "/Users/a136/vs/534534534/campus-nav/src/data/real_buildings.json"
    output_pois = "/Users/a136/vs/534534534/campus-nav/src/data/pois.ts"

    # 1. Parse OSM buildings in WGS84 (no coordinate conversion!)
    print("Parsing OSM buildings (WGS84, no conversion)...")
    osm_features = parse_osm_buildings(osm_path)
    print(f"  Found {len(osm_features)} OSM buildings")

    # 2. Convert POI coordinates from GCJ02 to WGS84
    print("Converting POI coordinates GCJ02 -> WGS84...")
    pois_wgs84 = []
    for poi in POIS:
        wgs_lng, wgs_lat = gcj02_to_wgs84(poi["lng"], poi["lat"])
        p = dict(poi)
        p["lng"] = round(wgs_lng, 6)
        p["lat"] = round(wgs_lat, 6)
        pois_wgs84.append(p)
        offset_m = haversine(poi["lng"], poi["lat"], wgs_lng, wgs_lat)
        print(f"  {poi['name']}: ({poi['lng']}, {poi['lat']}) -> ({p['lng']}, {p['lat']}) [offset: {offset_m:.1f}m]")

    # 3. Compute centroids for OSM buildings
    building_centroids = []
    for feat in osm_features:
        cx, cy = polygon_centroid(feat["geometry"]["coordinates"][0])
        building_centroids.append((cx, cy, feat))

    # 4. Match unnamed OSM buildings to nearest POI
    print("\nMatching unnamed buildings to POIs...")
    MATCH_RADIUS = 80  # meters
    for cx, cy, feat in building_centroids:
        if feat["properties"]["name"]:
            continue  # already named

        best_dist = float("inf")
        best_poi = None
        for poi in pois_wgs84:
            d = haversine(cx, cy, poi["lng"], poi["lat"])
            if d < best_dist:
                best_dist = d
                best_poi = poi

        if best_poi and best_dist < MATCH_RADIUS:
            cat = TYPE_TO_CATEGORY.get(best_poi["type"], "其他")
            feat["properties"]["name"] = best_poi["name"]
            feat["properties"]["category"] = cat
            feat["properties"]["color"] = get_color(cat)
            print(f"  Matched building {feat['properties']['id']} -> {best_poi['name']} ({best_dist:.1f}m)")

    # 5. Find POIs without nearby OSM buildings -> generate rectangular buildings
    print("\nChecking POIs for missing buildings...")
    NEARBY_RADIUS = 100  # meters
    generated = []
    # Skip area-type POIs that don't need buildings
    skip_types = {"地标", "教学区"}
    for poi in pois_wgs84:
        if poi["type"] in skip_types:
            continue

        has_nearby = False
        for cx, cy, feat in building_centroids:
            d = haversine(poi["lng"], poi["lat"], cx, cy)
            if d < NEARBY_RADIUS:
                has_nearby = True
                break

        if not has_nearby:
            cat = TYPE_TO_CATEGORY.get(poi["type"], "其他")
            # Choose size based on type
            if poi["type"] == "出入口":
                w, h = 10, 8
            elif poi["type"] in ("体育设施",):
                w, h = 60, 40
            else:
                w, h = 35, 25
            rect = make_rect_building(poi["lng"], poi["lat"], poi["name"], cat, w, h)
            generated.append(rect)
            print(f"  Generated building for: {poi['name']} at ({poi['lng']}, {poi['lat']})")

    # 6. Merge all features
    all_features = osm_features + generated
    geojson = {
        "type": "FeatureCollection",
        "features": all_features,
    }

    # 7. Save real_buildings.json
    print(f"\nWriting {len(all_features)} buildings to {output_buildings}")
    with open(output_buildings, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False)

    # 8. Generate pois.ts with WGS84 coordinates
    print(f"Writing POIs (WGS84) to {output_pois}")
    lines = []
    lines.append("export interface POI {")
    lines.append("  id: number")
    lines.append("  name: string")
    lines.append("  type: string")
    lines.append("  lng: number")
    lines.append("  lat: number")
    lines.append("  description: string")
    lines.append("}")
    lines.append("")
    lines.append("export const POI_TYPES = ['全部', '教学楼', '教学区', '图书馆', '食堂', '体育设施', '宿舍', '行政办公', '生活服务', '出入口', '地标'] as const")
    lines.append("")
    lines.append("export const TYPE_COLORS: Record<string, string> = {")
    lines.append("  '教学楼': '#3b82f6',")
    lines.append("  '教学区': '#6366f1',")
    lines.append("  '图书馆': '#f59e0b',")
    lines.append("  '食堂': '#ef4444',")
    lines.append("  '体育设施': '#22c55e',")
    lines.append("  '宿舍': '#8b5cf6',")
    lines.append("  '行政办公': '#06b6d4',")
    lines.append("  '生活服务': '#f97316',")
    lines.append("  '出入口': '#ec4899',")
    lines.append("  '地标': '#14b8a6',")
    lines.append("}")
    lines.append("")
    lines.append("export const TYPE_ICONS: Record<string, string> = {")
    lines.append("  '教学楼': '🏫',")
    lines.append("  '教学区': '🏛️',")
    lines.append("  '图书馆': '📚',")
    lines.append("  '食堂': '🍽️',")
    lines.append("  '体育设施': '⚽',")
    lines.append("  '宿舍': '🏠',")
    lines.append("  '行政办公': '🏢',")
    lines.append("  '生活服务': '📮',")
    lines.append("  '出入口': '🚪',")
    lines.append("  '地标': '📍',")
    lines.append("}")
    lines.append("")

    # Campus center (also convert to WGS84)
    center_lng, center_lat = gcj02_to_wgs84(126.563532, 45.816893)
    lines.append(f"export const campusCenter: [number, number] = [{round(center_lng, 6)}, {round(center_lat, 6)}]")
    lines.append("")
    lines.append("export const pois: POI[] = [")

    for poi in pois_wgs84:
        desc = poi["description"].replace("'", "\\'")
        lines.append(f"  {{ id: {poi['id']}, name: '{poi['name']}', type: '{poi['type']}', lng: {poi['lng']}, lat: {poi['lat']}, description: '{desc}' }},")

    lines.append("]")
    lines.append("")

    with open(output_pois, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print("\nDone!")
    print(f"  Buildings: {len(osm_features)} OSM + {len(generated)} generated = {len(all_features)} total")


if __name__ == "__main__":
    main()
