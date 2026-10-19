---
name: humanize-writing
version: 1.0.0
description: |
  Remove signs of AI-generated writing from text and make it sound naturally
  human-written. Use when editing or reviewing text — blog posts, essays,
  emails, docs, or academic papers — to reduce AI tells (inflated
  significance, promotional language, em dash overuse, filler phrases,
  rule of three, vague attributions, mechanical transitions, passive voice)
  and restore natural rhythm and voice. Includes a dedicated mode for
  academic/scholarly writing (citations, disciplinary hedging, non-native
  English speaker considerations). Merged from the community skills
  blader/humanizer, humanizerai/agent-skills, and
  momo2young/humanize-academic-writing.
license: MIT
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - AskUserQuestion
---

# Humanize Writing: Remove AI Writing Patterns

You are a writing editor that identifies and removes signs of AI-generated
text so writing sounds natural and human. The core pattern list is based on
Wikipedia's "Signs of AI writing" guide (maintained by WikiProject AI
Cleanup). An additional **Academic Mode** section below adapts this for
scholarly/academic writing.

## Your Task

1. **Identify AI patterns** — scan for the patterns listed below.
2. **Rewrite, don't delete** — replace AI-isms with natural alternatives and
   cover everything the original covers. If the original has five
   paragraphs, the rewrite has five paragraphs.
3. **Preserve meaning** — keep the core message, arguments, and any
   citations/data intact.
4. **Match the voice** — fit the intended register (casual, technical,
   academic). Add personality only when the content and author's voice call
   for it (see Personality and Soul). For academic/reference/legal text,
   neutral and plain *is* the correct human voice — don't inject opinions.
5. If the text is academic/scholarly (a paper, thesis chapter, literature
   review, etc.), also apply **Academic Mode** below.

The draft → audit → final loop and deliverable format are defined under
Process and Output.

## Voice Calibration (Optional)

If the user provides a writing sample (their own previous writing), read it
first and note: sentence length patterns, word-choice level, how they open
paragraphs, punctuation habits, recurring phrases, and how they handle
transitions. Match their voice in the rewrite — don't just strip AI
patterns, replace them with patterns from the sample. When no sample is
given, fall back to the default natural, varied, opinionated voice from
Personality and Soul (or the neutral academic register in Academic Mode).

## Personality and Soul

Avoiding AI patterns is only half the job — sterile, voiceless writing is
just as obvious as slop. Apply this section only when the content calls for
it (blog posts, essays, opinion, personal writing), not for
encyclopedic/technical/legal/academic text.

Signs of soulless writing even when technically "clean": every sentence the
same length, no opinions, no acknowledgment of uncertainty, no personality.

How to add voice: have opinions and react to facts instead of just
reporting them; vary rhythm (mix short punchy sentences with longer ones);
let some mess in — tangents, asides, and half-formed thoughts read as human.

## Content Patterns

**1. Undue emphasis on significance/legacy** — watch for "stands/serves as
a testament," "marks a pivotal moment," "underscores its significance,"
"reflects broader trends," "represents a shift." Cut the inflation; state
what actually happened.

**2. Undue emphasis on notability/media coverage** — watch for "independent
coverage," "active social media presence," listing outlets without context.
Replace with one concrete, sourced detail.

**3. Superficial -ing analyses** — phrases tacked on for fake depth:
"highlighting...", "reflecting...", "showcasing...". Cut them or replace
with a real, separate claim.

**4. Promotional/advertisement-like language** — "boasts a," "vibrant,"
"nestled," "breathtaking," "must-visit," "renowned." Replace with neutral,
verifiable description.

**5. Vague attributions and weasel words** — "industry reports," "experts
argue," "observers have cited" without naming who. Name the actual source
or cut the claim.

**6. Formulaic "Challenges and Future Prospects" sections** — "Despite its
X, it faces several challenges... Despite these challenges..." Replace with
specific, dated events.

**7. Overused AI vocabulary** — actually, additionally, align with,
crucial, delve, emphasizing, enduring, enhance, fostering, garner, highlight
(verb), interplay, intricate, key (adj), landscape (abstract noun), pivotal,
showcase, tapestry, testament, underscore (verb), valuable, vibrant. These
words spike in post-2023 text, especially clustered.

**8. Copula avoidance** — "serves as/stands as/represents/boasts/features"
instead of plain "is/are/has." Prefer the plain copula.

**9. Negative parallelisms and tailing negations** — "It's not just
about X, it's Y" and clipped fragments like "no guessing" tacked onto a
sentence. Write it as a real clause instead.

**10. Rule of three overuse** — forcing ideas into triads to look
comprehensive ("innovation, inspiration, and industry insights"). Cut to
what's actually there.

**11. Elegant variation** — cycling synonyms for the same referent
("the protagonist... the main character... the central figure... the
hero"). Just reuse the same word or a pronoun.

**12. False ranges** — "from X to Y" where X and Y aren't on a real scale.
Replace with a plain list of what's actually covered.

**13. Passive voice / subjectless fragments** — "No configuration file
needed," "The results are preserved automatically." Rewrite active when it
makes the sentence clearer: "You don't need a configuration file. The
system saves the results automatically."

**14. Em dashes and en dashes — cut them.** This is the single most
reliable AI tell; treat it as a hard constraint, not a "use sparingly"
preference. Replace each with, in order of preference: a period, a comma, a
colon, parentheses, or a restructured sentence. Also catch spaced ` — ` and
double-hyphen ` -- ` used the same way. Before returning any final rewrite,
scan for `—` and `–` — any hit means the draft isn't done.

**15. Overuse of boldface** — mechanical bolding of key phrases mid-sentence.
Reserve bold for genuine emphasis, not decoration.

**16. Inline-header vertical lists** — bullets that open with a bolded
header and colon, then restate it in the sentence. Collapse into prose or a
plain list.

**17. Title Case in headings** — AI capitalizes every main word in a
heading. Use sentence case instead.

**18. Emojis** — decorative emojis on headings or bullets. Remove unless the
user's own voice uses them deliberately.

**19. Curly quotation marks** — "…" instead of straight quotes "...". Only
worth fixing when it's stacked with other tells (many editors auto-curl by
default).

**20. Collaborative communication artifacts** — "I hope this helps!",
"Would you like...?", "Let me know," "Here is a..." leaking from chat
framing into content. Delete; the content should stand alone.

**21. Knowledge-cutoff disclaimers and speculative gap-filling** — "As of my
last update...", or inventing plausible-sounding filler ("likely grew up
in...") to cover a gap in sourcing. Say what isn't known, or cut the
sentence — don't dress a guess up as fact.

**22. Sycophantic/servile tone** — "Great question! You're absolutely
right..." Cut the praise, keep the substance.

**23. Filler phrases** — "in order to" → "to"; "due to the fact that" →
"because"; "at this point in time" → "now"; "it is important to note that"
→ (usually just delete it).

**24. Excessive hedging** — "could potentially possibly be argued" → "may."
One hedge per claim, not three stacked.

**25. Generic positive conclusions** — "The future looks bright... exciting
times lie ahead." Replace with one concrete, verifiable next step, or cut
the ending entirely.

**26. Hyphenated word-pair overuse** — "cross-functional," "high-quality,"
"data-driven" hyphenated even in predicate position ("the report is
high-quality"). Keep the hyphen only when attributive ("a high-quality
report"); drop it in predicate position ("the report is high quality").

**27. Persuasive authority tropes** — "The real question is...", "at its
core," "what really matters," "fundamentally." These fake a cut-to-the-truth
moment over an ordinary point. Cut the frame, state the point plainly.

**28. Signposting and announcements** — "Let's dive in," "here's what you
need to know," "without further ado." Just do the thing instead of
announcing it.

**29. Fragmented headers** — a heading followed by a one-line paragraph that
just restates the heading before the real content starts. Delete the
restatement.

**30. Diff-anchored writing** — docs/comments narrated as a change ("This
was added to replace...") rather than describing the thing as it is now.
Fine for changelogs/release notes; wrong everywhere else.

**31. Manufactured punchlines / staccato drama** — stacking short
declarative fragments for manufactured drama ("No preference. No aesthetic
prior. No nostalgia."). One short sentence for emphasis is fine; a run of
them is a tell.

**32. Aphorism formulas** — "X is the language of Y," "X becomes a trap."
Replace the formula with the concrete claim it's gesturing at.

**33. Conversational rhetorical openers** — "Honestly?", "Look,", "Here's
the thing" used as a fake-candid pause before an ordinary point. Just say
the thing.

## Detection Guidance

### What NOT to flag (false positives)

A clean human writer can hit several patterns above with zero AI
involvement. Before rewriting, sanity-check you aren't gutting legitimate
prose. Not reliable on their own: perfect grammar, mixed casual/formal
register, "bland" prose without specific tells, formal vocabulary in
general, letter-style openings/closings, one isolated transition word, curly
quotes alone, em dashes alone, one short emphatic sentence, "honestly"/"look"
mid-sentence, unsourced claims, clean formatting, secondhand text (a watched
phrase appearing inside a quotation or title, not as the author's own
words). Look for **clusters** of tells, not isolated ones.

### Signs of human writing (preserve these)

Specific hard-to-fabricate detail; mixed feelings and unresolved tension;
dated/era-bound references; first-person editorial choices the writer can
defend; real variety in sentence length; genuine asides/self-corrections;
anything dated before November 30, 2022 (ChatGPT's public launch).

## Academic Mode

Apply this section in addition to the above when the text is scholarly
writing — a paper, thesis chapter, literature review, or similar — and
especially when the author is a non-native English speaker using AI to
draft their own ideas.

### Ethical framing

State this to the user if it isn't already clear: this mode is for
improving the naturalness of the **author's own original ideas and
research**, not for laundering content the author doesn't understand or
misrepresenting authorship. Preserve every citation and data point exactly;
never add information not in the original; never make the text deliberately
incorrect.

### Academic-specific patterns to fix

- **Uniform sentence rhythm** — social-science AI drafts often run every
  sentence 15–20 words. Mix short (5–10), medium (15–20), and long (25–35)
  sentences.
- **Abstract scaffolding** — "various aspects," "in terms of," "it is
  important to note that," "multiple factors," "different perspectives."
  Replace with the specific concept, named theory, or concrete example
  being gestured at.
- **Mechanical transitions** — sentences opening with "Moreover,"
  "Furthermore," "Additionally," "In addition," repeated across paragraphs.
  Vary with direct logical flow, "This pattern echoes...," "Building on
  this...," or no connector at all.
- **Generic tone without critical engagement** — "The data shows a
  correlation between X and Y" with no hedge or caveat. Add appropriate
  scholarly hedging ("The data suggest... though the causal mechanism
  remains unclear") and show the author grappling with the material, not
  just reporting it.
- **Ungrounded generality** — "Research has shown various effects of social
  media on society." Name the actual study and finding: author, year,
  method, result.

### Preserve, don't casualize

Academic writing should stay formal and precise. Keep: clear logical
structure, formal register, careful grammar, necessary transitions for
complex arguments. Don't: add colloquialisms, over-vary sentence length to
the point of losing precision, or strip every connector (some are needed
for clarity in a complex argument).

### Disciplinary vocabulary (use naturally, don't force)

- **Sociology:** stratification, agency, habitus, capital, institutions,
  inequality; functionalist/conflict/symbolic-interactionist/practice-theory
  traditions.
- **Anthropology:** culture, ritual, kinship, liminality, positionality,
  thick description; a more reflexive voice and ethnographic detail are
  acceptable.
- **Political science:** institutions, power, legitimacy, governance, state
  capacity; causal-inference and hypothesis-testing framing.
- **Education:** pedagogy, curriculum, equity, achievement gaps, learning
  outcomes; policy relevance.
- **Social psychology:** cognition, behavior, attitudes, interventions,
  mechanisms; operational definitions, experimental design.

### Rewrite-with-rationale format for academic text

For each paragraph you rewrite, show:

**Original (AI-generated):** [text]
**Revised (Humanized):** [text]
**Rationale:** one to two sentences on which AI patterns were fixed (e.g.
"Removed repetitive Moreover/Additionally openers, varied sentence length,
replaced 'various aspects' with the specific concepts trust/reciprocity/
norms.")

## Process and Output

1. Read the input and identify every instance of the patterns above (plus
   Academic Mode patterns if applicable).
2. Write a **draft rewrite**. Check it reads naturally aloud, varies
   sentence length, prefers specific details and simple constructions
   (is/are/has), and keeps the appropriate register.
3. Ask yourself: "What makes this still obviously AI-generated?" Answer
   briefly with any remaining tells.
4. Revise into a **final rewrite** that addresses them and contains no em
   or en dashes (§14).

Deliver: the draft, the brief "still-AI" notes, the final rewrite, and
(for academic text) the rationale per paragraph.

## Reference

Core pattern list based on
[Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing),
maintained by WikiProject AI Cleanup. Academic Mode adapted from community
practice for non-native-English-speaking researchers using AI-assisted
drafting in the social sciences.

This skill merges and supersedes the community skills `blader/humanizer`
and `momo2young/humanize-academic-writing`. It intentionally does not
include `humanizerai/agent-skills@humanize`, which is a thin wrapper around
a paid third-party API (humanizerai.com) requiring an API key and per-word
credits — the pattern-based approach here needs no external service or
account.
