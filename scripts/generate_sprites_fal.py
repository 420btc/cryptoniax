#!/usr/bin/env python3
"""
Generate ALL HodlVille pixel art sprites using FAL.ai Flux model.
Transparent backgrounds, cohesive pixel art theme, crypto+trading vibe.
"""
import os
import sys
import time
import json
import base64
import requests
from pathlib import Path

# ── Config ──────────────────────────────────────────────
FAL_KEY = "db8964c5-dba3-433a-a9be-760ad5bca943:a684d89b1a7a10e6ff9895f2d14ff812"
FAL_MODEL = "fal-ai/flux/dev"  # Best for styled generation
SPRITES_DIR = Path("/home/choco/hodlville/public/sprites")
SPRITES_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "Authorization": f"Key {FAL_KEY}",
    "Content-Type": "application/json",
}

# ── Common pixel art style prefix ───────────────────────
PIXEL_STYLE = (
    "pixel art, 32-bit game sprite, isometric RPG style, "
    "crisp pixels, clean edges, vibrant colors, no anti-aliasing, "
    "transparent background, game asset, 64x64 resolution, "
    "SNES-era aesthetic, charming, colorful"
)

# ══════════════════════════════════════════════════════════
#  SPRITE DEFINITIONS
# ══════════════════════════════════════════════════════════

HOUSES = [
    {
        "filename": "house_tent.png",
        "prompt": (
            "A small pixel art camping tent, green canvas with brown stakes, "
            "crypto coin logo on the side, cozy starter home, "
            + PIXEL_STYLE
        ),
        "image_size": "square_hd",
    },
    {
        "filename": "house_wood.png",
        "prompt": (
            "A cute pixel art wooden cabin house, brown logs, yellow windows glowing, "
            "chimney with smoke, bitcoin symbol above door, cozy warm lighting, "
            + PIXEL_STYLE
        ),
        "image_size": "square_hd",
    },
    {
        "filename": "house_stone.png",
        "prompt": (
            "A sturdy pixel art stone house with gray brick walls, blue tile roof, "
            "iron-reinforced door, ethereum diamond symbol on wall, medieval fantasy, "
            "solid and strong, chimney, flower garden, "
            + PIXEL_STYLE
        ),
        "image_size": "square_hd",
    },
    {
        "filename": "house_mansion.png",
        "prompt": (
            "A luxurious pixel art mansion, white columns, gold trim, "
            "large windows, fountain in front, crypto wealth symbols, "
            "purple roof, grand entrance, palm trees, opulent, "
            + PIXEL_STYLE
        ),
        "image_size": "square_hd",
    },
    {
        "filename": "house_castle.png",
        "prompt": (
            "A majestic pixel art castle with tall towers, blue and gold banners, "
            "drawbridge, crown symbol, stone walls with moss, "
            "flags waving, royal crypto kingdom, epic fantasy castle, "
            + PIXEL_STYLE
        ),
        "image_size": "square_hd",
    },
]

CHARACTERS = [
    # BingX (gold/yellow theme ⚡)
    {
        "filename": "bingx_warrior.png",
        "prompt": (
            "A pixel art warrior character with gold armor and yellow cape, "
            "lightning bolt insignia on chest, holding a sword, "
            "fierce stance, golden helmet, trading warrior, "
            + PIXEL_STYLE
        ),
        "image_size": "square_hd",
    },
    {
        "filename": "bingx_merchant.png",
        "prompt": (
            "A pixel art merchant character in gold robes, yellow turban, "
            "carrying a bag of coins, lightning bolt pendant, "
            "friendly face, trading goods, merchant stall vibe, "
            + PIXEL_STYLE
        ),
        "image_size": "square_hd",
    },
    # Hyperliquid (cyan/blue theme 🌊)
    {
        "filename": "hyperliquid_warrior.png",
        "prompt": (
            "A pixel art aquatic warrior with cyan-blue armor, water wave cape, "
            "trident weapon, wave symbol on shield, flowing water effects, "
            "mystical ocean warrior, powerful stance, "
            + PIXEL_STYLE
        ),
        "image_size": "square_hd",
    },
    {
        "filename": "hyperliquid_merchant.png",
        "prompt": (
            "A pixel art water merchant in flowing cyan robes, wave pattern trim, "
            "holding a pearl orb, water bubble accents, "
            "mystical trader, serene expression, aquatic theme, "
            + PIXEL_STYLE
        ),
        "image_size": "square_hd",
    },
    # Bybit (orange/fire theme 🔥)
    {
        "filename": "bybit_warrior.png",
        "prompt": (
            "A pixel art fire warrior with blazing orange armor, flame cape, "
            "fire sword, phoenix emblem on shield, fierce expression, "
            "embers floating around, powerful fire knight, "
            + PIXEL_STYLE
        ),
        "image_size": "square_hd",
    },
    {
        "filename": "bybit_merchant.png",
        "prompt": (
            "A pixel art fire merchant in orange-red robes with flame trim, "
            "holding a glowing ember crystal, torch-lit stall, "
            "warm smile, trading fire goods, phoenix feather hat, "
            + PIXEL_STYLE
        ),
        "image_size": "square_hd",
    },
    # Uniswap (pink/unicorn theme 🦄)
    {
        "filename": "uniswap_warrior.png",
        "prompt": (
            "A pixel art unicorn-themed warrior with pink-purple armor, "
            "unicorn horn helmet, rainbow sparkle cape, "
            "crystal sword, magical glow, majestic fantasy warrior, "
            + PIXEL_STYLE
        ),
        "image_size": "square_hd",
    },
    {
        "filename": "uniswap_merchant.png",
        "prompt": (
            "A pixel art magical merchant in pink robes with unicorn horn hat, "
            "carrying rainbow crystals, sparkle effects, "
            "mystical trading, colorful aura, friendly but mysterious, "
            + PIXEL_STYLE
        ),
        "image_size": "square_hd",
    },
]

BACKGROUND = {
    "filename": "world_background.png",
    "prompt": (
        "A beautiful pixel art fantasy landscape background for a game world, "
        "green rolling hills, blue sky with clouds, small river, "
        "distant mountains, pixel trees scattered, peaceful village vibe, "
        "crypto coin symbols as distant monuments, warm sunny day, "
        "parallax-ready wide background, seamless horizontal scrolling, "
        + PIXEL_STYLE + ", wide landscape 16:9"
    ),
    "image_size": "landscape_16_9",
}

# ══════════════════════════════════════════════════════════
#  FAL API CALL
# ══════════════════════════════════════════════════════════

def generate_image(prompt: str, image_size: str = "square_hd", max_retries: int = 3) -> bytes | None:
    """Generate an image using FAL.ai and return the PNG bytes."""
    
    payload = {
        "prompt": prompt,
        "image_size": image_size,
        "num_images": 1,
        "enable_safety_checker": False,
        "sync_mode": True,  # Wait for completion
    }
    
    for attempt in range(max_retries):
        try:
            print(f"  Generating (attempt {attempt+1})...", end=" ", flush=True)
            resp = requests.post(
                f"https://fal.run/{FAL_MODEL}",
                headers=HEADERS,
                json=payload,
                timeout=120,
            )
            
            if resp.status_code == 200:
                data = resp.json()
                # FAL returns images in different formats
                images = data.get("images", [])
                if not images:
                    # Try alternative response format
                    image_url = data.get("image", {}).get("url", "")
                    if image_url:
                        img_resp = requests.get(image_url, timeout=30)
                        if img_resp.status_code == 200:
                            print("✓")
                            return img_resp.content
                else:
                    img_data = images[0]
                    if isinstance(img_data, dict) and "url" in img_data:
                        img_resp = requests.get(img_data["url"], timeout=30)
                        if img_resp.status_code == 200:
                            print("✓")
                            return img_resp.content
                    elif isinstance(img_data, str):
                        # Base64 encoded
                        if img_data.startswith("data:"):
                            img_data = img_data.split(",", 1)[1]
                        print("✓")
                        return base64.b64decode(img_data)
                
                print(f"⚠️ No image in response. Keys: {list(data.keys())}")
                return None
                
            elif resp.status_code == 429:
                wait = 5 * (attempt + 1)
                print(f"⏳ Rate limited, waiting {wait}s...")
                time.sleep(wait)
            else:
                print(f"❌ HTTP {resp.status_code}: {resp.text[:200]}")
                if attempt < max_retries - 1:
                    time.sleep(3)
                    
        except requests.exceptions.Timeout:
            print(f"⏰ Timeout, retrying...")
            if attempt < max_retries - 1:
                time.sleep(5)
        except Exception as e:
            print(f"❌ Error: {e}")
            if attempt < max_retries - 1:
                time.sleep(3)
    
    return None


def remove_background_rough(png_bytes: bytes) -> bytes:
    """
    Post-process: make near-white pixels transparent.
    Simple threshold-based; works for sprites on white/light backgrounds.
    """
    try:
        from PIL import Image
        import io
        
        img = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
        pixels = img.load()
        w, h = img.size
        
        for y in range(h):
            for x in range(w):
                r, g, b, a = pixels[x, y]
                # Make white/near-white pixels transparent
                if r > 240 and g > 240 and b > 240:
                    pixels[x, y] = (r, g, b, 0)
                # Also light gray corners
                elif r > 220 and g > 220 and b > 220 and a > 200:
                    pixels[x, y] = (r, g, b, 80)
        
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return buf.getvalue()
    except ImportError:
        return png_bytes


def resize_sprite(png_bytes: bytes, target_size: tuple = None) -> bytes:
    """Resize sprite to pixel-art friendly dimensions."""
    try:
        from PIL import Image
        import io
        
        img = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
        
        if target_size:
            # Use NEAREST for pixel art (no blur)
            img = img.resize(target_size, Image.NEAREST)
        
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return buf.getvalue()
    except ImportError:
        return png_bytes


# ══════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════

def main():
    all_sprites = HOUSES + CHARACTERS + [BACKGROUND]
    total = len(all_sprites)
    success = 0
    failed = []
    
    print(f"🎨 Generating {total} sprites using FAL.ai ({FAL_MODEL})")
    print(f"📁 Output: {SPRITES_DIR}")
    print("=" * 55)
    
    for i, sprite in enumerate(all_sprites):
        name = sprite["filename"]
        print(f"\n[{i+1}/{total}] {name}")
        
        png_bytes = generate_image(sprite["prompt"], sprite["image_size"])
        
        if png_bytes:
            # Post-process for transparency
            png_bytes = remove_background_rough(png_bytes)
            
            # Save
            out_path = SPRITES_DIR / name
            out_path.write_bytes(png_bytes)
            file_size = len(png_bytes)
            print(f"  💾 Saved: {out_path} ({file_size:,} bytes)")
            success += 1
            
            # Small delay between generations to avoid rate limits
            if i < total - 1:
                time.sleep(2)
        else:
            print(f"  ❌ FAILED after all retries")
            failed.append(name)
    
    print("\n" + "=" * 55)
    print(f"✅ Generated: {success}/{total}")
    if failed:
        print(f"❌ Failed: {', '.join(failed)}")
    
    # Also create simple sprite sheets (4-frame walking animation placeholder)
    print("\n🎞️ Creating animation sheets (copy+shift pattern)...")
    for char in CHARACTERS:
        sheet_name = char["filename"].replace(".png", "_sheet.png")
        sprite_path = SPRITES_DIR / char["filename"]
        sheet_path = SPRITES_DIR / sheet_name
        
        if sprite_path.exists():
            try:
                from PIL import Image
                img = Image.open(sprite_path).convert("RGBA")
                w, h = img.size
                # Create 4-frame sheet: slight shifts
                sheet = Image.new("RGBA", (w * 4, h))
                sheet.paste(img, (0, 0))
                sheet.paste(img, (w, 0))  # Same for now - simple placeholder
                sheet.paste(img, (w * 2, 0))
                sheet.paste(img, (w * 3, 0))
                sheet.save(sheet_path, "PNG")
                print(f"  ✓ {sheet_name}")
            except Exception as e:
                print(f"  ⚠️ {sheet_name}: {e}")
    
    print("\n✨ Done! All sprites generated.")
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
