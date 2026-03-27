#!/usr/bin/env python3
"""Generate PNG icons from SVG for Smart Fishing PWA."""
import subprocess
import os
import struct
import zlib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def create_png_from_svg_via_sips(svg_path, png_path, size):
    """Try using macOS sips via intermediate format."""
    # sips doesn't handle SVG well, so we'll generate PNGs directly
    pass

def create_png_icon(filepath, size):
    """Create a simple PNG icon programmatically (pure Python, no dependencies).

    Draws a fishing-themed icon with ocean blue gradient background and white fish.
    """
    width = height = size

    # Create pixel data (RGBA)
    pixels = bytearray(width * height * 4)

    cx, cy = width / 2, height / 2
    radius = width * 0.46875  # 240/512

    for y in range(height):
        for x in range(width):
            idx = (y * width + x) * 4

            # Distance from center
            dx = x - cx
            dy = y - cy
            dist = (dx * dx + dy * dy) ** 0.5

            if dist <= radius:
                # Inside the circle - gradient from #1e40af to #3b82f6
                t = (x + y) / (2 * width)  # diagonal gradient
                r = int(30 + t * (59 - 30))
                g = int(64 + t * (130 - 64))
                b = int(175 + t * (246 - 175))
                a = 255

                # Fish body - ellipse centered at (0.527*w, 0.449*h)
                fish_cx = 0.527 * width
                fish_cy = 0.449 * height
                fish_rx = 0.215 * width
                fish_ry = 0.107 * height

                ex = (x - fish_cx) / fish_rx
                ey = (y - fish_cy) / fish_ry

                if ex * ex + ey * ey <= 1.0:
                    r, g, b, a = 245, 245, 250, 255

                # Fish tail - triangle
                tail_x = 0.303 * width  # tip x (left)
                tail_cy_t = 0.449 * height
                tail_top = 0.352 * height
                tail_bot = 0.547 * height
                tail_base_x = 0.312 * width

                if x < tail_base_x and x >= tail_x * 0.9:
                    # Check if inside triangle
                    tx = (tail_base_x - x) / (tail_base_x - tail_x + 0.001)
                    half_h = (tail_bot - tail_top) / 2 * tx
                    if abs(y - tail_cy_t) <= half_h:
                        r, g, b, a = 245, 245, 250, 255

                # Fish eye
                eye_cx = 0.645 * width
                eye_cy = 0.420 * height
                eye_r = 0.027 * width
                eye_dist = ((x - eye_cx)**2 + (y - eye_cy)**2) ** 0.5
                if eye_dist <= eye_r:
                    r, g, b, a = 30, 64, 175, 255
                    # Eye highlight
                    highlight_cx = 0.652 * width
                    highlight_cy = 0.413 * height
                    highlight_r = 0.010 * width
                    h_dist = ((x - highlight_cx)**2 + (y - highlight_cy)**2) ** 0.5
                    if h_dist <= highlight_r:
                        r, g, b, a = 255, 255, 255, 255

                # Wave pattern at bottom
                wave_base = 0.625 * height
                wave_amp = 0.03 * height
                import math
                wave_y = wave_base + wave_amp * math.sin(x / width * 4 * math.pi)
                if y > wave_y and dist <= radius:
                    # Slightly darker/lighter overlay
                    r = max(0, int(r * 0.8))
                    g = max(0, int(g * 0.85))
                    b = min(255, int(b * 1.05))

                # "SF" text - simplified block letters
                # We'll skip text for cleanliness at small sizes

                pixels[idx] = r
                pixels[idx + 1] = g
                pixels[idx + 2] = b
                pixels[idx + 3] = a
            else:
                # Outside circle - transparent
                pixels[idx] = 0
                pixels[idx + 1] = 0
                pixels[idx + 2] = 0
                pixels[idx + 3] = 0

    # Write PNG file
    write_png(filepath, width, height, pixels)
    print(f"Created {filepath} ({size}x{size})")

def write_png(filepath, width, height, pixels):
    """Write RGBA pixel data as a PNG file."""
    def make_chunk(chunk_type, data):
        chunk = chunk_type + data
        return struct.pack('>I', len(data)) + chunk + struct.pack('>I', zlib.crc32(chunk) & 0xffffffff)

    # PNG signature
    signature = b'\x89PNG\r\n\x1a\n'

    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)  # 8-bit RGBA
    ihdr = make_chunk(b'IHDR', ihdr_data)

    # IDAT - raw image data with filter byte
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter: none
        row_start = y * width * 4
        raw_data.extend(pixels[row_start:row_start + width * 4])

    compressed = zlib.compress(bytes(raw_data), 9)
    idat = make_chunk(b'IDAT', compressed)

    # IEND
    iend = make_chunk(b'IEND', b'')

    with open(filepath, 'wb') as f:
        f.write(signature + ihdr + idat + iend)

if __name__ == '__main__':
    icon_dir = BASE_DIR

    # Try cairosvg first for high-quality SVG rendering
    try:
        import cairosvg
        svg_path = os.path.join(icon_dir, 'icon-source.svg')

        cairosvg.svg2png(
            url=svg_path,
            write_to=os.path.join(icon_dir, 'icon-192x192.png'),
            output_width=192,
            output_height=192
        )
        print("Created icon-192x192.png via cairosvg")

        cairosvg.svg2png(
            url=svg_path,
            write_to=os.path.join(icon_dir, 'icon-512x512.png'),
            output_width=512,
            output_height=512
        )
        print("Created icon-512x512.png via cairosvg")
    except ImportError:
        print("cairosvg not available, generating icons programmatically...")
        create_png_icon(os.path.join(icon_dir, 'icon-192x192.png'), 192)
        create_png_icon(os.path.join(icon_dir, 'icon-512x512.png'), 512)

    print("Done!")
