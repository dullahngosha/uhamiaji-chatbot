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

Start the AI API with `start-ai.ps1`, serve this folder over HTTP, then open:

```text
http://127.0.0.1:8080/admin.html
```

Enter the admin token shown by `start-ai.ps1`. The admin page can:

- upload PDF documents;
- activate or deactivate a document;
- set or clear an expiry date;
- permanently delete a document;
- rebuild and reload the search index without stopping chat requests.

Expired and inactive documents are automatically excluded the next time the
index is rebuilt. Keep `.local/admin-token.txt` private; it is ignored by Git.

For one-click local access, run `open-admin.ps1`. It starts the local static
server when necessary, opens the admin page, signs in from the private local
token, and immediately removes the token from the browser address bar.
