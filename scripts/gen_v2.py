#!/usr/bin/env python3
"""
HodlVille — Generación masiva de sprites con gpt-image-2 vía FAL.ai
Calidad: medium, 1024×1024, ~$0.037/img, fondo transparente
Presupuesto: ~$8.90 → ~240 sprites
"""
import io, os, sys, time, base64, re, requests, json
from pathlib import Path
from PIL import Image

# ── Config ──────────────────────────────────────────────
FAL_KEY = "db8964c5-dba3-433a-a9be-760ad5bca943:a684d89b1a7a10e6ff9895f2d14ff812"
FAL_MODEL = "fal-ai/gpt-image-2"
SPRITES_DIR = Path("/home/choco/hodlville/public/sprites/v2")
SPRITES_DIR.mkdir(parents=True, exist_ok=True)
HEADERS = {"Authorization": f"Key {FAL_KEY}", "Content-Type": "application/json"}
COST_ESTIMATE = 0.037  # per image

# ── Prompt helpers ──────────────────────────────────────

EXCHANGE_STYLES = {
    "bingx": "golden yellow armor, lightning bolt ⚡ motifs, radiant sun theme, #F0B90B gold",
    "hyperliquid": "cyan-blue aquatic armor, ocean wave 🌊 patterns, flowing water effects, #00E6FF cyan",
    "bybit": "blazing orange-red armor, phoenix fire 🔥 theme, ember particles, #F7A600 orange",
    "uniswap": "magical pink-purple armor, unicorn 🦄 horn motifs, rainbow sparkle effects, #FF007A pink",
}

LEVEL_ITEMS = {
    1: "basic leather and cloth, wooden sword, no helmet",
    2: "iron chainmail, iron sword, basic helmet",
    3: "steel plate armor, steel broadsword, horned helmet, simple cape",
    4: "enchanted mithril armor, flaming sword, winged helmet, flowing cape with runes",
    5: "legendary radiant armor with glowing runes, massive crystal greatsword, crown-helmet, royal cape with particle effects",
}

def hero_prompt(exchange: str, char_type: str, level: int, item: str = "") -> str:
    """Build detailed prompt for a hero sprite."""
    style = EXCHANGE_STYLES.get(exchange, EXCHANGE_STYLES["bingx"])
    gear = LEVEL_ITEMS.get(level, LEVEL_ITEMS[1])
    role = "warrior knight" if char_type == "warrior" else "merchant trader"
    
    base = (
        f"A stunning modern pixel art {role} character sprite, level {level}. "
        f"{style}. Wearing {gear}. "
        f"Isometric RPG battle stance, 32-bit SNES aesthetic, crisp hard pixel edges, "
        f"no anti-aliasing, vibrant saturated colors. "
    )
    
    if char_type == "warrior":
        base += "Holding weapon in attack position. Fierce battle expression. "
    else:
        base += "Carrying a bag of golden coins. Confident trading pose. "
    
    if item:
        base += f"Special item: {item}. "
    
    base += (
        f"Crypto-themed: Bitcoin ₿ and blockchain motifs on armor. "
        f"Clean white background. Professional game asset, 1024x1024."
    )
    return base

def house_prompt(style: str, level: int) -> str:
    """Build detailed prompt for a house sprite."""
    styles = {
        "tent": ("a small camping tent", "green canvas, wooden stakes, cozy fire pit, starter home, crypto coin flags"),
        "wood_house": ("a rustic wooden cabin", "brown logs, glowing yellow windows, stone chimney with smoke, Bitcoin symbol above door, garden"),
        "stone_house": ("a sturdy medieval stone house", "gray brick walls, blue tile roof, iron-reinforced oak door, Ethereum diamond symbol, flower garden"),
        "mansion": ("a luxurious crypto mansion", "white marble columns, gold trim, large arched windows, fountain with BTC statue, palm trees, purple roof"),
        "castle": ("a majestic fantasy castle", "tall stone towers with blue and gold banners, drawbridge, crown symbol, moss-covered walls, flags, royal crypto kingdom"),
    }
    
    desc, details = styles.get(style, styles["tent"])
    level_add = [
        "", "slightly upgraded, ", "improved, larger, ", "grand, expanded, ", "legendary, massive, epic scale, ",
    ]
    
    return (
        f"A beautiful pixel art game asset: {level_add[level-1]}{desc}, level {level}. "
        f"{details}. "
        f"Isometric view, 32-bit SNES aesthetic, crisp pixel edges, vibrant colors, "
        f"crypto trading theme. Clean white background. Professional quality."
    )

def item_prompt(item_name: str, item_type: str) -> str:
    """Build prompt for equipment items."""
    return (
        f"A pixel art game item sprite: {item_name}. {item_type}. "
        f"Isometric view, 32-bit SNES style, crisp pixel edges, vibrant colors, "
        f"crypto-themed with blockchain motifs. Clean white background. Game asset."
    )

def bg_prompt(variant: str) -> str:
    """Build prompt for world backgrounds."""
    return (
        f"A beautiful wide pixel art fantasy landscape: {variant}. "
        f"Green rolling hills, blue sky with clouds, rivers, mountains, pixel trees, "
        f"crypto-themed monuments (giant Bitcoin, Ethereum crystals), peaceful village. "
        f"32-bit SNES aesthetic, crisp pixel edges, vibrant colors. "
        f"Wide 16:9 landscape, professional game background."
    )

# ── FAL API ─────────────────────────────────────────────

def generate(prompt: str, max_retries: int = 2) -> bytes | None:
    """Generate image via FAL gpt-image-2, return PNG bytes with transparent bg."""
    for attempt in range(max_retries + 1):
        try:
            resp = requests.post(
                f"https://fal.run/{FAL_MODEL}",
                headers=HEADERS,
                json={
                    "prompt": prompt,
                    "image_size": {"width": 1024, "height": 1024},
                    "num_images": 1,
                    "sync_mode": True,
                    "quality": "medium",
                },
                timeout=180,
            )
            
            if resp.status_code != 200:
                if attempt < max_retries:
                    time.sleep(5)
                    continue
                return None
            
            data = resp.json()
            img_info = data["images"][0]
            url = img_info.get("url", "")
            
            if url.startswith("data:"):
                b64 = re.sub(r'^data:image/\w+;base64,', '', url)
                raw = base64.b64decode(b64)
            else:
                raw = requests.get(url, timeout=30).content
            
            # Convert to RGBA and remove white background
            img = Image.open(io.BytesIO(raw)).convert("RGBA")
            pixels = img.load()
            w, h = img.size
            for y in range(h):
                for x in range(w):
                    r, g, b, a = pixels[x, y]
                    if r > 235 and g > 235 and b > 235:
                        pixels[x, y] = (r, g, b, 0)
                    # Also remove near-white corners
                    elif r > 225 and g > 225 and b > 225 and a > 200 and (x < 20 or x > w-20 or y < 20 or y > h-20):
                        pixels[x, y] = (r, g, b, 0)
            
            buf = io.BytesIO()
            img.save(buf, format="PNG", optimize=True)
            return buf.getvalue()
            
        except Exception as e:
            if attempt < max_retries:
                time.sleep(5)
    
    return None

# ── Main ────────────────────────────────────────────────

def main():
    tasks = []
    
    # ── HEROES: 4 exchanges × 2 types × 5 levels = 40 ──
    for ex in ["bingx", "hyperliquid", "bybit", "uniswap"]:
        for ct in ["warrior", "merchant"]:
            for lv in [1, 2, 3, 4, 5]:
                tasks.append({
                    "file": f"hero_{ex}_{ct}_lv{lv}.png",
                    "prompt": hero_prompt(ex, ct, lv),
                    "type": "hero",
                })
    
    # ── HOUSES: 5 styles × 5 levels = 25 ──
    for style in ["tent", "wood_house", "stone_house", "mansion", "castle"]:
        for lv in [1, 2, 3, 4, 5]:
            tasks.append({
                "file": f"house_{style}_lv{lv}.png",
                "prompt": house_prompt(style, lv),
                "type": "house",
            })
    
    # ── ITEMS: weapons, armor, accessories = 20 ──
    items = [
        ("wooden_sword", "weapon"), ("iron_sword", "weapon"), ("steel_broadsword", "weapon"),
        ("flaming_sword", "weapon"), ("crystal_greatsword", "weapon"),
        ("leather_armor", "armor"), ("chainmail", "armor"), ("steel_plate", "armor"),
        ("mithril_armor", "armor"), ("radiant_armor", "armor"),
        ("basic_helmet", "helmet"), ("horned_helmet", "helmet"), ("winged_helmet", "helmet"),
        ("crown_helmet", "helmet"),
        ("wooden_shield", "shield"), ("iron_shield", "shield"), ("crystal_shield", "shield"),
        ("simple_cape", "cape"), ("rune_cape", "cape"), ("royal_cape", "cape"),
    ]
    for name, itype in items:
        tasks.append({
            "file": f"item_{name}.png",
            "prompt": item_prompt(name.replace("_", " ").title(), itype),
            "type": "item",
        })
    
    # ── BACKGROUNDS: 5 ──
    bgs = ["sunny day with BTC mountain", "sunset over ETH crystal valley", "night with crypto constellations",
           "stormy with lightning bolts", "peaceful spring with cherry blossoms"]
    for i, variant in enumerate(bgs):
        tasks.append({
            "file": f"bg_{i+1}.png",
            "prompt": bg_prompt(variant),
            "type": "background",
        })
    
    # ── BOSSES: 4 (one per exchange) ──
    bosses = [
        ("bingx", "The Lightning Emperor, giant golden golem with thunder powers"),
        ("hyperliquid", "The Ocean Leviathan, massive water dragon with tidal wave attacks"),
        ("bybit", "The Inferno Phoenix, blazing firebird with volcanic powers"),
        ("uniswap", "The Crystal Unicorn, majestic ethereal being with rainbow magic"),
    ]
    for ex, desc in bosses:
        tasks.append({
            "file": f"boss_{ex}.png",
            "prompt": (
                f"A massive epic pixel art boss sprite: {desc}. "
                f"Imposing scale, detailed pixel art, 32-bit SNES style, "
                f"crisp edges, vibrant colors, crypto-themed. "
                f"Clean white background. Professional game boss asset."
            ),
            "type": "boss",
        })
    
    total = len(tasks)
    est_cost = total * COST_ESTIMATE
    print(f"🎨 HodlVille — Generación Masiva de Sprites")
    print(f"   Modelo: {FAL_MODEL} (medium quality, 1024×1024)")
    print(f"   Total: {total} sprites")
    print(f"   Costo est: ${est_cost:.2f}")
    print(f"   Output: {SPRITES_DIR}")
    print("=" * 55)
    
    ok = 0
    failed = []
    start_time = time.time()
    
    for i, task in enumerate(tasks):
        name = task["file"]
        pct = (i / total) * 100
        elapsed = time.time() - start_time
        eta = (elapsed / (i + 1)) * (total - i) if i > 0 else 0
        
        print(f"[{i+1}/{total}] ({pct:.0f}%) {task['type']}: {name}", flush=True)
        
        png = generate(task["prompt"])
        if png:
            out = SPRITES_DIR / name
            out.write_bytes(png)
            ok += 1
            cost_so_far = ok * COST_ESTIMATE
            print(f"  ✅ {len(png):,}B | ${cost_so_far:.2f} gastado | ETA: {eta:.0f}s", flush=True)
        else:
            failed.append(name)
            print(f"  ❌ FALLÓ", flush=True)
        
        # Small delay between requests
        if i < total - 1:
            time.sleep(1)
    
    elapsed = time.time() - start_time
    print(f"\n{'='*55}")
    print(f"✅ {ok}/{total} generados en {elapsed:.0f}s")
    print(f"💰 Costo est: ${ok * COST_ESTIMATE:.2f}")
    if failed:
        print(f"❌ Fallos: {len(failed)}")
    print(f"📁 {SPRITES_DIR}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
