/*
 * DRAFT, PENDING REVIEW.
 * General guidance from Eli (Huy's legal assistant), not a lawyer's opinion. Not yet reviewed by
 * counsel. This marker lives in the repo only: it is deliberately NOT rendered on the site.
 * It replaces the earlier text recovered from the Grok-hosted build, which described a server,
 * Google Play billing and Grok identity that this rebuild does not have.
 * Placeholders in [brackets] come from src/lib/legal-config.ts.
 */
import { LEGAL } from "../../lib/legal-config.ts";
import type { LegalDoc } from "./types.ts";

export const PRIVACY_STATUS = "Draft, pending review";

export const PRIVACY: LegalDoc = {
  title: "Privacy",
  intro:
    "The short version: today your desk lives in your own browser. We do not run a server that holds it. This page says what is kept, where, and how to wipe it.",
  effective: LEGAL.effectiveDate,
  sections: [
    {
      id: "desk",
      title: "The desk",
      paragraphs: [
        `${LEGAL.product} is a paper trading desk and a set of lessons, run by ${LEGAL.entity}. Paper fills are simulated at last quote. It is not a broker, not an adviser, and not investment advice. See the [Terms](/terms).`,
      ],
    },
    {
      id: "collect",
      title: "What is collected",
      paragraphs: [
        "Only what you give the desk or create by using it:",
      ],
      bullets: [
        "Profile: an email or username you type, a display name, and a salted hash of your password (not the password itself).",
        "Sign-up acknowledgment: that you confirmed you are 18 or older and accepted the Terms, with the time and the version of the Terms.",
        "Paper trading data: your paper book (cash, positions, trades with the notes on them, equity history), settings, streaks, and trophies.",
        "Learning progress: which lessons you completed, quiz scores and attempts, which lesson you opened last.",
        "Ladder (only if you post): the handle you pick, plus win rate, closed count, paper return, and streak. Never your email, the full book, or your tickets.",
      ],
    },
    {
      id: "not-collected",
      title: "What is not collected",
      paragraphs: [
        "No real brokerage logins, bank details, or card numbers. The desk never connects to a real brokerage. No payment is taken on the site today. Pro is parked, and if it opens we will update this page first.",
      ],
    },
    {
      id: "storage",
      title: "Where it is stored",
      paragraphs: [
        "Today everything above is stored in your browser's localStorage, on your device. It is not sent to us and we cannot see it. That also means it is not backed up: clearing site data, switching browsers, or changing devices loses it, and anyone who can use your browser can see it.",
        "A local profile is not real account security. Use a password you do not use anywhere else.",
        "Later we plan to offer cloud sign-in and a shared ladder, which would store this data on a cloud provider. The provider is [cloud provider, to be decided]. Before any data leaves your device we will update this page to name the provider, say what is stored and for how long, and explain how to delete it.",
      ],
    },
    {
      id: "third-parties",
      title: "Third parties that can see you",
      paragraphs: [
        "The site is served as static files by GitHub Pages [hosting provider, confirm at launch], which can log standard request data such as your IP address. The site loads its fonts from Google Fonts, which also receives your IP address and browser details.",
        "We have no analytics, ad, or tracking scripts in the site today. Share buttons, the Venmo tip link, and links to other sites open third-party apps, which have their own privacy practices. Nothing is shared with them until you tap.",
        "We do not sell your data. Nothing here is used to show you ads.",
      ],
    },
    {
      id: "delete",
      title: "How to delete your data",
      paragraphs: [
        "Because it is on your device, you can erase it yourself, any time. Use the button below to delete everything this site stored in this browser: your profile, paper book, ladder row, progress, and settings. It cannot be undone. You can also clear this site's data in your browser settings.",
        `If cloud storage is added and we hold a copy of your data, you will be able to delete it from the site, or ask by writing ${LEGAL.contactEmail}, and we will delete it unless the law requires us to keep something.`,
      ],
    },
    {
      id: "ladder",
      title: "Ladder",
      paragraphs: [
        "Posting to the ladder is optional. The ladder shows handles only. You can hide yourself and pull your row down at any time. Today the ladder is stored in your browser only, so no one else sees it. When a shared ladder exists, only the handle and stats above are posted. Share cards are drawn on your device. Posting them to another app is your choice.",
      ],
    },
    {
      id: "tips",
      title: "Tips",
      paragraphs: [
        "The desk can open Venmo so you may optionally tip the maker. That payment happens in Venmo. We do not collect Venmo passwords, see the amount, or treat a tip as Pro.",
      ],
    },
    {
      id: "affiliate",
      title: "Affiliate links",
      paragraphs: [
        "There are no affiliate links on the site today. If we add any, we will label them next to the link and say here what data the partner may receive when you click.",
      ],
    },
    {
      id: "age",
      title: "Age",
      paragraphs: [
        `The site is for people ${LEGAL.minAge} or older. It is not directed at children or teens. Do not create a profile for anyone under ${LEGAL.minAge}. If you think someone under ${LEGAL.minAge} has used the site, write ${LEGAL.contactEmail}.`,
      ],
    },
    {
      id: "rights",
      title: "Your choices",
      paragraphs: [
        `Depending on where you live, you may have rights over personal data, such as access, correction, or deletion. Today the data is on your device, so you hold it. If we begin to store data on servers, we will explain how to use those rights, and you can write ${LEGAL.contactEmail}.`,
      ],
    },
    {
      id: "changes",
      title: "Changes",
      paragraphs: [
        "This notice can change. The dated copy on this page is the current one.",
      ],
    },
    {
      id: "contact",
      title: "Contact",
      paragraphs: [
        `Write ${LEGAL.contactEmail}. Mail: ${LEGAL.entity}, ${LEGAL.mailingAddress}.`,
      ],
    },
  ],
};
