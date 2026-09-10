"""Command-line smoke test for the backend handoff."""

from __future__ import annotations

import argparse
import json

from single_image_model.satquery_backend import SatQueryEngine


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("image")
    parser.add_argument("prompt")
    parser.add_argument("--allow-cpu", action="store_true")
    args = parser.parse_args()
    engine = SatQueryEngine(device="cpu" if args.allow_cpu else None)
    print(json.dumps(engine.answer(args.image, args.prompt), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
