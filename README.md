# Griha Pravesh · Aradhana & Yogesh

An animated, static housewarming invitation website for **Tuesday, 20 October 2026**: the carved doors open into the invitation, with falling petals, swaying lamps, a marigold toran, Lord Ganesha's blessing, soft flute music, a live countdown and an RSVP button wired to Google Forms.

No build step is needed. Open `index.html` in a browser, or host the folder anywhere that serves static files.

| File | What it is |
| --- | --- |
| `index.html` | Page content |
| `styles.css` | Design and animations |
| `script.js` | Door intro, petals, toran/vines, RSVP logic (**RSVP settings are at the top**) |
| `assets/ganesha.webp` | Watercolour Lord Ganesha shown after the doors open and at the top of the invitation (`.png` also works; hidden if missing) |
| `assets/flute.mp3` | Background flute music |
| `assets/invitation.webp` | The original printed invitation (linked in the footer and used for link previews) |

## RSVP: how it works

The **Please RSVP** button opens a popup with one of two modes:

1. **Embedded Google Form (default, works right now).** Your form
   `https://docs.google.com/forms/d/1I1H00tBmDb4M9JOXM1fsXmf5YRjnr3xZjHULZT5BkdY/viewform`
   loads inside the popup. Guests fill it in without leaving the site, and responses go directly into the form.
2. **Custom form that submits to Google Forms in the background.** This is a styled form that matches the invitation (name, phone, attending, guests, message). It posts to your Google Form's `formResponse` endpoint, so responses still appear in your form and its linked Sheet. It turns on automatically once you fill in the field IDs below.

There is always a fallback link to open the Google Form in a new tab.

### Connect the custom RSVP form

1. Open your form in edit mode, click **⋮ → Get pre-filled link**.
2. Type a dummy answer in every question (e.g. `NAME`, `PHONE`, choose an option, `2`, `MSG`), then click **Get link** and copy it.
3. The link contains pairs like `entry.1234567890=NAME`. Put each `entry.…` ID into `RSVP_CONFIG.fields` in `script.js`:

   ```js
   fields: {
     name: "entry.1234567890",
     phone: "entry.2345678901",
     attending: "entry.3456789012",
     guests: "entry.4567890123",
     message: "entry.5678901234",
   },
   answers: { yes: "Yes", no: "No" },  // must exactly match your "attending" options
   ```

   Leave a field as `""` if your form doesn't have that question. `name` and `attending` are required to turn the custom form on.
4. Check:
   * **Answer text matches exactly.** For a multiple-choice "attending" question, `answers.yes` / `answers.no` must be the option labels word for word.
   * **The form accepts anonymous responses.** In Settings → Responses, turn **off** "Restrict to users in your organisation" and "Collect email addresses: Verified". Sign-in-required forms can't accept background submissions.
   * **Required questions.** Every question marked required in the form must be one of the fields above, or Google silently rejects the submission. (When a guest declines, `guests` isn't sent, so don't make that question required.)
5. Submit a test RSVP from the site and confirm it shows up under **Responses** in your form.

> Why "silently"? Google Forms doesn't allow cross-site reads, so the site can confirm the request was sent but cannot read Google's reply. Test once after setup.

## Countdown

The countdown runs to 9:00 AM IST on 20 October 2026 (`EVENT_START` in `script.js`). From then until 2:30 PM it shows "The celebration is today!", and afterwards a thank-you. The "Add to Google Calendar" link adds the event from 9:00 AM to 2:30 PM IST.

## Background flute music

* Soft bansuri (flute) music in Raag Bhupali over a tanpura drone, `assets/flute.mp3`, loops in the background. It was composed and rendered for this site, so it's free to use.
* It starts with the tap that opens the doors. Browsers block sound until a visitor taps, so the doors wait for that tap rather than opening by themselves.
* The round button at the bottom right mutes or unmutes it, and the choice is remembered. The music pauses while the tab is in the background.
* To use different music, replace `assets/flute.mp3` (or change `CHANT.file` in `script.js`). `CHANT.volume` (0 to 1) sets the level on computers; phones play at the device volume.

## Host it for free (GitHub Pages)

1. Push these files to the `main` branch of a public repository, this one (`grih-pravesh`).
2. Repository **Settings → Pages → Build and deployment → Deploy from a branch**, choose `main` and `/ (root)`, then **Save**.
3. After a minute the site is live at `https://aradhana0.github.io/grih-pravesh/`. Share that link.

Netlify Drop (drag the folder onto app.netlify.com/drop) or Vercel work just as well.

## Accessibility

* Doors open on tap or Enter/Space.
* Visitors with "reduce motion" turned on skip the animations and see the invitation immediately.
* The address links to Google Maps.
