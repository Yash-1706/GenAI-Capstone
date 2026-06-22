import pytest
from unittest.mock import patch, MagicMock
from PIL import Image
from backend.services.llm import llm_service

@pytest.fixture(autouse=True)
def setup_llm_model():
    # Ensure llm_service.model is not None during tests
    if llm_service.model is None:
        llm_service.model = MagicMock()

def test_attribute_extraction_has_all_keys():
    with patch.object(llm_service, "model") as mock_model:
        mock_response = MagicMock()
        mock_response.text = '{"colour": "red", "style": "modern", "material": "wood", "shape": "round"}'
        mock_model.generate_content.return_value = mock_response
        
        img = Image.new("RGB", (400, 400), color=(255, 0, 0))
        result = llm_service.extract_attributes(img)
        
        assert "colour" in result
        assert "style" in result
        assert "material" in result
        assert "shape" in result

def test_description_length():
    with patch.object(llm_service, "model") as mock_model:
        # Create a description with 60 words
        desc_text = " ".join(["word"] * 60)
        
        mock_response = MagicMock()
        mock_response.text = desc_text
        mock_model.generate_content.return_value = mock_response
        
        img = Image.new("RGB", (400, 400), color=(255, 0, 0))
        result = llm_service.generate_description(img, seed_keywords=["test"])
        
        word_count = len(result.split())
        assert 50 <= word_count <= 150
