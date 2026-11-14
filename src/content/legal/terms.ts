/*
 * DRAFT, PENDING REVIEW.
 * General guidance from Eli (Huy's legal assistant), not a lawyer's opinion. Not yet reviewed by
 * counsel. Do not treat as final. This marker lives in the repo only: it is deliberately NOT
 * rendered on the site. Placeholders in [brackets] come from src/lib/legal-config.ts.
 */
import { LEGAL } from "../../lib/legal-config.ts";
import type { LegalDoc } from "./types.ts";

export const TERMS_STATUS = "Draft, pending review";

export const TERMS: LegalDoc = {
  title: "Terms of Use",
  intro:
    "The short version: this is a classroom and a simulator. It is not a broker, not an adviser, and not a way to make money. Read the rest before you use it.",
  effective: LEGAL.effectiveDate,
  sections: [
    {
      id: "who",
      title: "Who we are and what this is",
      paragraphs: [
        `${LEGAL.product} (the "desk", the "site") is run by ${LEGAL.entity} ("we", "us"). It is a paper-trading desk and a set of lessons. By opening the site, creating a profile, funding a paper book, or using a lesson, you accept these Terms and the [Privacy](/privacy) notice. If you do not accept them, leave the site.`,
      ],
    },
    {
      id: "education-only",
      title: "Education only, not advice",
      paragraphs: [
        "Everything here is for education and entertainment. Nothing on the site, including lessons, quizzes, examples, the ladder, automated cycles, research text, share cards, or anything we say, is investment advice, tax advice, legal advice, accounting advice, or a recommendation to buy, sell, or hold any security or other instrument. Nothing is an offer or a solicitation.",
        "We give no personalized advice. We do not know your finances, goals, or risk tolerance, and we do not review whether anything is suitable for you. Tickers, prices, and numbers in lessons are illustrations, not picks. No fiduciary or advisory relationship is created between you and us.",
        "Talk to a licensed professional before you make decisions about real money, taxes, or legal matters.",
      ],
    },
    {
      id: "not-adviser",
      title: "Not an adviser or a broker",
      paragraphs: [
        `${LEGAL.entity} is not a registered investment adviser, not a broker-dealer, and not registered with the SEC, FINRA, the CFTC, or any state securities regulator as either. We are not an exchange, a bank, or a custodian. We do not hold your money or securities, route orders, or execute trades. The desk never connects to a real brokerage account.`,
      ],
    },
    {
      id: "simulated-results",
      title: "Simulated trading and the limits of simulated results",
      paragraphs: [
        "The desk uses fake money. Every position, fill, balance, win rate, return, streak, and ranking is simulated. No real order is ever placed, and no real money is ever at risk.",
        "Simulated results have serious limits. They are hypothetical, and they are not a prediction of how you would do with real money. In particular:",
      ],
      bullets: [
        "No slippage, spread, or fees. Paper tickets fill instantly at the last quote on the tape. Real orders can fill at worse prices, partially, late, or not at all, and cost money to place.",
        "Simulated prices. The quote tape on the desk may be simulated, not a live market feed. It is labeled \"Sim tape\" when it is. Do not size real risk off it.",
        "No emotions. Fake losses do not hurt the way real ones do. People trade differently when real money is on the line.",
        "Hindsight. It is easy to look good when no money, time, or fear is at stake, and easy to read a pattern into a lucky streak.",
        "Not predictive. A strong paper result does not mean you will make money later. Past or simulated performance does not guarantee anything.",
        "Hypothetical results have many inherent limitations. Unlike an actual track record, they do not reflect real trading, real liquidity, or real market impact.",
      ],
    },
    {
      id: "no-guarantees",
      title: "No guaranteed returns",
      paragraphs: [
        "Investing and trading involve risk, including the loss of everything you put in. We do not promise or imply any return, profit, or outcome from using the site or from anything you learn here. Markets can move against you quickly.",
      ],
    },
    {
      id: "eligibility",
      title: "You must be 18 or older",
      paragraphs: [
        `You must be at least ${LEGAL.minAge} years old to create a profile or use the site. By creating a profile you confirm that you are ${LEGAL.minAge} or older. If you are under ${LEGAL.minAge}, do not use the site. If we learn that someone under ${LEGAL.minAge} has a profile, we may remove it.`,
      ],
    },
    {
      id: "accounts",
      title: "Profiles and your data",
      paragraphs: [
        "Today, a profile is a local profile stored in your own browser, not on our servers. That is not real account security: anyone with access to your browser or device can reach it, and clearing site data removes it. Use a password you do not use anywhere else. How data is stored and how to delete it is in the [Privacy](/privacy) notice.",
        "You are responsible for what you do with your profile and device.",
      ],
    },
    {
      id: "ladder",
      title: "The ladder",
      paragraphs: [
        "Posting to the ladder is optional. The ladder shows handles only, never your email. You can hide yourself and pull your row down at any time. Every number on the ladder is simulated and is not a verified track record. Do not use a handle that is offensive, that impersonates someone, or that contains personal information. We may remove any handle or row.",
      ],
    },
    {
      id: "use",
      title: "Acceptable use",
      paragraphs: [
        "Do not use the site to break the law, to attack or overload it, to scrape it in bulk, to pass off simulated results as real ones, or to present anything here as investment advice to others. Share cards and captions must keep their \"simulated\" or \"paper\" labeling if you post them.",
      ],
    },
    {
      id: "links",
      title: "Links, tips, and affiliate disclosure",
      paragraphs: [
        "The site can open third-party apps and sites, such as Venmo for an optional tip, or the share links for social networks. Those companies have their own terms. We do not control them. A tip is voluntary, is not a purchase, and does not buy Pro, a better fill, or advice.",
        "Affiliate disclosure: the site has no affiliate links today. If we ever add links for which we may earn a commission or other compensation, we will label them clearly next to the link, for example \"Affiliate link: we may earn a commission at no extra cost to you\", and we will update this section. A paid or affiliate relationship will not change what a lesson says, and it is never a recommendation to buy or sell anything.",
      ],
    },
    {
      id: "ip",
      title: "Our content",
      paragraphs: [
        `The lessons, text, design, and code of the site belong to ${LEGAL.entity} or its licensors, except where noted. You may read them and use them for your own learning. Do not copy or resell them without asking us first. If a license applies to the source code, it is stated in the code repository.`,
      ],
    },
    {
      id: "warranty",
      title: "No warranty",
      paragraphs: [
        "The site and everything on it are provided \"as is\" and \"as available\", without warranties of any kind, express or implied, including accuracy, completeness, fitness for a particular purpose, uptime, or that the simulator behaves like a real market. Lessons may contain mistakes or go out of date.",
      ],
    },
    {
      id: "liability",
      title: "Limitation of liability",
      paragraphs: [
        `To the fullest extent the law allows, ${LEGAL.entity}, its owners, members, managers, employees, contractors, and affiliates are not liable for any loss or damage of any kind arising from your use of, or inability to use, the site. That includes direct, indirect, incidental, special, consequential, exemplary, or punitive damages, lost profits, lost data, and any trading or investment loss, whether you relied on a lesson, a simulated result, or anything else here, and even if we were told it could happen.`,
        `If a court decides we are liable to you despite the above, our total liability for all claims is limited to the greater of what you paid us in the twelve months before the claim (which is nothing for the free site) and ${LEGAL.liabilityCap}.`,
        "Some places do not allow some of these limits, so some of them may not apply to you.",
      ],
    },
    {
      id: "changes",
      title: "Changes and ending",
      paragraphs: [
        "We can change the site, the lessons, or these Terms at any time. The dated copy on this page is the current one. If you keep using the site after a change, you accept it. We can suspend or end access at any time. You can stop at any time by deleting your data as described in the [Privacy](/privacy) notice.",
      ],
    },
    {
      id: "law",
      title: "Governing law",
      paragraphs: [
        `These Terms are governed by the laws of ${LEGAL.governingState}, without regard to conflict-of-law rules. Disputes will be handled in: ${LEGAL.disputeVenue}.`,
      ],
    },
    {
      id: "contact",
      title: "Contact",
      paragraphs: [
        `Questions or notices: ${LEGAL.contactEmail}. Mail: ${LEGAL.entity}, ${LEGAL.mailingAddress}. Also read the [Use at your own risk](/risk) notice.`,
      ],
    },
  ],
};
