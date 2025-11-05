import re
import time
import base64
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from pathlib import Path
from pdfminer.high_level import extract_text

BASE = "https://legeaz.net"
INDEX_URL = "https://legeaz.net/modele/pagina-5"
HEADERS = {"User-Agent": "Mozilla/5.0"}

DOC_TYPES = ["cerere", "declaratie", "testament", "proces-verbal"]
ROOT_DIR = Path("data")
for d in DOC_TYPES:
    (ROOT_DIR / d / "pdfs").mkdir(parents=True, exist_ok=True)
    # (ROOT_DIR / d / "txts").mkdir(parents=True, exist_ok=True)


def get_article_links():
    """Get all article links from the main index page."""
    r = requests.get(INDEX_URL, headers=HEADERS)
    soup = BeautifulSoup(r.text, "html.parser")
    links = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("/modele/"):
            links.add(urljoin(BASE, href))
    print(f"🔗 Found {len(links)} article links")
    return list(links)


def find_pdf_intermediate(article_url):
    """Find the intermediate PDF page (with base64 fragment)."""
    r = requests.get(article_url, headers=HEADERS)
    soup = BeautifulSoup(r.text, "html.parser")
    # look for <a href="/descarca-pdf#...">
    a = soup.select_one('a[href*="/descarca-pdf#"]')
    if a:
        return urljoin(BASE, a["href"])
    return None


def decode_pdf_url(intermediate_url):
    """Decode the base64 fragment to get real PDF URL."""
    fragment = urlparse(intermediate_url).fragment
    if not fragment:
        return None
    decoded_bytes = base64.b64decode(fragment)
    decoded_url = decoded_bytes.decode("utf-8")
    return urljoin(BASE, decoded_url)


def safe_filename(url):
    name = urlparse(url).path.rstrip("/").split("/")[-1]
    return re.sub(r"[^A-Za-z0-9_-]", "_", name) or "file"


def download_pdf(pdf_url, out_path):
    if out_path.exists():
        return out_path
    r = requests.get(pdf_url, headers=HEADERS)
    if r.status_code == 200 and r.content.startswith(b"%PDF"):
        out_path.write_bytes(r.content)
        print("Downloaded:", out_path.name)
        return out_path
    else:
        print("Failed or invalid PDF:", pdf_url)
        return None


def pdf_to_txt(pdf_path, txt_path):
    try:
        text = extract_text(str(pdf_path))
        txt_path.write_text(text.strip(), encoding="utf-8")
        print("Converted:", pdf_path.name, "→", txt_path.name)
    except Exception as e:
        print("Conversion failed:", e)


def extract_html_text(article_url, txt_path):
    r = requests.get(article_url, headers=HEADERS)
    soup = BeautifulSoup(r.text, "html.parser")
    text = soup.get_text(separator="\n", strip=True)
    txt_path.write_text(text.strip(), encoding="utf-8")
    print("Saved HTML text:", txt_path.name)


def main():
    article_links = get_article_links()

    for link in article_links:
        lower = link.lower()
        doc_type = next((t for t in DOC_TYPES if t in lower), None)
        if not doc_type:
            continue

        name = safe_filename(link)
        pdf_path = ROOT_DIR / doc_type / "pdfs" / f"{name}.pdf"
        txt_path = ROOT_DIR / doc_type / f"{name}.txt"

        intermediate_pdf = find_pdf_intermediate(link)
        if intermediate_pdf:
            pdf_url = decode_pdf_url(intermediate_pdf)
            if pdf_url:
                pdf_file = download_pdf(pdf_url, pdf_path)
                if pdf_file:
                    pdf_to_txt(pdf_file, txt_path)
                    time.sleep(1)
                    continue

        # fallback: save HTML text if no PDF
        extract_html_text(link, txt_path)
        time.sleep(1)


if __name__ == "__main__":
    main()
