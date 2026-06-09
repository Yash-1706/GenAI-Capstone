import pytest
from unittest.mock import patch, MagicMock
from PIL import Image
from backend.services.llm import llm_service

@pytest.fixture(autouse=True)
def setup_llm_client():
    # Ensure llm_service.client is not None during tests
    if llm_service.client is None:
        llm_service.client = MagicMock()

def test_attribute_extraction_has_all_keys():
    with patch.object(llm_service, "client") as mock_client:
        mock_msg = MagicMock()
        mock_msg.content = [MagicMock(text='{"colour": "red", "style": "modern", "material": "wood", "shape": "round"}')]
        mock_client.messages.create.return_value = mock_msg
        
        img = Image.new("RGB", (400, 400), color=(255, 0, 0))
        result = llm_service.extract_attributes(img)
        
        assert "colour" in result
        assert "style" in result
        assert "material" in result
        assert "shape" in result

def test_description_length():
    with patch.object(llm_service, "client") as mock_client:
        # Create a description with 60 words
        desc_text = " ".join(["word"] * 60)
        
        mock_msg = MagicMock()
        mock_msg.content = [MagicMock(text=desc_text)]
        mock_client.messages.create.return_value = mock_msg
        
        img = Image.new("RGB", (400, 400), color=(255, 0, 0))
        result = llm_service.generate_description(img, seed_keywords=["test"])
        
        word_count = len(result.split())
        assert 50 <= word_count <= 150
