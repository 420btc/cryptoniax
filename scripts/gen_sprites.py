#!/usr/bin/env python3
"""
Generate HodlVille pixel art sprites using FAL.ai Flux.
Downloads, resizes with NEAREST for crisp pixels, removes white bg.
"""
import io
import os
import sys
import time
import requests
from pathlib import Path
from PIL import Image

# ── Config ──────────────────────────────────────────────
FAL_KEY = "db8964c5-dba3-433a-a9be-760ad5bca943:a684d89b1a7a10e6ff9895f2d14ff812"
FAL_MODEL = "fal-ai/flux/dev"
SPRITES_DIR = Path("/home/choco/hodlville/public/sprites")
SPRITES_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "Authorization": f"Key {FAL_KEY}",
    "Content-Type": "application/json",
}

PIXEL_STYLE = (
    "pixel art, 32-bit game sprite, isometric RPG view, "
    "crisp hard edges, no anti-aliasing, vivid saturated colors, "
    "white background, game asset sprite sheet style, "
    "SNES 16-bit aesthetic, charming, clean"
)

# ══════════════════════════════════════════════════════════
SPRITES = [
    # ── HOUSES ──
    {"file": "house_tent.png", "size": (48, 40),
     "prompt": "A small green camping tent, brown wooden stakes, cozy, crypto bitcoin symbol on the side, simple starter home. " + PIXEL_STYLE},
    {"file": "house_wood.png", "size": (56, 44),
     "prompt": "A cute wooden log cabin, brown logs, yellow glowing window, chimney with smoke, bitcoin ₿ above door, cozy warm. " + PIXEL_STYLE},
    {"file": "house_stone.png", "size": (64, 50),
     "prompt": "A sturdy gray stone house, brick walls, blue tile roof, iron door, ethereum ♦ diamond symbol on wall, chimney, medieval. " + PIXEL_STYLE},
    {"file": "house_mansion.png", "size": (80, 58),
     "prompt": "A luxurious white mansion, gold trim columns, large windows, fountain, purple roof, palm trees, crypto wealth. " + PIXEL_STYLE},
    {"file": "house_castle.png", "size": (88, 64),
     "prompt": "A majestic fantasy castle, tall stone towers, blue gold banners, drawbridge, crown symbol, flags waving, royal kingdom. " + PIXEL_STYLE},

    # ── BINGX (gold/yellow ⚡) ──
    {"file": "bingx_warrior.png", "size": (32, 48),
     "prompt": "A pixel art warrior, gold armor, yellow cape, lightning bolt ⚡ on chest, holding sword, fierce stance, golden helmet. " + PIXEL_STYLE},
    {"file": "bingx_merchant.png", "size": (32, 48),
     "prompt": "A pixel art merchant, gold robes, yellow turban, carrying bag of coins, lightning pendant, friendly face, trading stall. " + PIXEL_STYLE},

    # ── HYPERLIQUID (cyan/blue 🌊) ──
    {"file": "hyperliquid_warrior.png", "size": (32, 48),
     "prompt": "A pixel art aquatic warrior, cyan-blue armor, water wave cape, trident weapon, wave symbol on shield, mystical ocean. " + PIXEL_STYLE},
    {"file": "hyperliquid_merchant.png", "size": (32, 48),
     "prompt": "A pixel art water merchant, flowing cyan robes, wave pattern trim, holding pearl orb, water bubble accents, serene. " + PIXEL_STYLE},

    # ── BYBIT (orange/fire 🔥) ──
    {"file": "bybit_warrior.png", "size": (32, 48),
     "prompt": "A pixel art fire warrior, blazing orange armor, flame cape, fire sword, phoenix emblem on shield, embers floating. " + PIXEL_STYLE},
    {"file": "bybit_merchant.png", "size": (32, 48),
     "prompt": "A pixel art fire merchant, orange-red robes with flame trim, holding glowing ember crystal, phoenix feather hat, warm smile. " + PIXEL_STYLE},

    # ── UNISWAP (pink/unicorn 🦄) ──
    {"file": "uniswap_warrior.png", "size": (32, 48),
     "prompt": "A pixel art unicorn knight, pink-purple armor, unicorn horn helmet, rainbow sparkle cape, crystal sword, magical glow. " + PIXEL_STYLE},
    {"file": "uniswap_merchant.png", "size": (32, 48),
     "prompt": "A pixel art magical merchant, pink robes, unicorn horn hat, carrying rainbow crystals, sparkle effects, mystical aura. " + PIXEL_STYLE},

    # ── BACKGROUND ──
    {"file": "world_background.png", "size": (640, 360),
     "prompt": "A beautiful pixel art fantasy landscape, green rolling hills, blue sky with clouds, river, distant mountains, pixel trees, peaceful village, crypto monuments, warm sunny day, seamless horizontal, wide 16:9. " + PIXEL_STYLE},
]

# ══════════════════════════════════════════════════════════

def generate_fal(prompt: str) -> bytes | None:
    """Generate image via FAL, return raw bytes."""
    payload = {
        "prompt": prompt,
        "image_size": "square_hd",
        "num_images": 1,
        "sync_mode": True,
    }
    
    for attempt in range(3):
        try:
            resp = requests.post(
                f"https://fal.run/{FAL_MODEL}",
                headers=HEADERS,
                json=payload,
                timeout=120,
            )
            if resp.status_code != 200:
                print(f"  HTTP {resp.status_code}: {resp.text[:100]}")
                time.sleep(3)
                continue
            
            data = resp.json()
            images = data.get("images", [])
            if not images:
                print("  No images in response")
                return None
            
            img_url = images[0].get("url", "")
            if not img_url:
                print("  No URL in image data")
                return None
            
            # Download the image
            img_resp = requests.get(img_url, timeout=30)
            if img_resp.status_code == 200:
                return img_resp.content
            else:
                print(f"  Download failed: {img_resp.status_code}")
                
        except Exception as e:
            print(f"  Error: {e}")
        
        if attempt < 2:
            time.sleep(3)
    
    return None


def process_sprite(raw_bytes: bytes, target_size: tuple, remove_bg: bool = True) -> bytes:
    """Resize with NEAREST (pixel art crisp) and remove white background."""
    img = Image.open(io.BytesIO(raw_bytes)).convert("RGBA")
    
    # Resize with NEAREST to preserve hard pixel edges
    img = img.resize(target_size, Image.NEAREST)
    
    if remove_bg:
        pixels = img.load()
        w, h = img.size
        
        # Sample corner colors to determine background
        corners = [
            pixels[0, 0], pixels[w-1, 0],
            pixels[0, h-1], pixels[w-1, h-1]
        ]
        # Average corner color
        avg_r = sum(c[0] for c in corners) // 4
        avg_g = sum(c[1] for c in corners) // 4
        avg_b = sum(c[2] for c in corners) // 4
        
        threshold = 40  # How close to bg color to make transparent
        
        for y in range(h):
            for x in range(w):
                r, g, b, a = pixels[x, y]
                # If pixel is close to background color, make transparent
                if (abs(r - avg_r) < threshold and 
                    abs(g - avg_g) < threshold and 
                    abs(b - avg_b) < threshold):
                    pixels[x, y] = (r, g, b, 0)
                # Also handle near-white
                elif r > 235 and g > 235 and b > 235:
                    pixels[x, y] = (r, g, b, 0)
    
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def make_sheet(sprite_path: Path) -> None:
    """Create a 4-frame placeholder animation sheet."""
    try:
        img = Image.open(sprite_path).convert("RGBA")
        w, h = img.size
        sheet = Image.new("RGBA", (w * 4, h))
        for i in range(4):
            sheet.paste(img, (w * i, 0))
        sheet_path = sprite_path.parent / sprite_path.name.replace(".png", "_sheet.png")
        sheet.save(sheet_path, "PNG", optimize=True)
        print(f"  📜 Sheet: {sheet_path.name}")
    except Exception as e:
        print(f"  ⚠️ Sheet failed: {e}")


# ══════════════════════════════════════════════════════════

def main():
    total = len(SPRITES)
    success = 0
    failed = []
    
    print(f"🎨 FAL.ai Pixel Art Generator")
    print(f"   Model: {FAL_MODEL}")
    print(f"   Sprites: {total}")
    print("=" * 50)
    
    for i, sprite in enumerate(SPRITES):
        name = sprite["file"]
        size = sprite["size"]
        print(f"\n[{i+1}/{total}] {name} ({size[0]}x{size[1]})")
        print(f"  Prompt: {sprite['prompt'][:80]}...")
        
        raw = generate_fal(sprite["prompt"])
        if raw is None:
            print(f"  ❌ Generation failed")
            failed.append(name)
            continue
        
        print(f"  📥 Downloaded: {len(raw):,} bytes")
        
        # Process: resize, remove background
        remove_bg = "background" not in name.lower()
        png_bytes = process_sprite(raw, sprite["size"], remove_bg=remove_bg)
        
        out_path = SPRITES_DIR / name
        out_path.write_bytes(png_bytes)
        print(f"  💾 Saved: {out_path.name} ({len(png_bytes):,} bytes)")
        success += 1
        
        # Make animation sheet for characters
        if "warrior" in name or "merchant" in name:
            make_sheet(out_path)
        
        # Avoid rate limits
        if i < total - 1:
            time.sleep(1.5)
    
    print("\n" + "=" * 50)
    print(f"✅ {success}/{total} generated")
    if failed:
        print(f"❌ Failed: {', '.join(failed)}")
    
    return 0 if not failed else 1

if __name__ == "__main__":
    sys.exit(main())
