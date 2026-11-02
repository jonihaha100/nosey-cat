import os
import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = "/tmp/kepo_9x16_scenes"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1080x1920 Vertical Format (9:16)
W, H = 1080, 1920

# Color Palette
C_BG = (10, 12, 16)                # Deep Cyber Void
C_CARD_BG = (18, 22, 28)           # Dark Slate Terminal
C_NEON_GREEN = (0, 255, 102)       # Electric Green (#00FF66)
C_SOLANA_PURPLE = (153, 69, 255)   # Solana Purple (#9945FF)
C_SOLANA_CYAN = (20, 241, 149)     # Solana Turquoise (#14F195)
C_GOLD = (255, 215, 0)             # Trophy Gold
C_WHITE = (255, 255, 255)
C_MUTED = (140, 155, 170)
C_ALERT_RED = (255, 59, 48)

# Fonts
FONT_RETRO_PATH = "/Users/syamhariabidin/.gemini/antigravity/brain/bd6e8a70-7d1b-41c9-8405-dc2638ed43db/scratch/PressStart2P.ttf"
FONT_MENLO_PATH = "/System/Library/Fonts/Menlo.ttc"
FONT_HELVETICA_PATH = "/System/Library/Fonts/Helvetica.ttc"

def get_font(path, size, index=0):
    try:
        return ImageFont.truetype(path, size, index=index)
    except:
        return ImageFont.load_default()

font_retro_xxl = get_font(FONT_RETRO_PATH, 42)
font_retro_xl  = get_font(FONT_RETRO_PATH, 34)
font_retro_lg  = get_font(FONT_RETRO_PATH, 26)
font_retro_md  = get_font(FONT_RETRO_PATH, 20)
font_retro_sm  = get_font(FONT_RETRO_PATH, 16)
font_retro_xs  = get_font(FONT_RETRO_PATH, 12)

font_sans_hero = get_font(FONT_HELVETICA_PATH, 46)
font_sans_lg   = get_font(FONT_HELVETICA_PATH, 36)
font_sans_md   = get_font(FONT_HELVETICA_PATH, 28)
font_sans_sm   = get_font(FONT_HELVETICA_PATH, 22)
font_mono_md   = get_font(FONT_MENLO_PATH, 24)
font_mono_sm   = get_font(FONT_MENLO_PATH, 18)

# Load Cat Mascot
cat_path = "/tmp/cat_isolated.png"
if not os.path.exists(cat_path):
    cat_path = "/Users/syamhariabidin/.gemini/antigravity/brain/bd6e8a70-7d1b-41c9-8405-dc2638ed43db/cat_isolated.png"

cat_img = Image.open(cat_path).convert("RGBA")

def create_base_canvas():
    """Creates a 1080x1920 base canvas with subtle cyber grid and CRT scanlines."""
    img = Image.new("RGBA", (W, H), C_BG)
    draw = ImageDraw.Draw(img)
    
    # 1. Perspective Grid at bottom
    horizon_y = 1200
    grid_color = (25, 32, 45, 120)
    for y in range(horizon_y, H, 36):
        draw.line([(0, y), (W, y)], fill=grid_color, width=1)
    
    # Radiating perspective lines
    center_x = W // 2
    for x in range(-W, W * 2, 70):
        draw.line([(center_x, horizon_y), (x, H)], fill=grid_color, width=1)
        
    # Floating ambient stars/pixels in the upper sky
    random.seed(42)
    for _ in range(75):
        sx = random.randint(30, W - 30)
        sy = random.randint(50, horizon_y - 50)
        size = random.choice([2, 3, 4])
        color = random.choice([
            (255, 255, 255, 200),
            (0, 255, 102, 180),
            (153, 69, 255, 180),
            (20, 241, 149, 180)
        ])
        draw.rectangle([sx, sy, sx + size, sy + size], fill=color)
        
    return img

def apply_scanlines(img):
    """Adds subtle retro CRT scanlines overlay."""
    scanline = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(scanline)
    for y in range(0, H, 6):
        sdraw.line([(0, y), (W, y)], fill=(0, 0, 0, 45), width=2)
    return Image.alpha_composite(img, scanline)

def draw_hud_header(draw, title, subtitle, tag="SOLANA 16-BIT ARCADE"):
    # Top Tag
    draw.rounded_rectangle([60, 60, W - 60, 110], radius=10, fill=(15, 18, 25, 230), outline=C_SOLANA_PURPLE, width=2)
    draw.text((80, 75), f"▶ {tag}", font=font_retro_xs, fill=C_SOLANA_CYAN)
    draw.text((W - 250, 75), "● LIVE RECORD", font=font_retro_xs, fill=C_ALERT_RED)
    
    # Main Header
    draw.text((60, 140), title, font=font_retro_xl, fill=C_WHITE)
    draw.text((60, 195), subtitle, font=font_mono_sm, fill=C_MUTED)
    draw.line([(60, 235), (W - 60, 235)], fill=C_NEON_GREEN, width=3)

# ====================================================================
# SCENE 1: THE WAKE-UP HOOK (FXPRO VELOCITY / ATTENTION)
# ====================================================================
def render_scene_1():
    img = create_base_canvas()
    draw = ImageDraw.Draw(img)
    
    draw_hud_header(draw, "TIRED OF RUG PULLS?", "THE MEME CASINO HAS FAILED YOU.", tag="FXPRO SPEED & CREDIBILITY")
    
    # Warning Alert Box
    draw.rounded_rectangle([60, 260, W - 60, 440], radius=16, fill=(35, 15, 15, 230), outline=C_ALERT_RED, width=3)
    draw.text((90, 290), "⚠️ CRITICAL MEME ALERT", font=font_retro_md, fill=C_ALERT_RED)
    draw.text((90, 335), "• 99.4% of meme coins dump in 15 minutes", font=font_sans_sm, fill=C_WHITE)
    draw.text((90, 375), "• Devs dump hidden wallets & delete Telegram", font=font_sans_sm, fill=(240, 200, 200))
    
    # Big Center Question
    draw.rounded_rectangle([60, 470, W - 60, 650], radius=16, fill=(18, 26, 38, 240), outline=C_NEON_GREEN, width=3)
    draw.text((90, 505), "WHAT IF A MEME COIN", font=font_retro_lg, fill=C_WHITE)
    draw.text((90, 550), "HAD REAL ECOSYSTEM VALUE?", font=font_retro_lg, fill=C_NEON_GREEN)
    draw.text((90, 600), "No fake promises. Just code, games & mathematical trust.", font=font_mono_sm, fill=C_MUTED)

    # Cat Mascot in Center with Neon Aura
    cat_w, cat_h = 600, 600
    cat_resized = cat_img.resize((cat_w, cat_h), Image.Resampling.LANCZOS)
    
    # Green glow behind cat
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([(W//2 - 250, 750), (W//2 + 250, 1250)], fill=(0, 255, 102, 60))
    glow = glow.filter(ImageFilter.GaussianBlur(35))
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)
    
    # Paste Cat
    img.paste(cat_resized, (W//2 - cat_w//2, 700), cat_resized)
    
    # Green Laser Eyes Overlay
    draw.ellipse([(W//2 - 62, 855), (W//2 - 42, 875)], fill=C_NEON_GREEN)
    draw.ellipse([(W//2 + 35, 855), (W//2 + 55, 875)], fill=C_NEON_GREEN)
    draw.line([(W//2 - 52, 865), (0, 800)], fill=C_NEON_GREEN, width=4)
    draw.line([(W//2 + 45, 865), (W, 800)], fill=C_NEON_GREEN, width=4)

    # Bottom Banner
    draw.rounded_rectangle([60, 1400, W - 60, 1800], radius=20, fill=C_CARD_BG, outline=C_SOLANA_PURPLE, width=3)
    draw.text((90, 1440), "INTRODUCING NOSEY CAT ($KEPO)", font=font_retro_md, fill=C_GOLD)
    draw.text((90, 1495), "The 16-Bit Retro Arcade Cat on Solana.", font=font_sans_md, fill=C_WHITE)
    draw.text((90, 1555), "Curiosity didn't kill this cat—", font=font_sans_sm, fill=C_MUTED)
    draw.text((90, 1595), "It built an unstoppable army of Diamond Paws.", font=font_sans_sm, fill=C_NEON_GREEN)
    
    # Bottom Pill
    draw.rounded_rectangle([(W//2 - 220), 1680, (W//2 + 220), 1750], radius=35, fill=C_NEON_GREEN)
    draw.text(((W//2 - 165), 1702), "SWIPE FOR PROOF ▶", font=font_retro_sm, fill=(0, 0, 0))
    
    return apply_scanlines(img)

# ====================================================================
# SCENE 2: THE WALBI TECH LAB (LIVE ECOSYSTEM PROOF)
# ====================================================================
def render_scene_2():
    img = create_base_canvas()
    draw = ImageDraw.Draw(img)
    
    draw_hud_header(draw, "THE WALBI MODEL", "PROOF OF WORK: A LIVING ECOSYSTEM", tag="UTILITY & AI INTEGRATION")
    
    # Card 1: Live Arcade Game
    draw.rounded_rectangle([60, 270, W - 60, 560], radius=16, fill=C_CARD_BG, outline=C_NEON_GREEN, width=2)
    draw.rectangle([60, 270, 75, 560], fill=C_NEON_GREEN)
    draw.text((95, 300), "🕹️ 01. LIVE RETRO ARCADE ENGINE", font=font_retro_md, fill=C_NEON_GREEN)
    draw.text((95, 345), "\"Boop the Snoot\" Clicker Game is 100% playable right now at:", font=font_sans_sm, fill=C_WHITE)
    draw.text((95, 385), "https://nosey-cat.vercel.app", font=font_mono_md, fill=C_SOLANA_CYAN)
    draw.text((95, 435), "• Real-time score multipliers & SFX soundboard", font=font_sans_sm, fill=C_MUTED)
    draw.text((95, 475), "• Global leaderboard rewarding top degen clickers", font=font_sans_sm, fill=C_MUTED)
    draw.rounded_rectangle([W - 250, 490, W - 80, 535], radius=8, fill=(0, 255, 102, 40), outline=C_NEON_GREEN)
    draw.text((W - 230, 502), "PLAYABLE NOW", font=font_retro_xs, fill=C_NEON_GREEN)

    # Card 2: 24/7 Autonomous AI Agent
    draw.rounded_rectangle([60, 590, W - 60, 880], radius=16, fill=C_CARD_BG, outline=C_SOLANA_PURPLE, width=2)
    draw.rectangle([60, 590, 75, 880], fill=C_SOLANA_PURPLE)
    draw.text((95, 620), "🤖 02. AUTONOMOUS AI AGENT (@TheNoseyCat)", font=font_retro_md, fill=C_SOLANA_PURPLE)
    draw.text((95, 665), "Integrated with Hermes / LLM Agent Core:", font=font_sans_sm, fill=C_WHITE)
    draw.text((95, 705), "• 24/7 Solana market sentiment & order book monitor", font=font_sans_sm, fill=C_MUTED)
    draw.text((95, 745), "• Instant community banter & multi-agent Telegram replies", font=font_sans_sm, fill=C_MUTED)
    draw.text((95, 785), "• Never sleeps, never dumps, pure automated alpha", font=font_sans_sm, fill=C_SOLANA_CYAN)
    draw.rounded_rectangle([W - 250, 810, W - 80, 855], radius=8, fill=(153, 69, 255, 40), outline=C_SOLANA_PURPLE)
    draw.text((W - 225, 822), "ACTIVE 24/7", font=font_retro_xs, fill=C_SOLANA_PURPLE)

    # Card 3: Built-In Meme Generator Studio
    draw.rounded_rectangle([60, 910, W - 60, 1200], radius=16, fill=C_CARD_BG, outline=C_GOLD, width=2)
    draw.rectangle([60, 910, 75, 1200], fill=C_GOLD)
    draw.text((95, 940), "🎨 03. ON-CHAIN MEME FACTORY", font=font_retro_md, fill=C_GOLD)
    draw.text((95, 985), "Built-in 16-bit retro graphics studio:", font=font_sans_sm, fill=C_WHITE)
    draw.text((95, 1025), "• Generates custom viral memes in 1 click", font=font_sans_sm, fill=C_MUTED)
    draw.text((95, 1065), "• Custom accessories: Thug life shades, degen crown", font=font_sans_sm, fill=C_MUTED)
    draw.text((95, 1105), "• High-res downloads for viral raids on X & Telegram", font=font_sans_sm, fill=C_GOLD)
    draw.rounded_rectangle([W - 250, 1130, W - 80, 1175], radius=8, fill=(255, 215, 0, 40), outline=C_GOLD)
    draw.text((W - 225, 1142), "LIVE ON WEB", font=font_retro_xs, fill=C_GOLD)

    # Bottom Cat Mascot Hacking CRT
    cat_w, cat_h = 480, 480
    cat_resized = cat_img.resize((cat_w, cat_h), Image.Resampling.LANCZOS)
    img.paste(cat_resized, (W//2 - cat_w//2, 1240), cat_resized)
    
    # CRT Terminal Outline below Cat
    draw.rounded_rectangle([100, 1650, W - 100, 1850], radius=12, fill=(10, 15, 20), outline=C_SOLANA_CYAN, width=2)
    draw.text((130, 1680), "STATUS: ARCHITECTURE DEPLOYED & TESTED", font=font_retro_xs, fill=C_SOLANA_CYAN)
    draw.text((130, 1720), "PROMPT: \"Dev is cooking bulletproof infrastructure\"", font=font_mono_sm, fill=C_WHITE)
    draw.text((130, 1770), ">>> NO DRAMA. JUST EXPONENTIAL EXECUTION. <<<", font=font_retro_xs, fill=C_NEON_GREEN)
    
    return apply_scanlines(img)

# ====================================================================
# SCENE 3: INSTITUTIONAL TOKENOMICS & SECURITY (FXPRO SPEED/TRUST)
# ====================================================================
def render_scene_3():
    img = create_base_canvas()
    draw = ImageDraw.Draw(img)
    
    draw_hud_header(draw, "MATHEMATICAL TRUST", "NO RUG. NO HIDDEN TAX. PURE SECURITY.", tag="UNRUGGABLE SMART CONTRACT")
    
    # 3 Giant Power Badges
    badges = [
        ("💎 1,000,000,000 (1B)", "FIXED SUPPLY CAP", "Zero mint function. No developer inflation.", C_NEON_GREEN),
        ("🚫 0% BUY & 0% SELL TAX", "ZERO TRANSACTION TAX", "What you buy is 100% what you keep.", C_SOLANA_CYAN),
        ("🔥 100% LP BURNED", "LIQUIDITY BURNED FOREVER", "Permanent lock into the Solana furnace.", C_GOLD)
    ]
    
    y_start = 280
    for idx, (title, sub, desc, col) in enumerate(badges):
        draw.rounded_rectangle([60, y_start, W - 60, y_start + 230], radius=18, fill=C_CARD_BG, outline=col, width=3)
        # Glow edge
        draw.rectangle([60, y_start, 80, y_start + 230], fill=col)
        draw.text((105, y_start + 30), title, font=font_retro_lg, fill=col)
        draw.text((105, y_start + 90), sub, font=font_sans_lg, fill=C_WHITE)
        draw.text((105, y_start + 150), desc, font=font_mono_md, fill=C_MUTED)
        y_start += 270

    # Contract Security Guarantee Box
    draw.rounded_rectangle([60, 1140, W - 60, 1400], radius=18, fill=(15, 25, 20, 240), outline=C_NEON_GREEN, width=2)
    draw.text((95, 1175), "🛡️ INSTITUTIONAL SOLANA SAFETY", font=font_retro_md, fill=C_NEON_GREEN)
    draw.text((95, 1225), "✓ Mint Authority: REVOKED (Cannot mint new tokens)", font=font_sans_sm, fill=C_WHITE)
    draw.text((95, 1265), "✓ Freeze Authority: REVOKED (Cannot freeze wallets)", font=font_sans_sm, fill=C_WHITE)
    draw.text((95, 1305), "✓ Top Wallets: Distributed across Diamond Paws", font=font_sans_sm, fill=C_WHITE)
    draw.text((95, 1345), "✓ Contract: 100% Verified on Solscan & DexScreener", font=font_sans_sm, fill=C_GOLD)

    # Cat with Diamond Crown
    cat_w, cat_h = 440, 440
    cat_resized = cat_img.resize((cat_w, cat_h), Image.Resampling.LANCZOS)
    img.paste(cat_resized, (W//2 - cat_w//2, 1430), cat_resized)
    
    # 16-bit Gold Degen Crown above cat
    crown_x, crown_y = W//2 - 60, 1400
    draw.polygon([
        (crown_x, crown_y + 40),
        (crown_x + 120, crown_y + 40),
        (crown_x + 120, crown_y),
        (crown_x + 90, crown_y + 20),
        (crown_x + 60, crown_y),
        (crown_x + 30, crown_y + 20),
        (crown_x, crown_y)
    ], fill=C_GOLD, outline=C_WHITE)

    return apply_scanlines(img)

# ====================================================================
# SCENE 4: MILESTONES & GROWTH VELOCITY (THE ROADMAP)
# ====================================================================
def render_scene_4():
    img = create_base_canvas()
    draw = ImageDraw.Draw(img)
    
    draw_hud_header(draw, "MILESTONE VELOCITY", "MEASURABLE TRIGGERS FOR HOLDERS & INVESTORS", tag="STRATEGIC EXPANSION")
    
    # Roadmap Stages
    stages = [
        ("STAGE 1: 50 DIAMOND PAWS", "ACTIVE NOW", "• Curating elite core community in Telegram\n• Live \"Boop\" Arcade contest & leaderboard\n• Community meme propagation on X", C_NEON_GREEN, True),
        ("STAGE 2: LIQUIDITY IGNITION", "UPCOMING", "• Stealth Fair Launch on Raydium\n• 100% LP Burn transaction verified on-chain\n• DexScreener & DexTools trending campaigns", C_GOLD, False),
        ("STAGE 3: GLOBAL ARCADE & AI", "LOCKED TARGET", "• Tokenized arcade rewards for highest clickers\n• Multi-agent autonomous X & Telegram bot net\n• Tier 1 CEX listings & viral brand crossovers", C_SOLANA_PURPLE, False)
    ]
    
    sy = 270
    for title, status, details, col, active in stages:
        draw.rounded_rectangle([60, sy, W - 60, sy + 300], radius=16, fill=C_CARD_BG, outline=col, width=3 if active else 1)
        draw.rectangle([60, sy, 80, sy + 300], fill=col)
        
        # Badge
        draw.rounded_rectangle([W - 260, sy + 25, W - 80, sy + 65], radius=6, fill=col if active else (40, 45, 55))
        draw.text((W - 240, sy + 35), status, font=font_retro_xs, fill=(0, 0, 0) if active else C_MUTED)
        
        draw.text((105, sy + 30), title, font=font_retro_md, fill=col)
        
        # Split details
        dy = sy + 95
        for line in details.split("\n"):
            draw.text((105, dy), line, font=font_sans_sm, fill=C_WHITE if active else C_MUTED)
            dy += 45
            
        sy += 330

    # Rocket Animation Banner at Bottom
    draw.rounded_rectangle([60, 1310, W - 60, 1850], radius=20, fill=(15, 20, 30), outline=C_NEON_GREEN, width=2)
    draw.text((95, 1345), "🚀 PARABOLIC CANDLESTICK IGNITION", font=font_retro_sm, fill=C_NEON_GREEN)
    
    # Draw Green Rocket Candles
    for rx, ry, rh in [(160, 1550, 220), (380, 1480, 290), (600, 1420, 350), (820, 1360, 410)]:
        draw.line([(rx + 30, ry - 30), (rx + 30, ry + rh + 30)], fill=(0, 255, 102, 100), width=4)
        draw.rectangle([rx, ry, rx + 60, ry + rh], fill=C_NEON_GREEN, outline=C_WHITE, width=2)
        # Rocket Flames
        draw.polygon([(rx + 10, ry + rh), (rx + 50, ry + rh), (rx + 30, ry + rh + 45)], fill=C_GOLD)
        
    # Cat Mascot with Aviator Shades
    cat_w, cat_h = 360, 360
    cat_resized = cat_img.resize((cat_w, cat_h), Image.Resampling.LANCZOS)
    img.paste(cat_resized, (W//2 - cat_w//2, 1520), cat_resized)
    
    # Aviator shades
    draw.rectangle([W//2 - 55, 1600, W//2 - 10, 1625], fill=(0, 0, 0), outline=C_GOLD, width=2)
    draw.rectangle([W//2 + 10, 1600, W//2 + 55, 1625], fill=(0, 0, 0), outline=C_GOLD, width=2)
    draw.line([W//2 - 10, 1612, W//2 + 10, 1612], fill=C_GOLD, width=2)

    return apply_scanlines(img)

# ====================================================================
# SCENE 5: THE ULTIMATE BOOP (CALL TO ACTION)
# ====================================================================
def render_scene_5():
    img = create_base_canvas()
    draw = ImageDraw.Draw(img)
    
    draw_hud_header(draw, "DON'T FADE THE SNOOT", "STAGE 1 GENESIS IS FILLING UP FAST", tag="JOIN 50 DIAMOND PAWS")
    
    # Huge Giant Close-Up Cat Mascot (Gatekid3 Boop Style)
    cat_w, cat_h = 750, 750
    cat_resized = cat_img.resize((cat_w, cat_h), Image.Resampling.LANCZOS)
    
    # Concentric Shockwave Rings around the nose
    nose_center = (W//2, 650)
    for r in range(40, 360, 50):
        alpha = max(20, 255 - r)
        draw.ellipse([
            (nose_center[0] - r, nose_center[1] - r),
            (nose_center[0] + r, nose_center[1] + r)
        ], outline=(0, 255, 102, alpha), width=3)
        
    img.paste(cat_resized, (W//2 - cat_w//2, 280), cat_resized)
    
    # Pink Boop Target Reticle
    draw.ellipse([(W//2 - 25, 480), (W//2 + 25, 530)], fill=(255, 105, 180, 200), outline=C_WHITE, width=2)
    draw.text((W//2 - 60, 440), "* BOOP! *", font=font_retro_xs, fill=C_NEON_GREEN)

    # 3 High-Conversion Portal Links
    links = [
        ("🌐 OFFICIAL RETRO ARCADE WEBSITE", "https://nosey-cat.vercel.app", C_SOLANA_CYAN),
        ("💬 TELEGRAM VIP COMMUNITY", "t.me/TheNoseyCat", C_NEON_GREEN),
        ("🐦 OFFICIAL X (TWITTER) DISPATCH", "@TheNoseyCat", C_SOLANA_PURPLE)
    ]
    
    ly = 1050
    for title, link, col in links:
        draw.rounded_rectangle([60, ly, W - 60, ly + 140], radius=16, fill=C_CARD_BG, outline=col, width=2)
        draw.rectangle([60, ly, 75, ly + 140], fill=col)
        draw.text((95, ly + 25), title, font=font_retro_sm, fill=col)
        draw.text((95, ly + 75), link, font=font_sans_lg, fill=C_WHITE)
        draw.text((W - 140, ly + 50), "GO ▶", font=font_retro_sm, fill=col)
        ly += 165

    # Big Final Neon Action Button
    draw.rounded_rectangle([60, 1580, W - 60, 1720], radius=24, fill=C_NEON_GREEN)
    draw.text((120, 1630), "🕹️ BOOP TO CLAIM DIAMOND PAWS", font=font_retro_md, fill=(0, 0, 0))
    
    draw.text((W//2 - 260, 1760), "100% COMMUNITY OWNED • 0% TAX • SOLANA", font=font_mono_sm, fill=C_MUTED)
    draw.text((W//2 - 160, 1800), "IMMUTABLE CODE // ZERO DRAMA", font=font_retro_xs, fill=C_GOLD)

    return apply_scanlines(img)

# Render and Save All 5 Vertical Scenes
scenes = [
    ("scene_1_hook.png", render_scene_1),
    ("scene_2_ecosystem.png", render_scene_2),
    ("scene_3_tokenomics.png", render_scene_3),
    ("scene_4_milestones.png", render_scene_4),
    ("scene_5_calltoaction.png", render_scene_5)
]

for name, render_fn in scenes:
    out_path = os.path.join(OUTPUT_DIR, name)
    print(f"Rendering {name}...")
    scene_img = render_fn()
    scene_img.save(out_path, "PNG")
    print(f"Saved: {out_path} ({scene_img.size})")

print("All 5 Vertical (9:16) Master Scenes Rendered Successfully!")
