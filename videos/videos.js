/* =====================================================================
   V Kedar's Command Center — video manifest

   THIS IS THE ONLY FILE YOU EDIT TO ADD OR CHANGE VIDEOS.
   One entry per video. Order does not matter; the site sorts by date.

   Fields
     title     what to call it
     youtube   any YouTube link (watch, youtu.be, shorts) or just the 11-char id
     date      "YYYY-MM-DD", when it was made or published
     project   which chat or system produced it (becomes a filter)
     tags      optional list of words (become filters)
     notes     optional, what this one was about or what changed
     aspect    optional "9:16" for Shorts or "16:9" for normal; default below

   Instead of youtube you can use
     drive     a Google Drive file link or id (shared as "anyone with link")
     file      a path to an mp4 in this repo, e.g. "videos/clip.mp4"

   Commas between entries. Quotes around text. That's it.
   ===================================================================== */
window.COMMAND_CENTER = {
  owner: "V Kedar",
  tagline: "Every video, in the order it happened.",
  defaultAspect: "9:16",

  videos: [
    // Example (remove the // at the start of each line to activate):
    // {
    //   title: "First generated short",
    //   youtube: "https://youtube.com/shorts/XXXXXXXXXXX",
    //   date: "2026-05-29",
    //   project: "YouTube Shorts video generation",
    //   tags: ["shorts", "first"],
    //   notes: "The very first clip the pipeline produced.",
    // },
  ],
};
