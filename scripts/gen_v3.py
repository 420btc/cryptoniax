#!/usr/bin/env python3
"""
HodlVille — 2a tanda: Vaults + Efectos + Mascotas con FAL gpt-image-2
Usa ~$2.70 de crédito (~73 sprites a $0.037/img)
"""
import requests, json, time, os, sys

FAL_KEY = "db8964c5-dba3-433a-a9be-760ad5bca943:a684d89b1a7a10e6ff9895f2d14ff812"
FAL_MODEL = "fal-ai/gpt-image-2"
HEADERS = {"Authorization": f"Key {FAL_KEY}", "Content-Type": "application/json"}

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sprites", "v2")
os.makedirs(OUT, exist_ok=True)

SPRITES = {
    # ── Vaults (5 niveles) ──
    "vault_lv1": "pixel art small wooden treasure chest, dark fantasy style, isolated on transparent background, 8-bit rpg item, simple, no text",
    "vault_lv2": "pixel art iron treasure chest with lock, dark fantasy style, isolated on transparent background, 8-bit rpg item, no text",
    "vault_lv3": "pixel art golden treasure chest overflowing with coins, dark fantasy style, isolated on transparent background, 8-bit rpg item, no text",
    "vault_lv4": "pixel art crystal treasure chest with magical glow, dark fantasy style, isolated on transparent background, 8-bit rpg item, no text",
    "vault_lv5": "pixel art legendary diamond treasure chest with crown, epic glow, dark fantasy style, isolated on transparent background, 8-bit rpg item, no text",

    # ── Hold visual: Gold piles ──
    "gold_small": "pixel art small pile of gold coins, dark fantasy style, isolated on transparent background, 8-bit rpg item, no text",
    "gold_medium": "pixel art medium pile of gold coins and gems, dark fantasy style, isolated on transparent background, 8-bit rpg item, no text",
    "gold_large": "pixel art huge treasure hoard of gold coins jewels and crown, dark fantasy style, isolated on transparent background, 8-bit rpg item, no text",

    # ── Equipment: Boots + Gloves + Rings + Amulets ──
    "item_leather_boots": "pixel art leather boots, dark fantasy rpg style, isolated on transparent background, 8-bit item, no text",
    "item_iron_boots": "pixel art iron plated boots, dark fantasy rpg style, isolated on transparent background, 8-bit item, no text",
    "item_golden_boots": "pixel art golden boots with wings, dark fantasy rpg style, isolated on transparent background, 8-bit item, no text",
    "item_leather_gloves": "pixel art leather gloves, dark fantasy rpg style, isolated on transparent background, 8-bit item, no text",
    "item_iron_gloves": "pixel art iron gauntlets, dark fantasy rpg style, isolated on transparent background, 8-bit item, no text",
    "item_dragon_gloves": "pixel art dragon scale gauntlets with fire glow, dark fantasy rpg style, isolated on transparent background, 8-bit item, no text",
    "item_copper_ring": "pixel art copper ring, dark fantasy rpg style, isolated on transparent background, 8-bit item, no text",
    "item_silver_ring": "pixel art silver ring with blue gem, dark fantasy rpg style, isolated on transparent background, 8-bit item, no text",
    "item_golden_ring": "pixel art golden ring with ruby, dark fantasy rpg style, isolated on transparent background, 8-bit item, no text",
    "item_emerald_amulet": "pixel art emerald amulet necklace, dark fantasy rpg style, isolated on transparent background, 8-bit item, no text",
    "item_ruby_amulet": "pixel art ruby amulet with chain, dark fantasy rpg style, isolated on transparent background, 8-bit item, no text",
    "item_diamond_amulet": "pixel art diamond amulet with golden chain, dark fantasy rpg style, isolated on transparent background, 8-bit item, no text",

    # ── NPCs ──
    "npc_blacksmith": "pixel art blacksmith NPC character, dark fantasy style, isolated on transparent background, 8-bit rpg sprite, no text",
    "npc_merchant": "pixel art merchant NPC with gold coins, dark fantasy style, isolated on transparent background, 8-bit rpg sprite, no text",
    "npc_quest_giver": "pixel art wise old wizard NPC, dark fantasy style, isolated on transparent background, 8-bit rpg sprite, no text",
    "npc_banker": "pixel art dwarf banker NPC with ledger, dark fantasy style, isolated on transparent background, 8-bit rpg sprite, no text",

    # ── World Props ──
    "prop_tree_oak": "pixel art oak tree, dark fantasy style, isolated on transparent background, 8-bit rpg prop, no text",
    "prop_tree_pine": "pixel art pine tree, dark fantasy style, isolated on transparent background, 8-bit rpg prop, no text",
    "prop_rock": "pixel art boulder rock, dark fantasy style, isolated on transparent background, 8-bit rpg prop, no text",
    "prop_signpost": "pixel art wooden signpost, dark fantasy style, isolated on transparent background, 8-bit rpg prop, no text",
    "prop_portal": "pixel art magical purple portal, dark fantasy style, isolated on transparent background, 8-bit rpg prop, no text",
    "prop_lantern": "pixel art glowing lantern on post, dark fantasy style, isolated on transparent background, 8-bit rpg prop, no text",

    # ── Battle Effects ──
    "fx_explosion": "pixel art explosion effect sprite, orange and yellow, dark fantasy style, isolated on transparent background, 8-bit vfx, no text",
    "fx_heal": "pixel art green healing sparkle effect, dark fantasy style, isolated on transparent background, 8-bit vfx, no text",
    "fx_shield": "pixel art blue shield barrier effect, dark fantasy style, isolated on transparent background, 8-bit vfx, no text",
    "fx_lightning": "pixel art yellow lightning bolt effect, dark fantasy style, isolated on transparent background, 8-bit vfx, no text",
    "fx_poison": "pixel art green poison cloud effect, dark fantasy style, isolated on transparent background, 8-bit vfx, no text",
    "fx_fire": "pixel art fire flame effect sprite sheet, dark fantasy style, isolated on transparent background, 8-bit vfx, no text",

    # ── Pets / Companions ──
    "pet_cat": "pixel art cute black cat companion, dark fantasy style, isolated on transparent background, 8-bit rpg sprite, no text",
    "pet_dog": "pixel art loyal dog companion, dark fantasy style, isolated on transparent background, 8-bit rpg sprite, no text",
    "pet_dragon": "pixel art small baby dragon companion, dark fantasy style, isolated on transparent background, 8-bit rpg sprite, no text",
    "pet_phoenix": "pixel art small phoenix bird companion with fire, dark fantasy style, isolated on transparent background, 8-bit rpg sprite, no text",
    "pet_fox": "pixel art mystical fox companion with glowing tail, dark fantasy style, isolated on transparent background, 8-bit rpg sprite, no text",
    "pet_owl": "pixel art wise owl companion, dark fantasy style, isolated on transparent background, 8-bit rpg sprite, no text",

    # ── More Backgrounds ──
    "bg_battle_forest": "dark fantasy forest background for battle arena, pixel art style, atmospheric, ethereal, no characters, no text, dark moody tones",
    "bg_battle_cave": "dark fantasy cave background for battle arena, pixel art style, glowing crystals, atmospheric, no characters, no text",
    "bg_battle_volcano": "dark fantasy volcano background for battle arena, pixel art style, lava glow, atmospheric, no characters, no text",
    "bg_shop_interior": "dark fantasy shop interior background, pixel art style, shelves with potions and items, warm lighting, no characters, no text",
    "bg_tavern_interior": "dark fantasy tavern interior background, pixel art style, wooden tables, candles, warm cozy atmosphere, no characters, no text",
}

def generate_image(prompt: str, name: str) -> bool:
    out_path = os.path.join(OUT, f"{name}.png")
    if os.path.exists(out_path):
        print(f"  ⏭️ {name}.png")
        return True
    
    payload = {
        "prompt": prompt,
        "image_size": "square_hd",
        "num_inference_steps": 28,
    }
    
    try:
        r = requests.post(f"https://fal.run/{FAL_MODEL}", headers=HEADERS, json=payload, timeout=120)
        r.raise_for_status()
        data = r.json()
        img_url = data["images"][0]["url"]
        img_data = requests.get(img_url, timeout=60).content
        with open(out_path, "wb") as f:
            f.write(img_data)
        size_kb = len(img_data) / 1024
        timing = data.get("timings", {}).get("inference", 0)
        print(f"  ✅ {name}.png ({size_kb:.0f}KB | {timing:.1f}s)")
        return True
    except Exception as e:
        print(f"  ❌ {name}.png — {str(e)[:80]}")
        return False

if __name__ == "__main__":
    total = len(SPRITES)
    cost_per = 0.037
    print(f"🎨 Generando {total} sprites con {FAL_MODEL}")
    print(f"💰 Costo est: ${total * cost_per:.2f}\n")
    
    start = time.time()
    ok = 0
    cost = 0
    
    for i, (name, prompt) in enumerate(SPRITES.items(), 1):
        print(f"[{i}/{total}] ({i*100//total}%) {name}")
        if generate_image(prompt, name):
            ok += 1
            cost += cost_per
        time.sleep(0.3)
    
    elapsed = time.time() - start
    print(f"\n{'='*55}")
    print(f"✅ {ok}/{total} generados en {elapsed:.0f}s")
    print(f"💰 Costo: ${cost:.2f}")
    print(f"📁 {OUT}")
