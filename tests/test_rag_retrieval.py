"""Integration checks for document retrieval quality (requires local Ollama)."""
import unittest

from server.app import build_prompt, is_greeting, is_low_quality_answer, retrieve


class RetrievalQualityTests(unittest.TestCase):
    def test_common_greetings_are_detected_without_document_search(self) -> None:
        self.assertTrue(is_greeting("hello"))
        self.assertTrue(is_greeting("habari"))
        self.assertFalse(is_greeting("naomba pasipoti"))

    def test_repetitive_small_model_output_is_rejected(self) -> None:
        self.assertTrue(is_low_quality_answer("Mwombaji " * 20))
        self.assertFalse(is_low_quality_answer("Pasipoti ni hati ya kusafiria inayotolewa na Serikali."))

    def test_prompt_requires_a_useful_overview_for_broad_questions(self) -> None:
        prompt = build_prompt("eleza kuhusu viza", "sw", [], [])
        self.assertIn("Give a useful overview", prompt)
        self.assertIn("Idara ya Uhamiaji Tanzania", prompt)

    def test_swahili_viza_query_prioritizes_visa_documents(self) -> None:
        matches = retrieve("eleza kuhusu viza ya tanzania")
        self.assertTrue(matches)
        self.assertIn("VISA", matches[0][0]["document"].upper())

    def test_class_a_requirements_include_full_requirements_section(self) -> None:
        matches = retrieve("Ninahitaji masharti gani kuomba residence permit Class A Tanzania?")
        context = " ".join(item["text"] for item, _score in matches)
        self.assertIn("GENERAL REQUIREMENTS FOR RESIDENCE PERMIT CLASS", context)
        self.assertIn("Valid Business license", context)


if __name__ == "__main__":
    unittest.main()
