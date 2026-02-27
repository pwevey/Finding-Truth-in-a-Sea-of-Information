"""Generate MP3 audio files from HTML page content using Microsoft Edge neural TTS.

Extracts the full <main> text from each HTML file so nothing is missed.
"""
import asyncio
import os
import re
from html.parser import HTMLParser

import edge_tts

VOICE = "en-US-AndrewNeural"
RATE = "+0%"

# HTML files -> output MP3 paths
PAGES = {
    "docs/index.html":                   "docs/audio/index.mp3",
    "docs/manifesto.html":               "docs/audio/manifesto.mp3",
    "docs/ai-reflection-on-truth.html":  "docs/audio/ai-reflection.mp3",
    "docs/christian-framework-ai.html":  "docs/audio/christian-framework.mp3",
    "docs/about.html":                   "docs/audio/about.mp3",
}


class MainTextExtractor(HTMLParser):
    """Extract readable text from inside <main>...</main>, skipping scripts/styles."""

    SKIP_TAGS = {"script", "style"}

    def __init__(self):
        super().__init__()
        self.in_main = False
        self.skip_depth = 0
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag == "main":
            self.in_main = True
            return
        if self.in_main and tag in self.SKIP_TAGS:
            self.skip_depth += 1
        # Add a pause after headings and block elements for natural reading
        if self.in_main and tag in ("h1", "h2", "h3", "h4", "p", "li", "blockquote"):
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag == "main":
            self.in_main = False
            return
        if self.in_main and tag in self.SKIP_TAGS:
            self.skip_depth -= 1
        if self.in_main and tag in ("h1", "h2", "h3", "h4", "p", "li", "blockquote", "ul", "ol", "div"):
            self.parts.append("\n")

    def handle_data(self, data):
        if self.in_main and self.skip_depth == 0:
            self.parts.append(data)

    def handle_entityref(self, name):
        ENTITIES = {"amp": "&", "lt": "<", "gt": ">", "mdash": " — ", "ndash": " – ", "quot": '"'}
        if self.in_main and self.skip_depth == 0:
            self.parts.append(ENTITIES.get(name, ""))

    def handle_charref(self, name):
        if self.in_main and self.skip_depth == 0:
            try:
                self.parts.append(chr(int(name)))
            except ValueError:
                pass

    def get_text(self):
        raw = "".join(self.parts)
        # Collapse whitespace within lines, keep paragraph breaks
        lines = raw.split("\n")
        cleaned = []
        for line in lines:
            line = " ".join(line.split())
            if line:
                cleaned.append(line)
        return "\n".join(cleaned)


def extract_main_text(html_path):
    """Read an HTML file and return the text content of <main>."""
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()
    parser = MainTextExtractor()
    parser.feed(html)
    return parser.get_text()


async def generate():
    os.makedirs("docs/audio", exist_ok=True)

    for html_path, mp3_path in PAGES.items():
        text = extract_main_text(html_path)
        word_count = len(text.split())
        print(f"\n--- {html_path} → {mp3_path}")
        print(f"    Words: {word_count}")
        print(f"    Preview: {text[:120]}...")

        communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
        await communicate.save(mp3_path)
        size = os.path.getsize(mp3_path)
        print(f"    Done: {size:,} bytes")


if __name__ == "__main__":
    asyncio.run(generate())
