#!/usr/bin/env python3
"""HodlVille — Portada épica + fondos login + personajes extra con FAL flux/schnell"""
import requests, time, os

FAL_KEY = "db8964c5-dba3-433a-a9be-760ad5bca943:a684d89b1a7a10e6ff9895f2d14ff812"
HEADERS = {"Authorization": f"Key {FAL_KEY}", "Content-Type": "application/json"}
FAL_URL = "https://fal.run/fal-ai/flux/schnell"
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sprites", "v2")
os.makedirs(OUT, exist_ok=True)

SPRITES = {
    # ── PORTADA ÉPICA (landscape, 16:9) ──
    "cover_epic": (
        "EPIC cinematic wide banner for a crypto trading fantasy RPG game called HodlVille. "
        "In the center a majestic golden castle pixel art style, surrounded by 4 pixel art warrior characters "
        "representing different crypto exchanges (BingX blue, Hyperliquid cyan, Bybit orange, Uniswap pink). "
        "One warrior holds a flaming sword, another a crystal shield, another a golden crown. "
        "On the left side: Bitcoin and Ethereum logos as ancient runes. On the right: trading charts "
        "and candlesticks as magical artifacts. Dark fantasy sky with purple and blue aurora. "
        "Title text area at top center. Rich colors, detailed pixel art, "
        "epic atmosphere, game cover art quality, no text, no watermarks",
        "landscape_16_9"
    ),
    
    # ── Fondo Login/Hero ──
    "cover_login": (
        "Dark fantasy pixel art background for a crypto trading game login screen. "
        "A mysterious path leading toward a glowing golden city (HodlVille) floating in the distance. "
        "Surrounded by ethereal pixel art aurora in purple and blue tones. "
        "Ancient rune-like trading charts adorning stone pillars on both sides. "
        "Cozy yet epic atmosphere. No people visible in the foreground. "
        "Dark enough for white text overlay. No text, no watermarks",
        "landscape_16_9"
    ),

    # ── 3 guerreros extra (variantes) ──
    "hero_bingx_ranger_lv3": (
        "pixel art ranger/archer hero character in BingX style with blue cape and bow, "
        "dark fantasy style, isolated on transparent background, 8-bit rpg sprite, no text",
        "square_hd"
    ),
    "hero_hyperliquid_mage_lv3": (
        "pixel art mage/wizard hero character in Hyperliquid style with cyan robes and staff, "
        "magical glow, dark fantasy style, isolated on transparent background, 8-bit rpg sprite, no text",
        "square_hd"
    ),
    "hero_bybit_berserker_lv3": (
        "pixel art berserker hero character in Bybit style with orange armor and dual axes, "
        "dark fantasy style, isolated on transparent background, 8-bit rpg sprite, no text",
        "square_hd"
    ),
    "hero_uniswap_druid_lv3": (
        "pixel art druid/nature hero character in Uniswap style with pink/purple nature magic, "
        "vine staff, dark fantasy style, isolated on transparent background, 8-bit rpg sprite, no text",
        "square_hd"
    ),

    # ── 2 fondos world extra ──
    "bg_world_night": (
        "dark fantasy pixel art night sky with stars and nebula, atmospheric world map background, "
        "deep space feel, cosmic, floating islands silhouette, no text, no watermarks",
        "landscape_16_9"
    ),
    "bg_housing_interior": (
        "dark fantasy pixel art cozy interior of a medieval stone house, fireplace glow, "
        "wooden beams, warm candlelight, shelves with potions, inviting atmosphere, "
        "no characters, no text, no watermarks",
        "square_hd"
    ),
}

def gen(name, prompt, size):
    out_path = os.path.join(OUT, f"{name}.png")
    if os.path.exists(out_path):
        print(f"  ⏭️ {name}.png")
        return True
    try:
        r = requests.post(FAL_URL, headers=HEADERS,
            json={"prompt": prompt, "image_size": size}, timeout=90)
        r.raise_for_status()
        data = r.json()
        img = requests.get(data["images"][0]["url"], timeout=60).content
        with open(out_path, "wb") as f: f.write(img)
        print(f"  ✅ {name}.png ({len(img)/1024:.0f}KB)")
        return True
    except Exception as e:
        print(f"  ❌ {name}.png — {e}")
        return False

if __name__ == "__main__":
    total = len(SPRITES)
    print(f"🎨 Generando {total} assets épicos con flux/schnell\n")
    ok = 0
    for i, (name, (prompt, size)) in enumerate(SPRITES.items(), 1):
        print(f"[{i}/{total}] {name} ({size})")
        if gen(name, prompt, size): ok += 1
        time.sleep(0.3)
    print(f"\n✅ {ok}/{total} generados — Costo est: ${ok * 0.001:.3f}")
