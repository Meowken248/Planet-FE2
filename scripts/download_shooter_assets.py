from __future__ import annotations

import json
import re
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "missions" / "shooter" / "nasa-assets"
MANIFEST = OUT_DIR / "manifest.json"
NASA_SEARCH = "https://images-api.nasa.gov/search"


ASSETS = [
    {
        "id": "ship",
        "query": "Orion spacecraft",
        "filename": "ship-orion.jpg",
        "role": "player ship sprite reference",
    },
    {
        "id": "enemy",
        "query": "satellite spacecraft",
        "filename": "enemy-satellite.jpg",
        "role": "enemy drone sprite reference",
    },
    {
        "id": "boss",
        "query": "space station spacecraft",
        "filename": "boss-station.jpg",
        "role": "boss ship sprite reference",
    },
    {
        "id": "hazard",
        "query": "asteroid",
        "filename": "hazard-asteroid.jpg",
        "role": "asteroid hazard reference",
    },
    {
        "id": "power",
        "query": "solar panel spacecraft",
        "filename": "power-solar.jpg",
        "role": "power up reference",
    },
    {
        "id": "weapon",
        "query": "rocket launch exhaust",
        "filename": "weapon-plasma.jpg",
        "role": "projectile glow reference",
    },
]


def fetch_json(url: str) -> dict:
    request = Request(url, headers={"User-Agent": "SolarVerse asset downloader"})
    with urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def download(url: str, target: Path) -> int:
    request = Request(url, headers={"User-Agent": "SolarVerse asset downloader"})
    with urlopen(request, timeout=60) as response:
        data = response.read()
    target.write_bytes(data)
    return len(data)


def nasa_item_for(query: str) -> dict:
    params = urlencode({"q": query, "media_type": "image", "page_size": 12})
    data = fetch_json(f"{NASA_SEARCH}?{params}")
    items = data.get("collection", {}).get("items", [])
    if not items:
        raise RuntimeError(f"No NASA Images result for {query!r}")
    return items[0]


def best_image_url(item: dict) -> str:
    links = item.get("links", [])
    candidates = [
        link.get("href")
        for link in links
        if link.get("render") == "image" and link.get("href")
    ]
    candidates = [url for url in candidates if re.search(r"~medium\.jpg$|~small\.jpg$|\.jpg$", url)]
    if not candidates:
        raise RuntimeError(f"No downloadable image link for {item.get('href')}")
    return candidates[0]


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "source": "NASA Images API",
        "sourceUrl": "https://images.nasa.gov/",
        "licenseNote": "NASA media is generally public domain, but each asset should still be checked before redistribution.",
        "assets": {},
    }

    for asset in ASSETS:
        item = nasa_item_for(asset["query"])
        image_url = best_image_url(item)
        target = OUT_DIR / asset["filename"]
        size = download(image_url, target)
        data = (item.get("data") or [{}])[0]
        manifest["assets"][asset["id"]] = {
            "path": f"/missions/shooter/nasa-assets/{asset['filename']}",
            "query": asset["query"],
            "role": asset["role"],
            "title": data.get("title", asset["query"]),
            "nasaId": data.get("nasa_id"),
            "sourceImage": image_url,
            "bytes": size,
        }
        print(f"downloaded {asset['id']}: {target.name} ({size} bytes)")

    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"wrote {MANIFEST}")


if __name__ == "__main__":
    main()
