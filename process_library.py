import sys
from PIL import Image
import math
import shutil
import os

source_path = r"C:\Users\Admin\Downloads\Gemini_Generated_Image_nlj5d7nlj5d7nlj5.png"
magenta_path = r"C:\Users\Admin\Downloads\overload-game\src\assets\library_magenta.png"
final_path = r"C:\Users\Admin\Downloads\overload-game\src\assets\library_final.png"

# Copy original to magenta_path
shutil.copy2(source_path, magenta_path)
print(f"Copied original to {magenta_path}")

img = Image.open(magenta_path).convert("RGBA")
pixels = img.load()
width, height = img.size

# Function to calculate color distance
def color_distance(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def is_magenta_fringe(r, g, b, a):
    if a == 0: return False
    
    # 1. Very close to #FF00FF
    if color_distance((r, g, b), (255, 0, 255)) <= 60:
        return True
        
    # 2. Pink-tinted edge pixels.
    # Characteristics of anti-aliasing against magenta:
    # High red, high blue, low green.
    # But we must NOT affect the red awning (high red, low blue, low green)
    # Nor the blue books/windows (low red, high blue, low green)
    # Nor the green bushes (low red, low blue, high green)
    # Nor white/tan (high r,g,b).
    #
    # So a fringe pixel has high R AND high B, but low G.
    # Specifically, R > G + 40 and B > G + 40.
    
    # Let's check for strong pink/magenta tint
    if r > g + 50 and b > g + 50 and r > 150 and b > 150:
        return True
        
    return False

removed_count = 0
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        if is_magenta_fringe(r, g, b, a):
            pixels[x, y] = (r, g, b, 0)
            removed_count += 1

img.save(final_path)
print(f"Removed background. Saved to {final_path}. Removed {removed_count} pixels.")
