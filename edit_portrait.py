from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np
import random

# Load original portrait
img = Image.open('IMG_3012=.png').convert('RGBA')
width, height = img.size
print(f"Original size: {width}x{height}")

# Create larger canvas with pure black background
canvas_size = max(width, height) * 2
canvas = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 255))

# Center the portrait
x_offset = (canvas_size - width) // 2
y_offset = (canvas_size - height) // 2
canvas.paste(img, (x_offset, y_offset), img)

# Create subtle purple atmospheric glow using numpy
glow = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
glow_data = np.array(glow)

center_x = canvas_size // 2
center_y = canvas_size // 2
max_radius = max(width, height) * 0.8

# Vectorized distance calculation
y_coords, x_coords = np.mgrid[0:canvas_size, 0:canvas_size]
dx = x_coords - center_x
dy = y_coords - center_y
dist = np.sqrt(dx**2 + dy**2)

# Create purple glow mask
mask = dist < max_radius
intensity = (1 - dist / max_radius) * 0.15
purple_value = (intensity * 80).astype(np.uint8)
alpha = (intensity * 60).astype(np.uint8)

glow_data[:, :, 0] = np.where(mask, purple_value, 0)
glow_data[:, :, 1] = 0
glow_data[:, :, 2] = np.where(mask, purple_value + 20, 0)
glow_data[:, :, 3] = np.where(mask, alpha, 0)

glow = Image.fromarray(glow_data, 'RGBA')
glow = glow.filter(ImageFilter.GaussianBlur(radius=80))
canvas = Image.alpha_composite(canvas, glow)

# Add sparse floating purple particles
particles = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
particles_data = np.array(particles)

num_particles = 30
for _ in range(num_particles):
    px = random.randint(0, canvas_size)
    py = random.randint(0, canvas_size)
    dx_p = px - center_x
    dy_p = py - center_y
    dist_p = np.sqrt(dx_p**2 + dy_p**2)
    max_dist = max(width, height) * 0.9
    
    if dist_p < max_dist:
        particle_size = random.randint(1, 3)
        alpha_p = random.randint(30, 80)
        purple_val_p = random.randint(100, 180)
        
        # Draw small circle
        for dy in range(-particle_size, particle_size + 1):
            for dx in range(-particle_size, particle_size + 1):
                if dx**2 + dy**2 <= particle_size**2:
                    px_final = px + dx
                    py_final = py + dy
                    if 0 <= px_final < canvas_size and 0 <= py_final < canvas_size:
                        particles_data[py_final, px_final, 0] = purple_val_p
                        particles_data[py_final, px_final, 1] = 0
                        particles_data[py_final, px_final, 2] = purple_val_p + 30
                        particles_data[py_final, px_final, 3] = alpha_p

particles = Image.fromarray(particles_data, 'RGBA')
particles = particles.filter(ImageFilter.GaussianBlur(radius=1))
canvas = Image.alpha_composite(canvas, particles)

# Create cinematic vignette - pure black at edges
vignette = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
vignette_data = np.array(vignette)

edge_dist = np.minimum.reduce([
    x_coords, y_coords, 
    canvas_size - x_coords, 
    canvas_size - y_coords
])
max_edge = canvas_size * 0.3

vignette_mask = edge_dist < max_edge
vignette_intensity = 1 - (edge_dist / max_edge)
vignette_alpha = (vignette_intensity * 200).astype(np.uint8)

vignette_data[:, :, 3] = np.where(vignette_mask, vignette_alpha, 0)

vignette = Image.fromarray(vignette_data, 'RGBA')
vignette = vignette.filter(ImageFilter.GaussianBlur(radius=100))
canvas = Image.alpha_composite(canvas, vignette)

# Enhance contrast for cinematic look
enhancer = ImageEnhance.Contrast(canvas)
canvas = enhancer.enhance(1.1)

# Save result
output_path = 'IMG_3012_abyss.png'
canvas.save(output_path, 'PNG')
print(f"Saved abyss portrait to: {output_path}")
print("Portrait editing complete.")
