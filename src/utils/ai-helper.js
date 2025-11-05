
// Chrome Built-in AI APIs

var OneSpaceAI = OneSpaceAI || {};

async function checkAIAvailability() {
  const status = {
    summarizer: false,
    rewriter: false,
    translator: false,
    prompt: false,
    languageModel: false
  };

  try {
    if (typeof LanguageModel !== 'undefined') {
      const availability = await LanguageModel.availability();
      status.prompt = availability === 'readily';
      status.languageModel = availability === 'readily';
    }

    if (typeof Summarizer !== 'undefined') {
      const availability = await Summarizer.availability();
      status.summarizer = availability === 'readily';
    }

    if (typeof Rewriter !== 'undefined') {
      const availability = await Rewriter.availability();
      status.rewriter = availability === 'readily';
    }

    if (typeof Translator !== 'undefined') {
      const availability = await Translator.availability();
      status.translator = availability === 'readily';
    }
  } catch (error) {
    // Silent fail
  }

  return status;
}

async function explainText(text) {
  try {
    if (typeof LanguageModel !== 'undefined') {
      const availability = await LanguageModel.availability();

      if (availability === 'readily' || availability === 'available') {
        try {
          const session = await LanguageModel.create({
            language: 'en',
            outputLanguage: 'en',
            output: { language: 'en' }
          });
          const prompt = `Explain the following text clearly and concisely. Start with a brief 1-sentence summary, then provide 3-5 key points as bullet points:

"${text}"

Format your response as:
Summary: [one sentence]

Key points:
* [point 1]
* [point 2]
* [point 3]`;

          const result = await session.prompt(prompt);
          session.destroy();
          return result;
        } catch (err) {
          // Fallback to Summarizer
        }
      }
    }

    if (typeof Summarizer !== 'undefined') {
      const availability = await Summarizer.availability();

      if (availability === 'readily' || availability === 'available') {
        try {
          const summarizer = await Summarizer.create();
          const result = await summarizer.summarize(text);
          summarizer.destroy();
          return result;
        } catch (err) {
          // Continue to fallback
        }
      }
    }

    await simulateDelay();
    return demoResponse('explain', { text });

  } catch (error) {
    throw error;
  }
}

async function simplifyText(text) {
  try {
    if (typeof LanguageModel !== 'undefined') {
      const availability = await LanguageModel.availability();

      if (availability === 'readily' || availability === 'available') {
        try {
          const session = await LanguageModel.create({
            language: 'en',
            outputLanguage: 'en',
            output: { language: 'en' }
          });
          const prompt = `Simplify the following text into very simple, easy-to-understand language. Use basic words that a 10-year-old would understand. Break down complex concepts into clear, short sentences. Avoid jargon and technical terms.

"${text}"

Provide a simplified version that is:
- Written in plain, everyday language
- Shorter and more direct
- Easy for anyone to understand
- Free of complicated words`;

          const result = await session.prompt(prompt);
          session.destroy();
          return result;
        } catch (err) {
          // Fallback to Rewriter
        }
      }
    }

    if (typeof Rewriter !== 'undefined') {
      const availability = await Rewriter.availability();

      if (availability === 'readily' || availability === 'available') {
        try {
          const rewriter = await Rewriter.create();
          const result = await rewriter.rewrite(text);
          rewriter.destroy();
          return result;
        } catch (err) {
          // Continue to fallback
        }
      }
    }

    await simulateDelay();
    return demoResponse('simplify', { text });

  } catch (error) {
    throw error;
  }
}

async function translateText(text, targetLanguage = 'es') {
  const languageNames = {
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'ja': 'Japanese',
    'hi': 'Hindi'
  };

  try {
    if (typeof Translator !== 'undefined') {
      const availability = await Translator.availability({
        sourceLanguage: 'en',
        targetLanguage: targetLanguage
      });

      if (availability === 'readily' || availability === 'available') {
        const translator = await Translator.create({
          sourceLanguage: 'en',
          targetLanguage: targetLanguage
        });
        const result = await translator.translate(text);
        translator.destroy();
        return result;
      }
      else if (availability === 'after-download' || availability === 'downloadable') {
        const translator = await Translator.create({
          sourceLanguage: 'en',
          targetLanguage: targetLanguage
        });
        const result = await translator.translate(text);
        translator.destroy();
        return result;
      }
      else {
        throw new Error(`Translation to ${languageNames[targetLanguage]} is not supported`);
      }
    }

    await simulateDelay();
    return demoResponse('translate', { languageName: languageNames[targetLanguage] });

  } catch (error) {
    throw error;
  }
}

async function proofreadText(text) {
  try {
    if (typeof Proofreader !== 'undefined') {
      const availability = await Proofreader.availability();

      if (availability === 'readily' || availability === 'available') {
        const proofreader = await Proofreader.create();
        const result = await proofreader.proofread(text);
        proofreader.destroy();
        return result.correctedInput || text;
      } else {
        throw new Error('Proofreader API is not available');
      }
    }

    await simulateDelay();
    return demoResponse('proofread', { text });

  } catch (error) {
    throw error;
  }
}

// Simulate AI processing delay
function simulateDelay() {
  const delay = 500 + Math.random() * 1000;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Unified, minimal demo responses (kept intentionally short and straightforward)
function demoResponse(type, params = {}) {
  switch (type) {
    case 'explain': {
      const preview = (params.text || '').trim().slice(0, 120);
      const summary = preview || 'Summary of your text.';
      return `Demo mode: Example explanation\nSummary: ${summary}\n- Key point 1\n- Key point 2\n- Key point 3`;
    }
    case 'simplify': {
      const preview = (params.text || '').trim().slice(0, 120);
      return `Demo mode: Example simplified version\n${preview}`;
    }
    case 'translate': {
      const language = params.languageName || 'Target Language';
      return `Demo mode: Example translation to ${language}. Enable AI in Settings for real translation.`;
    }
    case 'proofread': {
      const preview = (params.text || '').trim().slice(0, 120);
      return `Demo mode: Example corrected text\n${preview}`;
    }
    case 'image': {
      return 'Demo mode: Example image description. Enable AI in Settings for real analysis.';
    }
    case 'similarLinks': {
      const pageTitle = params.pageTitle || 'this topic';
      return `MDN Web Docs - JavaScript Guide|||https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide|||Comprehensive JavaScript documentation and tutorials for developers of all levels.
W3Schools JavaScript Tutorial|||https://www.w3schools.com/js/|||Interactive JavaScript tutorials with examples and exercises to learn web development.
JavaScript.info - The Modern JavaScript Tutorial|||https://javascript.info/|||In-depth modern JavaScript tutorial covering fundamentals and advanced topics.
freeCodeCamp|||https://www.freecodecamp.org/|||Free coding bootcamp with interactive lessons and projects.
Stack Overflow - JavaScript|||https://stackoverflow.com/questions/tagged/javascript|||Community Q&A platform for JavaScript developers to get help and share knowledge.
GitHub - Awesome JavaScript|||https://github.com/sorrycc/awesome-javascript|||Curated list of awesome JavaScript libraries, resources and tools.
Eloquent JavaScript|||https://eloquentjavascript.net/|||Free online book teaching JavaScript programming from basics to advanced concepts.`;
    }
    case 'prompt':
    default: {
      const q = (params.prompt || '').trim().slice(0, 120);
      return q
        ? `Demo mode: Example answer for: "${q}". Enable AI in Settings for real answers.`
        : 'Demo mode: Example answer. Enable AI in Settings for real answers.';
    }
  }
}

async function promptAI(prompt) {
  try {
    if (typeof LanguageModel !== 'undefined') {
      const availability = await LanguageModel.availability();

      if (availability === 'readily' || availability === 'available') {
        try {
          const session = await LanguageModel.create({
            language: 'en',
            outputLanguage: 'en',
            output: { language: 'en' },
            temperature: 0.7,
            topK: 40
          });
          const result = await session.prompt(prompt);
          session.destroy();
          return result;
        } catch (err) {
          throw err;
        }
      }
    }

    await simulateDelay();

    if (prompt.toLowerCase().includes('describe this image')) {
      return demoResponse('image');
    }

    return demoResponse('prompt', { prompt });

  } catch (error) {
    throw error;
  }
}

async function generateSimilarLinks(pageTitle, pageDescription, pageUrl) {
  try {
    const systemPrompt = `You are an expert research assistant that recommends high-quality, relevant online resources. Your task is to suggest 7-10 similar resources based on the given webpage information.

IMPORTANT RULES:
1. Provide ONLY real, well-known, reputable websites and resources
2. Focus on educational, official, and authoritative sources
3. Include variety: articles, documentation, tools, communities, tutorials
4. Each recommendation must include:
   - Title: Clear, descriptive title
   - URL: Full, fully qualified valid URL (must start with https://)
   - Description: 1-2 sentence description of what the resource offers
5. Prefer stable, canonical URLs (avoid tracking params, session IDs, redirects)
6. If suggesting GitHub repos, use the repo root URL; for docs, use the canonical docs URL
7. Format EXACTLY as: TITLE|||URL|||DESCRIPTION (separated by |||)
8. NO numbered lists, NO markdown, JUST the formatted entries
9. One entry per line`;

    const userPrompt = pageUrl
      ? `Find 7-10 similar resources related to this webpage:

Title: ${pageTitle}
Description: ${pageDescription || 'N/A'}
URL: ${pageUrl}

Recommend similar, high-quality resources that would be valuable to someone interested in this topic. Include official docs, tutorials, tools, communities, and educational content.`
      : `Find 7-10 high-quality resources related to this topic:

Topic: ${pageTitle}

Recommend valuable resources including official documentation, tutorials, tools, communities, articles, and educational content that would help someone learn about or work with this topic.`;

    let response;

    if (typeof LanguageModel !== 'undefined') {
      const availability = await LanguageModel.availability();

      if (availability === 'readily' || availability === 'available') {
        try {
          const session = await LanguageModel.create({
            language: 'en',
            outputLanguage: 'en',
            output: { language: 'en' },
            temperature: 0.7,
            topK: 40
          });
          const fullPrompt = systemPrompt + '\n\n' + userPrompt;
          response = await session.prompt(fullPrompt);
          session.destroy();
        } catch (err) {
          // Continue to fallback
        }
      }
    }

    if (!response) {
      await simulateDelay();
      return demoResponse('similarLinks', { pageTitle });
    }

    return response;

  } catch (error) {
    throw error;
  }
}
