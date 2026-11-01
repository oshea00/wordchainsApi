#!/usr/bin/env python3
"""Regenerates the word list from a pinned SCOWL release.

Writes backend/domain/words.txt and ui/public/third-party-notices.txt, then
prints per-length counts. Words listed in backend/domain/words-excluded.txt
are left out. The output only changes if the pinned release or the exclusions
change.
"""
import argparse
import collections
import hashlib
import io
import pathlib
import re
import sys
import tarfile
import urllib.request

RELEASE = "2020.12.07"
URL = f"https://downloads.sourceforge.net/wordlist/scowl-{RELEASE}.tar.gz"
SHA256 = "5587667caa20c4891390c2d42dbb4d5c4c3f41bee77af1457ece3ba23fb859cc"
SPELLINGS = ("english", "american", "british")
SIZES = (10, 20, 35, 40, 50, 55, 60)
MIN_LENGTH = 2
MAX_LENGTH = 8

ROOT = pathlib.Path(__file__).resolve().parent.parent
WORDS = ROOT / "backend/domain/words.txt"
EXCLUDED = ROOT / "backend/domain/words-excluded.txt"
NOTICES = ROOT / "ui/public/third-party-notices.txt"

PLAYABLE = re.compile(f"[a-z]{{{MIN_LENGTH},{MAX_LENGTH}}}")


def load_tarball(path):
    if path:
        data = path.read_bytes()
    else:
        with urllib.request.urlopen(URL, timeout=120) as response:
            data = response.read()
    actual = hashlib.sha256(data).hexdigest()
    if actual != SHA256:
        sys.exit(f"Checksum mismatch for SCOWL {RELEASE}: {actual}")
    return data


def read_release(data):
    """Returns the playable SCOWL words and the text of its Copyright file."""
    names = {
        f"scowl-{RELEASE}/final/{spelling}-words.{size}"
        for spelling in SPELLINGS
        for size in SIZES
    }
    copyright_name = f"scowl-{RELEASE}/Copyright"
    words = set()
    copyright_text = None
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as tar:
        for member in tar:
            if member.name in names:
                text = tar.extractfile(member).read().decode("latin-1")
                words.update(w for w in text.split() if PLAYABLE.fullmatch(w))
                names.discard(member.name)
            elif member.name == copyright_name:
                copyright_text = tar.extractfile(member).read().decode("latin-1")
    if names:
        sys.exit(f"Missing from the release: {sorted(names)}")
    if copyright_text is None:
        sys.exit("The release has no Copyright file")
    return words, copyright_text


def read_excluded():
    lines = EXCLUDED.read_text(encoding="utf-8").splitlines()
    return {line.strip() for line in lines if line.strip() and not line.startswith("#")}


def notices(copyright_text):
    sizes = ", ".join(map(str, SIZES))
    return f"""Third-party notices for Word Chains

Word list
---------
The word list is derived from SCOWL (Spell Checker Oriented Word Lists)
by Kevin Atkinson: http://wordlist.aspell.net/

Release: {RELEASE}
Files: final/{{english,american,british}}-words at sizes {sizes}

It was modified for this game: only lowercase words of {MIN_LENGTH} to {MAX_LENGTH} letters
are kept, and a project-maintained list of offensive words and non-words is
removed.

The SCOWL copyright and license notices follow in full.

================================================================================

{copyright_text}"""


def print_counts(words):
    """Prints how many words per length have a one-letter neighbour."""
    by_length = collections.defaultdict(list)
    for word in words:
        by_length[len(word)].append(word)
    print("letters  words  with a neighbour")
    for length in sorted(by_length):
        patterns = collections.Counter(
            word[:i] + "_" + word[i + 1:]
            for word in by_length[length]
            for i in range(length)
        )
        linked = sum(
            any(patterns[word[:i] + "_" + word[i + 1:]] > 1 for i in range(length))
            for word in by_length[length]
        )
        print(f"{length:7}  {len(by_length[length]):5}  {linked:5}")
    print(f"  total  {len(words):5}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--tarball", type=pathlib.Path, help="use a local copy of the release"
    )
    args = parser.parse_args()

    words, copyright_text = read_release(load_tarball(args.tarball))
    excluded = read_excluded()
    unused = sorted(excluded - words)
    if unused:
        print(f"Exclusions not in SCOWL: {', '.join(unused)}", file=sys.stderr)
    words -= excluded

    WORDS.write_text("".join(f"{word}\n" for word in sorted(words)), encoding="ascii")
    NOTICES.write_text(notices(copyright_text), encoding="utf-8")
    print_counts(words)


if __name__ == "__main__":
    main()
