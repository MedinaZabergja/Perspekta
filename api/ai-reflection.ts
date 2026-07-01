const FREE_MODELS = [
  'google/gemma-4-31b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek/deepseek-v4-flash:free',
];

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Perspekta AI reflection server is running with OpenRouter',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  let body = req.body;

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({
        error: 'Invalid JSON body',
      });
    }
  }

  const { thought, evidence = [], balancedPerspective } = body || {};

  console.log('AI request received:', {
    thought,
    evidence,
    balancedPerspective,
    hasOpenRouterKey: Boolean(process.env.OPENROUTER_API_KEY),
  });

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({
      error: 'Missing OPENROUTER_API_KEY',
    });
  }

  if (!thought || !balancedPerspective) {
    return res.status(400).json({
      error: 'Missing reflection data',
    });
  }

  const prompt = `You are Perspekta, a supportive but logical reflection assistant.

Your role is to help the user reframe a difficult thought in a calm, grounded way. You are warm, kind, and encouraging, but you do not coddle the user, exaggerate reassurance, or pretend everything is fine.

You follow therapist-informed communication standards:
- Validate emotions without diagnosing.
- Challenge distorted or extreme thinking gently.
- Encourage realistic, balanced thinking.
- Do not replace therapy or claim to be a therapist.
- If the user seems in serious danger, encourage them to contact a trusted person or emergency support.

User's difficult thought:
"${thought}"

Evidence the user provided:
${Array.isArray(evidence) && evidence.length > 0 ? evidence.join(', ') : 'their own observations'}

Their balanced perspective:
"${balancedPerspective}"

Write exactly 6 short sentences directly to the user using "you."

Structure:
1. Briefly name and validate the emotion.
2. Gently point out where the thought may be too extreme, incomplete, or unsupported.
3. Use the user's evidence to create a more balanced perspective.
4. Encourage the user in a realistic way.
5. End with one small concrete action they can take today.

Tone:
- Comforting but not overly soft.
- Logical but not cold.
- Kind but honest.
- Encouraging but realistic.
- Therapist-informed, but not pretending to be therapy.

Avoid:
- "Everything will be fine."
- "You are perfect."
- "You are enough."
- "Just be positive."
- Toxic positivity.
- Harsh criticism.
- Diagnosis.
- Medical or therapy claims.
- Emojis.
- Exclamation marks.
- Code.
- HTML.
- JSON.
- Random symbols.
- Non-English text unless the user wrote in that language.

Return only the final reflection. Do not include labels, markdown, notes, explanations, or formatting.`;

  let lastError: any = null;

  for (const model of FREE_MODELS) {
    try {
      console.log(`Trying model: ${model}`);

      const referer = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:5173';

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': referer,
          'X-Title': 'Perspekta',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 220,
          temperature: 0.3,
          top_p: 0.8,
        }),
      });

      const data = await response.json();
      console.log(`Model ${model} — Status: ${response.status}`);

      if (!response.ok) {
        console.log(`Model ${model} failed:`, data.error?.message || JSON.stringify(data));
        lastError = { model, status: response.status, details: data };
        continue;
      }

      let rawText = data?.choices?.[0]?.message?.content?.trim() || '';
      console.log(`Raw output from ${model}:`, rawText);

      rawText = cleanAIText(rawText);

      const sentenceMatches = rawText.match(/[^.!?]+[.!?]+/g);
      let sentences: string[] = [];

      if (sentenceMatches && sentenceMatches.length >= 3) {
        sentences = sentenceMatches
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 15)
          .slice(0, 6);
      } else {
        sentences = rawText
          .split(/\n+/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 15)
          .slice(0, 6);
      }

      sentences = sentences.map((s) =>
        s
          .replace(/^[^a-zA-Z]+/, '')
          .replace(/\s+/g, ' ')
          .replace(/!/g, '.')
          .trim()
      );

      sentences = sentences.map((s) => {
        if (!s.match(/[.!?]$/)) return s + '.';
        return s;
      });

      let formattedReflection = sentences.join(' ');

      if (isCorruptedOutput(formattedReflection)) {
        console.log('Corrupted AI output detected. Trying next model.');
        lastError = { model, error: 'Corrupted AI output' };
        continue;
      }

      while (sentences.length < 6) {
        const fallbacks = generateSmartFallbacks(thought, evidence, balancedPerspective);
        sentences.push(fallbacks[sentences.length] || fallbacks[fallbacks.length - 1]);
        formattedReflection = sentences.join(' ');
      }

      console.log('Formatted reflection:', formattedReflection);

      return res.status(200).json({
        aiReflection: formattedReflection,
        modelUsed: model,
      });
    } catch (error) {
      console.error(`Model ${model} threw exception:`, error);
      lastError = { model, error: String(error) };
      continue;
    }
  }

  console.error('All models failed. Using fallback.', lastError);

  const fallbackReflection = generateSmartFallbacks(
    thought,
    evidence,
    balancedPerspective
  ).join(' ');

  return res.status(200).json({
    aiReflection: fallbackReflection,
    modelUsed: 'fallback',
    warning: 'AI models unavailable or returned corrupted output. Using generated reflection.',
  });
}

function cleanAIText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[*#_`~]/g, '')
    .replace(/\{[\s\S]*?\}/g, '')
    .replace(/\[[\s\S]*?\]/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/everything will be fine/gi, '')
    .replace(/you are perfect/gi, '')
    .replace(/you are enough/gi, '')
    .replace(/just be positive/gi, '')
    .replace(/as a therapist/gi, '')
    .replace(/i am a therapist/gi, '')
    .replace(/diagnosis/gi, '')
    .replace(/structure:/gi, '')
    .replace(/tone:/gi, '')
    .replace(/avoid:/gi, '')
    .replace(/write exactly/gi, '')
    .replace(/user's difficult thought/gi, '')
    .replace(/evidence the user provided/gi, '')
    .replace(/their balanced perspective/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isCorruptedOutput(text: string): boolean {
  const corruptionIndicators = [
    'import ',
    'export ',
    'package ',
    'const ',
    'let ',
    'function ',
    'DOCTYPE',
    'html>',
    'JSON',
    'HTTP',
    'shell',
    'Observer',
    'System.',
    'message:',
    'error:',
    'npm',
    'node_modules',
    'undefined',
    'null',
    '中国',
    '操作方法',
    '完整',
    '預定',
    '语句',
    '原理',
    '#',
    '$',
    '<',
    '>',
    '{',
    '}',
    '[',
    ']',
  ];

  if (!text || text.length < 80) return true;

  return corruptionIndicators.some((term) =>
    text.toLowerCase().includes(term.toLowerCase())
  );
}

function generateSmartFallbacks(
  thought: string,
  evidence: string[],
  balancedPerspective: string
): string[] {
  const thoughtLower = thought.toLowerCase();

  const evidenceText =
    Array.isArray(evidence) && evidence.length > 0
      ? evidence.join(', ')
      : balancedPerspective;

  const isNotGoodEnough =
    thoughtLower.includes('not good enough') || thoughtLower.includes('not enough');

  const isAlwaysNever =
    thoughtLower.includes('always') ||
    thoughtLower.includes('never') ||
    thoughtLower.includes('everyone') ||
    thoughtLower.includes('no one');

  const isFailure =
    thoughtLower.includes('fail') ||
    thoughtLower.includes('failure') ||
    thoughtLower.includes('worthless') ||
    thoughtLower.includes('useless');

  const isAnxiety =
    thoughtLower.includes('worried') ||
    thoughtLower.includes('anxious') ||
    thoughtLower.includes('scared') ||
    thoughtLower.includes('afraid');

  const isAnger =
    thoughtLower.includes('angry') ||
    thoughtLower.includes('hate') ||
    thoughtLower.includes('mad');

  if (isNotGoodEnough) {
    return [
      'You seem discouraged and unsure of yourself right now.',
      'That feeling matters, but it is not proof that you are not good enough.',
      `The evidence you gave points to a more balanced view: ${evidenceText}.`,
      'A hard moment can make your mind ignore signs of effort, progress, or ability.',
      'A more realistic thought is that you are struggling with something specific, not failing as a person.',
      'Today, write down one thing you handled adequately and one thing you can improve next.',
    ];
  }

  if (isAlwaysNever) {
    return [
      'You seem overwhelmed, and your mind is using very absolute language.',
      'Words like always, never, everyone, and no one can make a situation sound more final than it is.',
      `Your own evidence gives the situation more nuance: ${evidenceText}.`,
      'That means the thought may contain real emotion, but it is not fully accurate.',
      'A more balanced view is that this situation is difficult, but not completely fixed or hopeless.',
      'Today, find one exception to the absolute thought and write it down clearly.',
    ];
  }

  if (isFailure) {
    return [
      'You seem to be judging yourself very harshly right now.',
      'That judgment may feel convincing, but it is broader than the evidence supports.',
      `The evidence you gave shows another side of the situation: ${evidenceText}.`,
      'One mistake, setback, or painful moment does not define your whole ability.',
      'A more balanced view is that you are facing a problem, not that you are the problem.',
      'Today, choose one small task you can complete to create evidence of movement.',
    ];
  }

  if (isAnxiety) {
    return [
      'You seem anxious, and your mind is trying to predict what could go wrong.',
      'That reaction is understandable, but predictions are not the same as facts.',
      `The evidence you gave creates a calmer picture: ${evidenceText}.`,
      'Anxiety often focuses on the worst outcome and makes other possibilities harder to see.',
      'A more balanced view is that something may be uncertain, but it is not automatically unsafe or doomed.',
      'Today, write one worry, one fact, and one action you can take next.',
    ];
  }

  if (isAnger) {
    return [
      'You seem angry, and that may be pointing to something important.',
      'Anger can show that a boundary, need, or expectation matters to you.',
      `The evidence you gave helps slow the situation down: ${evidenceText}.`,
      'The feeling deserves attention, but the first reaction is not always the clearest response.',
      'A more balanced view is that you can respect the feeling without letting it choose your next move.',
      'Today, wait ten minutes before responding and write the main point you want to communicate.',
    ];
  }

  return [
    'You seem to be carrying a difficult thought right now.',
    'That feeling is real, but the thought may not be the full truth.',
    `The evidence you gave points to a more balanced view: ${evidenceText}.`,
    'A painful thought can feel like a fact when emotions are strong.',
    'A more grounded perspective is that this situation has more than one possible interpretation.',
    'Today, take one small action that matches the balanced perspective you already wrote.',
  ];
}