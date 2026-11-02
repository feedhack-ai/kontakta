# kontakta

A fictional CRM: a deals board in five stages, a contacts list and a contact
record with its activity. It is a demo product that
[feedhack](https://feedhack.ai) is shown on, so a visitor can ask for a change
and see it built on these pages.

Everything here is made up. The companies, people, emails, phone numbers and
amounts are fictional, and any resemblance to a real business is accidental.
There is no backend: records live in memory and reset on reload.

## Run

```
npm ci
npm run dev -- --host --port 5173
```

Dates are counted back from today, so the same deals look quiet whenever it
runs. Deal cards carry `data-deal`, `data-amount`, `data-probability`,
`data-stage`, `data-owner`, `data-close-date` and `data-last-activity`; stage
columns have ids (`stage-<id>`) and the board, contacts table, sidebar and top
bar have ids too, so a change built on the page has something stable to
attach to.
