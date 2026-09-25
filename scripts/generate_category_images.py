import os
from PIL import Image, ImageDraw, ImageFont

categories = [
    ("category-fasteners.png", "FASTENERS & FIXINGS", "Bolts • Screws • Anchors • Washers", "#1E293B", "#F59E0B"),
    ("category-tools.png", "HAND & POWER TOOLS", "Drills • Wrenches • Cutters • Saws", "#0F172A", "#3B82F6"),
    ("category-electrical.png", "ELECTRICAL & LIGHTING", "Cables • Switches • Conduits • MCBs", "#18181B", "#EAB308"),
    ("category-plumbing.png", "PLUMBING & PIPES", "CPVC • Valves • Fittings • Taps", "#0B192C", "#06B6D4"),
    ("category-paints.png", "PAINTS & CHEMICALS", "Enamels • Primers • Adhesives • Sealants", "#1C1917", "#EC4899"),
    ("category-safety.png", "SAFETY & WORKWEAR", "Helmets • Gloves • Goggles • Boots", "#1E1E24", "#EF4444"),
    ("category-hardware.png", "ARCHITECTURAL HARDWARE", "Hinges • Handles • Locks • Brackets", "#172554", "#10B981")
]

os.makedirs("public/images/products", exist_ok=True)

width, height = 800, 600

for filename, title, subtitle, bg_color, accent_color in categories:
    img = Image.new("RGB", (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Draw subtle background grid/lines
    for x in range(0, width, 40):
        draw.line([(x, 0), (x, height)], fill="#334155", width=1)
    for y in range(0, height, 40):
        draw.line([(0, y), (width, y)], fill="#334155", width=1)
        
    # Draw central badge container
    box_margin = 60
    draw.rounded_rectangle(
        [(box_margin, box_margin), (width - box_margin, height - box_margin)],
        radius=20,
        fill="#0F172A",
        outline=accent_color,
        width=3
    )
    
    # Draw top accent strip
    draw.rectangle([(box_margin, box_margin), (width - box_margin, box_margin + 12)], fill=accent_color)
    
    # Draw text
    brand = "MALIK HARDWARE MART"
    draw.text((width // 2, 160), brand, fill="#94A3B8", anchor="mm")
    draw.text((width // 2, 270), title, fill="#FFFFFF", anchor="mm")
    draw.text((width // 2, 350), subtitle, fill=accent_color, anchor="mm")
    draw.text((width // 2, 450), "OFFICIAL CATALOG SPECIFICATION", fill="#64748B", anchor="mm")
    
    target_path = os.path.join("public/images/products", filename)
    img.save(target_path, "PNG")
    print(f"Generated {target_path}")

print("Category images generated successfully.")
