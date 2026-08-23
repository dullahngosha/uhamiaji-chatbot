"""Integration checks for document retrieval quality (requires local Ollama)."""
import unittest

from server.app import retrieve


class RetrievalQualityTests(unittest.TestCase):
    def test_class_a_requirements_include_full_requirements_section(self) -> None:
        matches = retrieve("Ninahitaji masharti gani kuomba residence permit Class A Tanzania?")
        context = " ".join(item["text"] for item, _score in matches)
        self.assertIn("GENERAL REQUIREMENTS FOR RESIDENCE PERMIT CLASS", context)
        self.assertIn("Valid Business license", context)


if __name__ == "__main__":
    unittest.main()
