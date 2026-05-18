#!/usr/bin/env python3
"""
HodlVille — Generar fondos de UI con FAL flux/schnell (barato, rápido)
Uso: python3 gen_backgrounds.py
"""
import requests, json, time, os, sys

FAL_KEY = "db8964c5-dba3-433a-a9be-760ad5bca943:a684d89b1a7a10e6ff9895f2d14ff812"
FAL_MODEL = "fal-ai/flux/schnell"  # Barato (~$0.001/img), rapidísimo
HEADERS = {"Authorization": f"Key {FAL_KEY}", "Content-Type": "application/json"}

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "backgrounds")
os.makedirs(OUT, exist_ok=True)

# ─── BACKGROUNDS A GENERAR ──────────────────────────────────
# Square 1024x1024 para usar como CSS background cover

BACKGROUNDS = {
    # Dashboard
    "dashboard_dark": "dark atmospheric background for a crypto trading dashboard, subtle blue and purple gradients, ethereal particles, dark navy tones, no text, no UI elements, abstract tech feel, 8-bit aesthetic influence",
    "dashboard_grid": "dark grid pattern background for trading UI, subtle glowing cyan grid lines on dark navy surface, techy, minimalist, no text, clean",
    
    # Cards
    "card_glass_bg": "abstract dark glass texture for UI cards, soft purple and indigo tones, blurred crypto symbols faintly visible, ethereal, premium feel, no text",
    "card_gold_bg": "dark background with subtle golden accents and sparkles, premium trading card feel, dark blue base, minimal, elegant, no text",
    
    # Battles
    "battle_arena": "dark fantasy battle arena background, stone floor with glowing runes, dark atmosphere, purple and blue ambient light, epic scale, no characters, no text",
    "battle_victory": "golden victory background, rays of golden light on dark surface, triumphant but subtle, particles, no text",
    "battle_defeat": "dark moody background with subtle red embers, atmospheric defeat scene, dark with crimson undertones, no text",
    
    # Housing
    "housing_tent": "peaceful meadow at dusk for a tent camp, dark ambient lighting, stars beginning to show, pixel art aesthetic, no text, no characters",
    "housing_cabin": "cozy forest clearing with wooden cabin atmosphere, dark warm lighting, trees silhouettes, pixel art feel, no text",
    "housing_mansion": "elegant mansion estate at twilight, dark luxurious atmosphere, subtle golden windows glow, pixel art style, no text",
    "housing_castle": "epic castle on a hill at night, dark fantasy atmosphere, subtle torch lights, pixel art aesthetic, majestic, no text",
    
    # World / Map
    "world_map_bg": "dark world map background, subtle continent outlines in glowing cyan, dark navy base, techy atlas feel, pixel art aesthetic, no text",
    "world_globe_bg": "dark space background with subtle star field, planet atmosphere glow, deep navy and purple, ethereal, no text",
    
    # General UI
    "aurora_dark": "dark aurora borealis abstract background, deep navy with subtle green and purple waves, ethereal, ambient, no text, pixel art influence",
    "cyber_dark": "dark cyberpunk abstract background, subtle neon grid lines, dark purple base, minimalist, no text, pixel art aesthetic",
    "particles_dark": "dark background with subtle floating particles and light rays, deep space feel, blue and purple tones, ethereal, no text",
}

def generate_image(prompt: str, name: str) -> bool:
    """Generate one image with flux/schnell"""
    out_path = os.path.join(OUT, f"{name}.png")
    if os.path.exists(out_path):
        print(f"  ⏭️ {name}.png (ya existe)")
        return True
    
    payload = {
        "prompt": prompt,
        "image_size": "square_hd",  # 1024x1024
        "num_inference_steps": 4,   # Schnell solo necesita 1-4 steps
    }
    
    try:
        r = requests.post(
            f"https://fal.run/{FAL_MODEL}",
            headers=HEADERS,
            json=payload,
            timeout=30,
        )
        r.raise_for_status()
        data = r.json()
        
        img_url = data["images"][0]["url"]
        img_data = requests.get(img_url, timeout=30).content
        
        with open(out_path, "wb") as f:
            f.write(img_data)
        
        size_kb = len(img_data) / 1024
        timing = data.get("timings", {}).get("inference", 0)
        print(f"  ✅ {name}.png ({size_kb:.0f}KB | {timing:.3f}s)")
        return True
    except Exception as e:
        print(f"  ❌ {name}.png — {e}")
        return False


if __name__ == "__main__":
    total = len(BACKGROUNDS)
    print(f"🎨 Generando {total} fondos UI con {FAL_MODEL}\n")
    
    start = time.time()
    ok = 0
    cost_est = 0
    
    for i, (name, prompt) in enumerate(BACKGROUNDS.items(), 1):
        print(f"[{i}/{total}] ({i*100//total}%) {name}")
        if generate_image(prompt, name):
            ok += 1
            cost_est += 0.001  # ~$0.001/img en schnell
        time.sleep(0.5)  # Rate limit friendly
    
    elapsed = time.time() - start
    print(f"\n{'='*55}")
    print(f"✅ {ok}/{total} generados en {elapsed:.0f}s")
    print(f"💰 Costo est: ${cost_est:.3f}")
    print(f"📁 {OUT}")
