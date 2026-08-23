# Uhamiaji AI chatbot

Embeddable Tanzania Immigration document assistant, powered by Ngosha Multimedia and NgoshaChatBot AI.

## Preview

Serve this directory over HTTP and open `index.html`.

```powershell
python -m http.server 8080
```

## Embed on a website

Copy `embed.js`, `widget.css`, `data/`, and `documents/` to the same public directory, then add:

```html
<script src="/uhamiaji-ai/embed.js" data-uhamiaji-ai></script>
```

Or load the public GitHub version through jsDelivr:

```html
<script
  src="https://cdn.jsdelivr.net/gh/dullahngosha/uhamiaji-chatbot@main/embed.js"
  data-uhamiaji-ai
></script>
```

Use `data-open="true"` to open the panel on page load.

The widget detects the question language automatically. To connect the local
document search to a multilingual LLM backend, provide an endpoint that accepts
`{ message, language, context }` and returns `{ answer, source, page }`:

```html
<script
  src="/uhamiaji-ai/embed.js"
  data-uhamiaji-ai
  data-endpoint="/api/uhamiaji-chat"
></script>
```

## Rebuild the document index

Place official PDFs in `documents/`, then run:

```powershell
python tools/ingest_documents.py
```

The browser index is a local preview search layer. For production, connect the same chunks to the local Ollama RAG API so answers are generated, cited, rate-limited, and logged securely.
