# Start here

A code version of the Figma screens you can click, re-style and animate in a
browser. Six steps, once, and it runs on your own Mac. No coding needed to get
it going.

## 1. Make your own copy

Accept the GitHub invite in your email. Open the repo, click the green **Use
this template**, then **Create a new repository**. Name it whatever you like.

You now have a completely separate copy — change anything, break anything, the
original is untouched.

## 2. Install Node.js

Download the **LTS** version from <https://nodejs.org> and accept every default.
One time only; it's the engine the sandbox runs on.

## 3. Install GitHub Desktop

Get it from <https://desktop.github.com> and sign in. Saves you typing git
commands.

## 4. Download your copy

GitHub Desktop → **File → Clone repository** → pick the repo you made in step 1
→ **Clone**.

## 5. Run two commands

GitHub Desktop → **Repository → Open in Terminal**, then:

```bash
npx pnpm@10 install   # first time only, about a minute
npx pnpm@10 dev       # every time you want the sandbox
```

If it asks `Ok to proceed? (y)`, press Enter. Leave the window open — closing it
stops the sandbox.

## 6. Open it

The terminal prints an address, usually <http://localhost:3000>. Open it and
click the **Design Sandbox** card. Read the address from the terminal rather
than assuming — the number shifts if something else already uses port 3000.

## What you should see

- The screen opens on the **Mobile** frame, a true 390 x 844.
- **Desktop / Mobile** and **Dark / Light** toggles in the top bar.
- A **motion panel** on the right: pick an element, pick an effect, copy the CSS out.
- Light mode is a first draft, not a checked design — see `FIDELITY_REPORT.md`.

## Day to day

- **Start again later:** Open in Terminal → `npx pnpm@10 dev`. Step 5's first
  command never needs running twice.
- **Stop it:** click the terminal, press `Ctrl + C`.
- **See your edits:** save a file; the browser updates itself.

Once you're comfortable, `README.md` explains how the whole thing is put
together.
