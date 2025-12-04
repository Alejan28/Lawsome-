import os
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import pandas as pd

BASE = "https://notari.pro"
START = f"{BASE}/declaratie/declaratie"

os.makedirs("data/docx/declaratie", exist_ok=True)
os.makedirs("data/html/declaratie", exist_ok=True)

def sanitize_filename(name):
    return re.sub(r'[\\/*?:"<>|]', "_", name.strip())

def get_procura_pages():
    resp = requests.get(START)
    soup = BeautifulSoup(resp.text, "html.parser")
    links = []
    for a in soup.select("a[href^='/declaratie']"):
        href = a["href"]
        if not href.endswith(".docx"):
            links.append(urljoin(BASE, href))
    return list(set(links))

def extract_page_data(page_url):
    resp = requests.get(page_url)
    soup = BeautifulSoup(resp.text, "html.parser")

    title_tag = soup.find("h1")
    title = title_tag.get_text(strip=True) if title_tag else "N/A"
    type_procura = title.lower().replace("model declaratie", "").strip()

    # --- DOCX link ---
    a = soup.find("a", class_="doc", href=True)
    docx_link = urljoin(BASE, a["href"]) if a else None
    docx_path = None
    if docx_link:
        filename = sanitize_filename(os.path.basename(docx_link))
        docx_path = os.path.join("data/docx/declaratie", filename)
        if not os.path.exists(docx_path):
            try:
                r = requests.get(docx_link)
                with open(docx_path, "wb") as f:
                    f.write(r.content)
                print(f"Saved DOCX: {filename}")
            except Exception as e:
                print(f"Failed to download {docx_link}: {e}")

    # --- Inline HTML templates ---
    models = [div.get_text("\n", strip=True) for div in soup.select("div.model")]
    html_path = None
    if models:
        filename = sanitize_filename(title or os.path.basename(page_url)) + ".txt"
        html_path = os.path.join("data/html/declaratie", filename)
        with open(html_path, "w", encoding="utf-8") as f:
            f.write("\n\n---\n\n".join(models))
        print(f"Saved HTML model(s): {filename}")

    return {
        "page_url": page_url,
        "title": title,
        "type": type_procura,
        "docx_url": docx_link,
        "docx_path": docx_path,
        "html_templates": bool(models),
        "html_path": html_path,
    }


if __name__ == "__main__":
    pages = get_procura_pages()
