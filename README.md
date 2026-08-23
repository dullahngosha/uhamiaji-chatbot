# Uhamiaji AI chatbot

Embeddable Tanzania Immigration document assistant, powered by Ngosha Multimedia and NgoshaChatBot AI.

## Unified local app

Start the AI server once:

```powershell
.\start-ai.ps1
```

Then use the two connected pages on the same origin:

- Chatbot: `http://127.0.0.1:8765/`
- Admin: run `open-admin.ps1` or open `http://127.0.0.1:8765/admin.html`

The admin page writes to the same document registry and rebuilds the same index
used immediately by the chatbot page.

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
python server/build_index.py
```

## Run the local Ollama RAG API

Required local models:

```powershell
ollama pull gemma3:12b
ollama pull qwen3-embedding:0.6b
```

Start the API:

```powershell
.\start-ai.ps1
```

The health endpoint is `http://127.0.0.1:8765/health`. For a local website,
connect the widget with:

```html
<script
  src="https://cdn.jsdelivr.net/gh/dullahngosha/uhamiaji-chatbot@main/embed.js"
  data-uhamiaji-ai
  data-endpoint="http://127.0.0.1:8765/api/chat"
></script>
```

For public production use, expose the API only through an HTTPS reverse proxy
or authenticated tunnel, set `ALLOWED_ORIGINS` to the real website origin, and
replace the localhost endpoint with the public HTTPS API URL. The binary vector
index stays local and is intentionally excluded from Git.

## Manage chatbot documents

Start the unified app with `start-ai.ps1`, then open:

```text
http://127.0.0.1:8765/admin.html
```

Enter the admin token shown by `start-ai.ps1`. The admin page can:

- upload PDF documents;
- activate or deactivate a document;
- set or clear an expiry date;
- permanently delete a document;
- rebuild and reload the search index without stopping chat requests.

Expired and inactive documents are automatically excluded the next time the
index is rebuilt. Keep `.local/admin-token.txt` private; it is ignored by Git.

For one-click local access, run `open-admin.ps1`. It opens the admin page on the
same server as the chatbot, signs in from the private local token, and
immediately removes the token from the browser address bar.

## Online deployment shape

Deploy this FastAPI application and Ollama on the same private GPU server (or
point `OLLAMA_BASE_URL` at a private Ollama service). The public HTTPS host then
serves all of these from one domain:

- `/` — chatbot website;
- `/admin.html` — protected document manager;
- `/api/chat` — RAG chat API;
- `/api/admin/*` — token-protected document/index API.

Set `ALLOWED_ORIGINS` to the production HTTPS origin and keep `ADMIN_TOKEN`
private. The frontend already uses same-origin API routes, so no localhost URL
needs to be shipped to public visitors.
