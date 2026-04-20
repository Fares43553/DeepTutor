"""
Language Detection Service
==========================

Detects the language of text messages and provides intelligent language handling
for multilingual conversations.

Uses simple heuristics and regex patterns for lightweight, fast detection.
"""

import re
from typing import Literal

# Language-specific character ranges
ARABIC_RANGE = r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0FB1-\u0FB4]'
CHINESE_RANGE = r'[\u2E80-\u2EFF\u2F00-\u2FDF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3200-\u32FF\u4E00-\u9FFF\uF900-\uFAFF]'
HEBREW_RANGE = r'[\u0590-\u05FF]'
CYRILLIC_RANGE = r'[\u0400-\u04FF]'
THAI_RANGE = r'[\u0E00-\u0E7F]'
JAPANESE_RANGE = r'[\u3040-\u309F\u30A0-\u30FF]'
KOREAN_RANGE = r'[\uAC00-\uD7AF\u1100-\u11FF]'

# Compile regex patterns for performance
ARABIC_PATTERN = re.compile(ARABIC_RANGE)
CHINESE_PATTERN = re.compile(CHINESE_RANGE)
HEBREW_PATTERN = re.compile(HEBREW_RANGE)
CYRILLIC_PATTERN = re.compile(CYRILLIC_RANGE)
THAI_PATTERN = re.compile(THAI_RANGE)
JAPANESE_PATTERN = re.compile(JAPANESE_RANGE)
KOREAN_PATTERN = re.compile(KOREAN_RANGE)

# Common English words (for distinguishing English from other Latin-script languages)
COMMON_ENGLISH_WORDS = {
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'can', 'who', 'get', 'if', 'me', 'when', 'make',
    'go', 'how', 'him', 'see', 'now', 'its', 'our', 'just', 'your', 'more',
    'very', 'then', 'should', 'could', 'been', 'even', 'them', 'than',
    'these', 'some', 'into', 'how', 'no', 'come', 'use', 'find', 'work',
    'call', 'try', 'ask', 'need', 'feel', 'become', 'leave', 'give', 'mean',
    'tell', 'help', 'talk', 'think', 'show', 'listen', 'look', 'open', 'write',
}

LanguageCode = Literal['en', 'ar', 'zh', 'es', 'fr', 'de', 'ru', 'ja', 'ko', 'th', 'he', 'pt']


def detect_language(text: str) -> LanguageCode:
    """
    Detect the primary language of the given text.

    Algorithm:
    1. Count characters in each language script
    2. Return language with highest character count
    3. For Latin scripts, use English word frequency
    4. Fallback to English if inconclusive

    Args:
        text: Input text to analyze

    Returns:
        Language code ('en', 'ar', 'zh', etc.)
    """
    if not text or len(text.strip()) < 3:
        return 'en'  # Default for very short text

    text_lower = text.lower()

    # Count script characters
    arabic_chars = len(ARABIC_PATTERN.findall(text))
    chinese_chars = len(CHINESE_PATTERN.findall(text))
    hebrew_chars = len(HEBREW_PATTERN.findall(text))
    cyrillic_chars = len(CYRILLIC_PATTERN.findall(text))
    thai_chars = len(THAI_PATTERN.findall(text))
    japanese_chars = len(JAPANESE_PATTERN.findall(text))
    korean_chars = len(KOREAN_PATTERN.findall(text))

    total_special_chars = (
        arabic_chars + chinese_chars + hebrew_chars + 
        cyrillic_chars + thai_chars + japanese_chars + korean_chars
    )
    text_len = len(text)

    # If any script has > 30% of text, that's the language
    if arabic_chars > text_len * 0.3:
        return 'ar'
    if chinese_chars > text_len * 0.3:
        return 'zh'
    if hebrew_chars > text_len * 0.3:
        return 'he'
    if cyrillic_chars > text_len * 0.3:
        return 'ru'
    if thai_chars > text_len * 0.3:
        return 'th'
    if japanese_chars > text_len * 0.3:
        return 'ja'
    if korean_chars > text_len * 0.3:
        return 'ko'

    # If > 20%, still likely that language
    if arabic_chars > text_len * 0.2:
        return 'ar'
    if chinese_chars > text_len * 0.2:
        return 'zh'
    if japanese_chars > text_len * 0.2:
        return 'ja'

    # For Latin-script languages, check English word frequency
    words = re.findall(r'\b\w+\b', text_lower)
    english_words = sum(1 for w in words if w in COMMON_ENGLISH_WORDS)

    if words and english_words / len(words) > 0.2:
        return 'en'

    # Default to English for undetected Latin-script languages
    return 'en'


def get_language_instruction(detected_language: LanguageCode, ui_language: LanguageCode) -> str:
    """
    Get a smart language instruction for the LLM.

    Strategy:
    - If user message is in a specific language, respond in that language
    - Otherwise use the UI language
    - Only add instruction if different from English

    Args:
        detected_language: Language detected in user message
        ui_language: User's UI language preference

    Returns:
        System prompt instruction (empty string for English)
    """
    # Use detected language if available, fallback to UI language
    response_language = detected_language if detected_language != 'en' else ui_language

    if response_language == 'ar':
        return (
            "\n\n**Language Note:** "
            "Respond in Arabic (العربية) to match the user's language. "
            "If the user writes in English, respond in English. "
            "Adapt to their language preference."
        )
    elif response_language == 'zh':
        return (
            "\n\n【语言提示】"
            "用中文回复以匹配用户的语言。如果用户用英文写作，用英文回复。"
            "根据他们的语言偏好调整。"
        )
    elif response_language == 'es':
        return (
            "\n\nNota de idioma: "
            "Responde en español para coincidir con el idioma del usuario."
        )
    elif response_language == 'fr':
        return (
            "\n\nNote de langue: "
            "Répondez en français pour correspondre à la langue de l'utilisateur."
        )
    elif response_language == 'de':
        return (
            "\n\nSprachnotiz: "
            "Antworten Sie auf Deutsch, um der Sprache des Benutzers zu entsprechen."
        )
    elif response_language == 'ru':
        return (
            "\n\nПримечание по языку: "
            "Отвечайте на русском языке в соответствии с языком пользователя."
        )
    elif response_language == 'ja':
        return (
            "\n\n【言語ノート】"
            "ユーザーの言語に合わせて日本語で応答してください。"
        )

    # English is default, no special instruction needed
    return ""


def get_dominant_language(conversation_history: list[dict]) -> LanguageCode:
    """
    Determine the dominant language in a conversation history.

    Analyzes all user messages and returns the most frequent language.

    Args:
        conversation_history: List of message dicts with 'role' and 'content'

    Returns:
        Dominant language code
    """
    if not conversation_history:
        return 'en'

    user_messages = [
        msg.get('content', '')
        for msg in conversation_history
        if msg.get('role') == 'user'
    ]

    if not user_messages:
        return 'en'

    language_counts = {}
    for message in user_messages:
        lang = detect_language(message)
        language_counts[lang] = language_counts.get(lang, 0) + 1

    # Return language with most messages
    return max(language_counts, key=language_counts.get) if language_counts else 'en'
