/* =====================================================================
   V Kedar's Command Center — video manifest

   THIS IS THE ONLY FILE YOU EDIT TO ADD OR CHANGE VIDEOS.
   One entry per video. Order does not matter; the site sorts by date,
   then by seq inside a day, then by title.

   Easiest way to add one from the Mac (copies the file, makes the poster,
   fills in duration and aspect, appends the entry here):

     python3 scripts/ingest.py path/to/clip.mp4 --title "…" --project "…" [--notes "…"] [--tags a,b]

   Fields
     title     what to call it
     file      path to an mp4 in this repo, e.g. "videos/clip.mp4"
     poster    optional jpg shown in the grid before play ("videos/posters/clip.jpg")
     duration  optional length in seconds (shown as a badge and summed in the stats)
     date      "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM", when it was made
     seq       optional number that orders entries sharing the same date (episode number)
     project   which series or system produced it (becomes a filter)
     tags      optional list of words (become filters)
     notes     optional, what this one is about or what changed
     aspect    optional "9:16" for Shorts or "16:9" for landscape; default below

   Instead of file you can use
     youtube   any YouTube link (watch, youtu.be, shorts) or just the 11-char id
     drive     a Google Drive file link or id (shared as "anyone with link")

   Commas between entries. Quotes around text. That's it.
   ===================================================================== */
window.COMMAND_CENTER = {
  owner: "V Kedar",
  tagline: "Every video, in the order it happened. Short films, sports stories and small experiments, most of them made with AI in the loop.",
  defaultAspect: "9:16",

  videos: [
    /* ---------- September 8, 2026 ---------- */
    {
      title: "Ticker.exe, episode 0: the launch",
      file: "videos/ticker-exe-launch.mp4", poster: "videos/posters/ticker-exe-launch.jpg", duration: 51,
      date: "2026-09-08T02:37", seq: 1,
      project: "Ticker.exe",
      tags: ["markets", "simulated", "series"],
      notes: "A show about a simulated $1M portfolio: a passive core and an AI-managed sleeve, marked daily against SPY. Nothing in it is real money.",
    },
    {
      title: "Ticker.exe: the September 8 mark",
      file: "videos/ticker-exe-2026-09-08.mp4", poster: "videos/posters/ticker-exe-2026-09-08.jpg", duration: 52,
      date: "2026-09-08T02:37", seq: 2,
      project: "Ticker.exe",
      tags: ["markets", "simulated", "series"],
      notes: "First daily episode. The engine runs the portfolio cycle and writes a ledger; the render turns the ledger into narration and a video.",
    },
    {
      title: "420 particles find a word",
      file: "videos/particles-build.mp4", poster: "videos/posters/particles-build.jpg", duration: 9,
      date: "2026-09-08T03:53",
      project: "Experiments",
      tags: ["generative", "experiment"],
      notes: "A single-file generative piece. Particles start as noise and self-organize into a word; every frame drawn in Pillow, ffmpeg only assembles.",
    },
    {
      title: "The impossible instrument",
      file: "videos/impossible-instrument.mp4", poster: "videos/posters/impossible-instrument.jpg", duration: 6,
      date: "2026-09-08T04:57",
      project: "Experiments",
      tags: ["music", "experiment"],
      notes: "A six-second cut of an organ. Output only: whatever produced it was never saved, so this is the one copy.",
    },
    {
      title: "Vik's Picks, Week 1: four AI models pick every NFL game",
      file: "videos/viks-picks-week1.mp4", poster: "videos/posters/viks-picks-week1.jpg", duration: 118,
      date: "2026-09-08T08:04",
      project: "Vik's Picks",
      tags: ["nfl", "ai", "picks", "series"],
      notes: "Four models make independent straight-up picks for every Week 1 game. Winners only: no spreads, no odds. This copy is a 720p encode of the 102 MB upload master.",
    },
    {
      title: "My editor did not survive",
      file: "videos/viks-picks-my-editor-did-not-survive.mp4", poster: "videos/posters/viks-picks-my-editor-did-not-survive.jpg", duration: 43,
      date: "2026-09-08T22:06",
      project: "Vik's Picks",
      tags: ["nfl", "short"],
      notes: "A surprise short spun off the Week 1 build.",
    },

    /* ---------- September 9, 2026 ---------- */
    {
      title: "Guess the price: Cattelan's Comedian (2024)",
      file: "videos/gtp-cattelan-comedian-2024.mp4", poster: "videos/posters/gtp-cattelan-comedian-2024.jpg", duration: 53,
      date: "2026-09-09T14:44",
      project: "Guess the Price",
      tags: ["art", "auction", "shorts"],
      notes: "Show the work, force a choice between three prices, reveal the real one, convert it into Honda Civics. First episode off the render path; the dataset behind the series is still being verified.",
    },
    {
      title: "The Steelers cost $2,500",
      file: "videos/steelers-2500.mp4", poster: "videos/posters/steelers-2500.jpg", duration: 42,
      date: "2026-09-09T14:58",
      project: "Pittsburgh Stories",
      tags: ["pittsburgh", "nfl", "shorts"],
      notes: "Art Rooney bought an NFL franchise for $2,500 in 1933. Locked script, every claim sourced; the present-day valuation card is due a refresh before it goes public.",
    },

    // Money Math: every figure on screen is computed by engine/finance.py, not quoted.
    { title: "Why the minimum payment never moves your balance", file: "videos/money-math-ep01-minimum-payment.mp4", poster: "videos/posters/money-math-ep01-minimum-payment.jpg", duration: 55, date: "2026-09-09T16:56", seq: 1, project: "Money Math", tags: ["finance", "debt", "credit cards", "shorts"],
      notes: "At 24% APR the monthly interest rate is exactly 2%, so a 2% minimum payment pays the interest and nothing else. Computed at $5,000 and 24% APR with no new charges." },
    { title: "Starting 10 years earlier costs $24,000 and returns $280,000", file: "videos/money-math-ep02-ten-years-earlier.mp4", poster: "videos/posters/money-math-ep02-ten-years-earlier.jpg", duration: 52, date: "2026-09-09T16:56", seq: 2, project: "Money Math", tags: ["finance", "investing", "compound interest", "shorts"],
      notes: "Two people save the same $200 a month at the same 7%. One starts at 25, one at 35. The head start costs $24,000 in extra contributions and produces about $281,000 more by 65." },
    { title: "A 30-year mortgage costs $302,000 more than a 15-year one", file: "videos/money-math-ep03-fifteen-year-mortgage.mp4", poster: "videos/posters/money-math-ep03-fifteen-year-mortgage.jpg", duration: 59, date: "2026-09-09T16:56", seq: 3, project: "Money Math", tags: ["finance", "mortgage", "shorts"],
      notes: "On a $400,000 loan, a 30-year at 6.5% pays $510,178 in interest; a 15-year at 6.0% pays $207,577. The 15-year payment is $847 a month higher." },
    { title: "The Rule of 72: doubling time without a calculator", file: "videos/money-math-ep04-rule-of-72.mp4", poster: "videos/posters/money-math-ep04-rule-of-72.jpg", duration: 49, date: "2026-09-09T16:56", seq: 4, project: "Money Math", tags: ["finance", "mental math", "compound interest", "shorts"],
      notes: "Divide 72 by a rate and you get the years to double. Checked against the exact logarithm at 3, 6, 8, 10 and 12 percent; the shortcut is within a few months across the whole range." },
    { title: "Buying a 3-year-old car saves $10,434 over the same five years", file: "videos/money-math-ep05-new-car.mp4", poster: "videos/posters/money-math-ep05-new-car.jpg", duration: 44, date: "2026-09-09T16:56", seq: 5, project: "Money Math", tags: ["finance", "cars", "shorts"],
      notes: "A $40,000 car losing 20% the first year and 15% a year after drops $23,296 across five years. The same car bought at three years old and held five years loses $12,861." },
    { title: "Why a $5,000 raise at 25 is really worth $377,000", file: "videos/money-math-ep06-raise-compounds.mp4", poster: "videos/posters/money-math-ep06-raise-compounds.jpg", duration: 42, date: "2026-09-09T16:56", seq: 6, project: "Money Math", tags: ["finance", "career", "compound interest", "shorts"],
      notes: "Every future percentage raise is calculated on the new base. A $5,000 raise at 25, with 3% annual raises after it, is worth $377,006 by 65, before investing any of it." },
    { title: "Why $50,000 in a normal savings account loses $10,893", file: "videos/money-math-ep07-cash-inflation.mp4", poster: "videos/posters/money-math-ep07-cash-inflation.jpg", duration: 54, date: "2026-09-09T16:56", seq: 7, project: "Money Math", tags: ["finance", "inflation", "savings", "shorts"],
      notes: "0.5% interest against 3% inflation grows the number and shrinks the money. Over ten years $50,000 reads $52,558 on the statement and buys about $39,109." },
    { title: "The 4% rule: your retirement number in ten seconds", file: "videos/money-math-ep08-your-number.mp4", poster: "videos/posters/money-math-ep08-your-number.jpg", duration: 40, date: "2026-09-09T16:56", seq: 8, project: "Money Math", tags: ["finance", "retirement", "shorts"],
      notes: "Divide annual spending by 4%, or multiply by 25, and you have the portfolio the classic safe-withdrawal rule is built on. At $60,000 a year that is $1.5 million." },
    { title: "A 1% fee quietly takes about a fifth of your retirement", file: "videos/money-math-ep09-one-percent-fee.mp4", poster: "videos/posters/money-math-ep09-one-percent-fee.jpg", duration: 47, date: "2026-09-09T16:56", seq: 9, project: "Money Math", tags: ["finance", "investing", "fees", "shorts"],
      notes: "Two identical portfolios, 7% gross, $500 a month for 35 years. One pays 0.05% in fees, the other 1.00%. The difference costs $177,517, about 20% of the ending balance." },
    { title: "What 1.5 points of mortgage rate actually costs you", file: "videos/money-math-ep10-credit-score.mp4", poster: "videos/posters/money-math-ep10-credit-score.jpg", duration: 49, date: "2026-09-09T16:56", seq: 10, project: "Money Math", tags: ["finance", "mortgage", "credit score", "shorts"],
      notes: "A credit score decides what the loan costs more than whether you get it. On a $400,000 30-year mortgage, a 1.5-point spread is $408 a month and about $147,000 in interest." },
    { title: "A $35 overdraft fee is an interest rate of about 12,775%", file: "videos/money-math-ep11-overdraft-apr.mp4", poster: "videos/posters/money-math-ep11-overdraft-apr.jpg", duration: 45, date: "2026-09-09T16:56", seq: 11, project: "Money Math", tags: ["finance", "banking", "fees", "shorts"],
      notes: "A $35 fee to cover a $20 shortfall for five days is 175% of the amount borrowed. Annualized the way a card rate is quoted, that is roughly 12,775% APR." },
    { title: "Skipping the employer match costs $213K over 30 years", file: "videos/money-math-ep12-employer-match.mp4", poster: "videos/posters/money-math-ep12-employer-match.jpg", duration: 44, date: "2026-09-09T16:56", seq: 12, project: "Money Math", tags: ["finance", "retirement", "401k", "shorts"],
      notes: "A 50% match on the first 6% of a $70,000 salary is $2,100 of free money a year. Over 30 years at 7% the match alone compounds to $213,495." },
    { title: "No, a raise cannot push you into a bracket that costs you money", file: "videos/money-math-ep13-tax-bracket-myth.mp4", poster: "videos/posters/money-math-ep13-tax-bracket-myth.jpg", duration: 47, date: "2026-09-09T16:56", seq: 13, project: "Money Math", tags: ["finance", "taxes", "shorts"],
      notes: "Brackets apply to slices of income, not the whole thing. On illustrative 10/12/22/24% brackets, a $6,000 raise across the 24% line still keeps $4,600." },
    { title: "40% off plus 20% off is not 60% off", file: "videos/money-math-ep14-stacked-discounts.mp4", poster: "videos/posters/money-math-ep14-stacked-discounts.jpg", duration: 46, date: "2026-09-09T16:56", seq: 14, project: "Money Math", tags: ["finance", "mental math", "shorts"],
      notes: "Stacked discounts multiply. Forty percent off then twenty percent off a $200 item leaves $96, a 52% discount. The same arithmetic is why a 20% loss needs a 25% gain to recover." },
    { title: "A penny doubled every day for 30 days becomes $5.37M", file: "videos/money-math-ep15-doubling-penny.mp4", poster: "videos/posters/money-math-ep15-doubling-penny.jpg", duration: 43, date: "2026-09-09T16:56", seq: 15, project: "Money Math", tags: ["finance", "compound interest", "shorts"],
      notes: "One cent doubled daily reaches $5,243 by day 20 and $5,368,709 by day 30. Half the total arrives on the last day, which is what exponential growth looks like from the inside." },
    { title: "Your real hourly wage is lower than you think", file: "videos/money-math-ep16-real-hourly-wage.mp4", poster: "videos/posters/money-math-ep16-real-hourly-wage.jpg", duration: 42, date: "2026-09-09T16:56", seq: 16, project: "Money Math", tags: ["finance", "career", "shorts"],
      notes: "$75,000 over 2,080 hours is $36.06. Counting commute and prep as unpaid hours and subtracting what the job costs to hold, it works out to $28.75, about 20% lower." },
    { title: "Paying the highest rate first saves $2,697 on the same debts", file: "videos/money-math-ep17-avalanche-vs-snowball.mp4", poster: "videos/posters/money-math-ep17-avalanche-vs-snowball.jpg", duration: 51, date: "2026-09-09T16:56", seq: 17, project: "Money Math", tags: ["finance", "debt", "shorts"],
      notes: "Avalanche against snowball on the same balances and the same monthly payment. The highest-rate-first order finishes with $2,697 less interest paid." },
    { title: "Renting is not throwing money away", file: "videos/money-math-ep18-rent-vs-own.mp4", poster: "videos/posters/money-math-ep18-rent-vs-own.jpg", duration: 50, date: "2026-09-09T16:56", seq: 18, project: "Money Math", tags: ["finance", "housing", "shorts"],
      notes: "The honest comparison: rent against the unrecoverable costs of owning (interest, tax, insurance, upkeep, transaction costs), not against the whole mortgage payment." },
    { title: "Always having a car payment costs about $919K by retirement", file: "videos/money-math-ep19-perpetual-car-payment.mp4", poster: "videos/posters/money-math-ep19-perpetual-car-payment.jpg", duration: 49, date: "2026-09-09T16:56", seq: 19, project: "Money Math", tags: ["finance", "cars", "shorts"],
      notes: "A payment that never ends, invested instead at 7% from 25 to 65, is a retirement-sized number." },
    { title: "Adding $211 a month to a mortgage saves $116,342", file: "videos/money-math-ep20-extra-payment.mp4", poster: "videos/posters/money-math-ep20-extra-payment.jpg", duration: 42, date: "2026-09-09T16:56", seq: 20, project: "Money Math", tags: ["finance", "mortgage", "shorts"],
      notes: "One extra principal payment a year, spread monthly, on a $400,000 30-year loan. Years off the term and six figures off the interest." },
    { title: "You will earn $2.6M. Here is where every dollar goes.", file: "videos/money-math-ep21-where-it-all-goes.mp4", poster: "videos/posters/money-math-ep21-where-it-all-goes.jpg", duration: 72, date: "2026-09-09T16:56", seq: 21, project: "Money Math", tags: ["finance", "shorts"],
      notes: "A lifetime of earnings at a median path, split into taxes, housing, transport, food and what is left. The long one; every slice computed." },

    {
      title: "The Yankees outscored the Pirates 55 to 27. And lost.",
      file: "videos/world-series-1960.mp4", poster: "videos/posters/world-series-1960.jpg", duration: 37,
      date: "2026-09-09T17:04",
      project: "Pittsburgh Stories",
      tags: ["pittsburgh", "mlb", "shorts"],
      notes: "The 1960 World Series in 37 seconds, ending on Mazeroski. Every claim verified in the project's METADATA.md.",
    },

    /* ---------- September 10, 2026 ---------- */
    {
      title: "One Poem",
      file: "videos/one-poem.mp4", poster: "videos/posters/one-poem.jpg", duration: 435, aspect: "16:9",
      date: "2026-09-10T05:25", seq: 1,
      project: "One Poem",
      tags: ["ai", "ai vs ai", "documentary", "film"],
      notes: "Two AI models, Claude and ChatGPT, write one poem. Every decision was delegated to a recorded rule and every event went into an append-only ledger (77 events, validator clean). The ledger became this seven-minute documentary.",
    },
    {
      title: "One Poem, vertical cut 1",
      file: "videos/one-poem-short-1.mp4", poster: "videos/posters/one-poem-short-1.jpg", duration: 60,
      date: "2026-09-10T05:25", seq: 2,
      project: "One Poem",
      tags: ["ai", "ai vs ai", "shorts"],
      notes: "The film cut down to a minute for vertical.",
    },
    {
      title: "One Poem, vertical cut 2",
      file: "videos/one-poem-short-2.mp4", poster: "videos/posters/one-poem-short-2.jpg", duration: 62,
      date: "2026-09-10T05:26", seq: 3,
      project: "One Poem",
      tags: ["ai", "ai vs ai", "shorts"],
      notes: "Second vertical cut, a different minute of the same ledger.",
    },
    {
      title: "Vik's Picks Arena, Week 1: the picks",
      file: "videos/viks-picks-arena-week1.mp4", poster: "videos/posters/viks-picks-arena-week1.jpg", duration: 117,
      date: "2026-09-10T05:54",
      project: "Vik's Picks Arena",
      tags: ["nfl", "ai", "ai vs ai", "picks", "series"],
      notes: "Two AI models pick every Week 1 game blind, see each other's picks, attack the ones they think are wrong with a stated fact, then hold or flip. 15 games, 3 disagreements, 6 attacks, 0 flips. Locked before kickoff; the scoreboard decides after Monday night.",
    },
    {
      title: "The Steelers drafted four Hall of Famers. In one draft.",
      file: "videos/steelers-1974-draft.mp4", poster: "videos/posters/steelers-1974-draft.jpg", duration: 44,
      date: "2026-09-10T07:00", seq: 1,
      project: "Pittsburgh Stories",
      tags: ["pittsburgh", "nfl", "shorts"],
      notes: "January 29, 1974: Swann, Lambert, Stallworth and Webster in one draft, then Donnie Shell undrafted. All five in Canton. No other team has done it.",
    },
    {
      title: "The Penguins owed Mario Lemieux $32.5M. So he bought the team.",
      file: "videos/lemieux-bought-the-penguins.mp4", poster: "videos/posters/lemieux-bought-the-penguins.jpg", duration: 47,
      date: "2026-09-10T07:00", seq: 2,
      project: "Pittsburgh Stories",
      tags: ["pittsburgh", "nhl", "shorts"],
      notes: "Bankruptcy in 1998, Lemieux as the biggest creditor, $20 million of deferred salary converted into equity, three Cups as owner. The last card is the June 2026 sale at about $1.75 billion.",
    },
    {
      title: "The best hitter in baseball history was a Pittsburgh catcher",
      file: "videos/josh-gibson-372.mp4", poster: "videos/posters/josh-gibson-372.jpg", duration: 45,
      date: "2026-09-10T07:00", seq: 3,
      project: "Pittsburgh Stories",
      tags: ["pittsburgh", "mlb", "shorts"],
      notes: "Josh Gibson, Homestead Grays and Pittsburgh Crawfords. When MLB folded Negro Leagues records into its books in May 2024 he became the all-time leader in average (.372), slugging and OPS.",
    },
    {
      title: "Code Duel 1: Snake",
      file: "videos/code-duel-1-snake.mp4", poster: "videos/posters/code-duel-1-snake.jpg", duration: 97,
      date: "2026-09-10T07:04",
      project: "Code Duel",
      tags: ["ai", "ai vs ai", "code", "series"],
      notes: "Two models solve the same task blind, read each other's code, attack it with test cases, patch or hold. A hidden suite hashed before the duel is the only judge. Result: 40/40 both sides, zero attacks, a tie.",
    },
    {
      title: "Code Duel 2: Bounce",
      file: "videos/code-duel-2-bounce.mp4", poster: "videos/posters/code-duel-2-bounce.jpg", duration: 97,
      date: "2026-09-10T07:05",
      project: "Code Duel",
      tags: ["ai", "ai vs ai", "code", "series"],
      notes: "Same protocol, second task. 40/40 both sides, zero attacks, a tie. The pack needs harder tasks before duel 4.",
    },
    {
      title: "Code Duel 3: Life",
      file: "videos/code-duel-3-life.mp4", poster: "videos/posters/code-duel-3-life.jpg", duration: 97,
      date: "2026-09-10T07:06",
      project: "Code Duel",
      tags: ["ai", "ai vs ai", "code", "series"],
      notes: "Conway's Life as the third task. 40/40 both sides, zero attacks, a tie.",
    },
    // <<ingest: new entries are inserted above this line>>
  ],
};
