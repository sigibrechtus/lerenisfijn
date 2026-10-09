# Frit’Academy

A bilingual NL/FR restaurant game for ages 6–10 in the separate **Spelletjes** suite section. No ads, countdowns, purchases, public leaderboard, or required login.

## Play loop

Choose a chef nickname → open a six-order shift or a dedicated station → prepare the customer's requested ingredients → check the preparation → retry with supportive hints if needed → serve → save the learning event → meet the next customer. Leaving a shift keeps every completed order. In-progress ingredients are not saved.

The counter is the answer surface: actual carton contents, sauce portions, letter labels, cash-tray contents and cooking times determine whether an order can be served. Pointer dragging and equivalent tap/keyboard controls share the same operations.

## Learning stations

| Station | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| Fries | Count 4–10 individual fries | Decompose 11–19 into ten and a remainder | Fill 2–4 equal cartons: grouping and multiplication |
| Sauce | Complete repeating ketchup/mayonnaise patterns | Fill equal portions using halves and quarters | Scale 1:2 and 1:3 sauce ratios |
| Words | Copy and construct short NL/FR food words | Listen and construct longer ingredient words | Construct longer words with two distractor letters |
| Cash | Exact whole-euro payments | Exact euro/cent payments | Return change from €5, €10 or €20 |
| Time | Read an analog whole-hour clock into a digital one | Add 5–25 minutes of cooking time | Subtract cooking time from the requested serving time |

Six same-level completed orders form a proficiency window per station. Five independent first-attempt successes advance the level; two or fewer lower it by one (bounded 1–3). Help and retries are explicitly recorded. Every completed order contributes to earned decorations, recipes, customer characters and location themes; badges require six independent successes in each station. Clicking or replaying a served order does not grant another event.

## Architecture and persistence

- `engine.js`: pure generators, answer validation, progression and event merging, usable in Node tests.
- `app.js`: bilingual UI, local profiles, pointer interactions, Web Audio cues, optional device speech, and opt-in cloud synchronization.
- `style.css`: responsive restaurant/characters and ingredient art, reduced-motion support.
- `sw.js`: caches only this game's same-origin assets, for offline play after first successful loading. Supabase requests and account credentials are never cached here.
- `database.sql`: private append-only events in `frit_academy_orders`, owned by the authenticated parent account using RLS. Read/insert/delete are owner-scoped; anonymous users have no access.

Local profiles use UUIDs and nicknames, not birth dates or email addresses. Optional cloud sync uses the suite's existing parent account. Fetch all remote events before uploading only missing event IDs; merge by immutable ID rather than replacing a snapshot. Repeated sync is idempotent and concurrent devices cannot erase each other's orders. The game has its own chef passport with first-six versus last-six independent success rates. Those are practice indicators, not validated school assessments. It does not mix sibling results into the suite's single-profile exercise-attempt statistics.

Progress is stored locally even when a synchronization attempt fails. Storage failures are shown and local JSON export is available. Account sign-out switches back to guest profiles. Speech availability depends on installed browser/device voices; the help action supplies a visible word when speech is unavailable. There is no cloud scoring authority or competitive leaderboard.

## Verification

`node --test tests/frit-academy.test.cjs` covers 30,000 generated tasks, all levels in both languages, invalid answers, adaptive progression, idempotent merges, mastery criteria and record validation. `node --check` checks both JS sources. The private database insert and ownership rejection were checked in a transaction and rolled back.

Browser interaction, layout and local persistence checks accompany deployment. Actual educational improvement, the 5–10 minute session estimate, and independent usability for ages 6–10 require supervised child testing; automated tests cannot establish those outcomes.
