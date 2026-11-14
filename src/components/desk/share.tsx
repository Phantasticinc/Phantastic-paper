// @ts-nocheck — recovered from the compiled bundle; tighten types incrementally (see README).
import { SimulatedNotice } from "@/components/policy/SimulatedNotice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ladderUrl, shareCaption, shareLinks } from "@/lib/ladder";
import {
  LAUNCH_TEXT,
  LAUNCH_URL,
  drawLadderCard,
  drawLaunchCard,
  launchShareLinks,
} from "@/lib/shareCard";
import { Check, Copy, Download, Share2 } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function ShareLadderDialog({ open, onOpenChange, stats }) {
  let r = useRef(null),
    [i, a] = useState(null),
    [o, s] = useState(null),
    c = shareCaption(stats),
    l = shareLinks(stats),
    u = `${stats.handle}:${stats.closed}:${stats.wins}:${stats.winRate}:${stats.returnPct}:${stats.streak}`,
    d = typeof navigator < "u" && typeof navigator.share == "function",
    f = useRef(stats);
  ((f.current = stats),
    useEffect(() => {
      if (!open) return;
      let t = true,
        n = 0,
        i = () => {
          let e = r.current;
          if (!e) {
            n = requestAnimationFrame(i);
            return;
          }
          drawLadderCard(e, f.current).then(() => {
            t && a(e.toDataURL("image/png"));
          });
        };
      return (
        i(),
        () => {
          ((t = false), cancelAnimationFrame(n));
        }
      );
    }, [open, u]));
  async function p() {
    let e = r.current;
    if (!e) throw Error("Card is still drawing.");
    let t = await new Promise((t) => e.toBlob(t, "image/png"));
    if (!t) throw Error("Could not draw the card.");
    return new File([t], "phantastic-paper-ladder.png", {
      type: "image/png",
    });
  }
  async function m(e, t) {
    try {
      (await navigator.clipboard.writeText(e),
        s(t),
        window.setTimeout(() => s(null), 1600),
        toast(t === "link" ? "Link copied" : "Caption copied"));
    } catch {
      toast.error("Could not copy.");
    }
  }
  function h() {
    let e = i ?? r.current?.toDataURL("image/png");
    if (!e) {
      toast.error("Card is still drawing.");
      return;
    }
    let t = document.createElement("a");
    ((t.href = e), (t.download = "phantastic-paper-ladder.png"), t.click());
  }
  async function g(e) {
    try {
      await m(c, "caption");
      let t = await p(),
        n =
          typeof navigator.canShare == "function" &&
          navigator.canShare({
            files: [t],
          });
      if (e === "system" && d) {
        await navigator.share(
          n
            ? {
                files: [t],
                title: "Phantastic Paper",
                text: c,
              }
            : {
                title: "Phantastic Paper",
                text: c,
                url: ladderUrl(),
              },
        );
        return;
      }
      if (n && d) {
        await navigator.share({
          files: [t],
          title: "Phantastic Paper",
          text: c,
        });
        return;
      }
      (h(),
        toast(
          e === "snapchat"
            ? "Card saved. Drop it in a Snap story."
            : e === "instagram"
              ? "Card saved. Paste the caption in Instagram."
              : "Card saved.",
        ));
    } catch (e) {
      if (e instanceof Error && /abort|cancel/i.test(e.name + e.message))
        return;
      h();
    }
  }
  function _(e) {
    window.open(e, "_blank", "noopener,noreferrer");
  }
  return (
    <Fragment>
      {open ? <canvas ref={r} className="hidden" aria-hidden={true} /> : null}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg pb-20">
          <DialogHeader>
            <DialogTitle>Share the desk</DialogTitle>
            <DialogDescription>
              Win rate goes in the caption. Instagram and Snapchat don’t take a
              web post — save the card and paste.
            </DialogDescription>
          </DialogHeader>
          {i ? (
            <img
              src={i}
              alt="Share card with paper win rate"
              className="mx-auto aspect-square w-full max-w-56 rounded-lg bg-surface-2 sm:max-w-xs"
            />
          ) : (
            <div className="mx-auto grid aspect-square w-full max-w-56 place-items-center rounded-lg bg-surface-2 text-xs text-muted sm:max-w-xs">
              Drawing the card…
            </div>
          )}
          <p className="text-xs leading-relaxed text-muted">{c}</p>
          <SimulatedNotice />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              {
                id: "x",
                label: "X",
                onClick: () => _(l.x),
              },
              {
                id: "facebook",
                label: "Facebook",
                onClick: () => {
                  (m(c, "caption"), _(l.facebook));
                },
              },
              {
                id: "threads",
                label: "Threads",
                onClick: () => _(l.threads),
              },
              {
                id: "linkedin",
                label: "LinkedIn",
                onClick: () => _(l.linkedin),
              },
              {
                id: "reddit",
                label: "Reddit",
                onClick: () => _(l.reddit),
              },
              {
                id: "whatsapp",
                label: "WhatsApp",
                onClick: () => _(l.whatsapp),
              },
              {
                id: "telegram",
                label: "Telegram",
                onClick: () => _(l.telegram),
              },
            ].map((e) => (
              <Button key={e.id} variant="secondary" onClick={e.onClick}>
                {e.label}
              </Button>
            ))}
            <Button variant="secondary" onClick={() => void g("instagram")}>
              Instagram
            </Button>
            <Button variant="secondary" onClick={() => void g("snapchat")}>
              Snapchat
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {d && (
              <Button className="col-span-2" onClick={() => void g("system")}>
                <Share2 />
                System share
              </Button>
            )}
            <Button variant="outline" onClick={() => void m(c, "caption")}>
              {o === "caption" ? <Check /> : <Copy />}
              {o === "caption" ? "Copied" : "Caption"}
            </Button>
            <Button
              variant="outline"
              onClick={() => void m(ladderUrl(), "link")}
            >
              {o === "link" ? <Check /> : <Copy />}
              {o === "link" ? "Copied" : "Link"}
            </Button>
            <Button variant="ghost" className="col-span-2" onClick={h}>
              <Download />
              Save card
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}
export function LaunchShareDialog({ open, onOpenChange }) {
  let canvasRef = useRef(null),
    [cardUrl, setCardUrl] = useState(null),
    [copied, setCopied] = useState(null),
    links = launchShareLinks(),
    canNativeShare =
      typeof navigator < "u" && typeof navigator.share == "function";
  useEffect(() => {
    if (!open) return;
    let t = true,
      r = 0,
      a = () => {
        let e = canvasRef.current;
        if (!e) {
          r = requestAnimationFrame(a);
          return;
        }
        drawLaunchCard(e).then(() => {
          t && setCardUrl(e.toDataURL("image/png"));
        });
      };
    return (
      a(),
      () => {
        ((t = false), cancelAnimationFrame(r));
      }
    );
  }, [open]);
  async function cardFile() {
    let e = canvasRef.current;
    if (!e) throw Error("Card is still drawing.");
    let t = await new Promise((t) => e.toBlob(t, "image/png"));
    if (!t) throw Error("Could not draw the card.");
    return new File([t], "phantastic-paper.png", {
      type: "image/png",
    });
  }
  async function copyText(e, t) {
    try {
      (await navigator.clipboard.writeText(e),
        setCopied(t),
        window.setTimeout(() => setCopied(null), 1600),
        toast(t === "link" ? "Link copied" : "Caption copied"));
    } catch {
      toast.error("Could not copy.");
    }
  }
  function saveCard() {
    let e = cardUrl ?? canvasRef.current?.toDataURL("image/png");
    if (!e) {
      toast.error("Card is still drawing.");
      return;
    }
    let t = document.createElement("a");
    ((t.href = e), (t.download = "phantastic-paper.png"), t.click());
  }
  async function shareTo(e) {
    try {
      await copyText(LAUNCH_TEXT, "caption");
      let t = await cardFile(),
        n =
          typeof navigator.canShare == "function" &&
          navigator.canShare({
            files: [t],
          });
      if (e === "system" && canNativeShare) {
        await navigator.share(
          n
            ? {
                files: [t],
                title: "Phantastic Paper",
                text: LAUNCH_TEXT,
              }
            : {
                title: "Phantastic Paper",
                text: LAUNCH_TEXT,
                url: LAUNCH_URL,
              },
        );
        return;
      }
      if (n && canNativeShare) {
        await navigator.share({
          files: [t],
          title: "Phantastic Paper",
          text: LAUNCH_TEXT,
        });
        return;
      }
      (saveCard(),
        toast(
          e === "snapchat"
            ? "Card saved. Drop it in a Snap story."
            : e === "instagram"
              ? "Card saved. Paste the caption in Instagram."
              : "Card saved.",
        ));
    } catch (e) {
      if (e instanceof Error && /abort|cancel/i.test(e.name + e.message))
        return;
      saveCard();
    }
  }
  function openLink(e) {
    window.open(e, "_blank", "noopener,noreferrer");
  }
  return (
    <Fragment>
      {open ? (
        <canvas ref={canvasRef} className="hidden" aria-hidden={true} />
      ) : null}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg pb-20">
          <DialogHeader>
            <DialogTitle>Tell the room</DialogTitle>
            <DialogDescription>
              One caption, every outlet. Instagram and Snapchat don’t take a web
              post — save the card and paste.
            </DialogDescription>
          </DialogHeader>
          {cardUrl ? (
            <img
              src={cardUrl}
              alt="Phantastic Paper launch card"
              className="mx-auto aspect-square w-full max-w-56 rounded-lg bg-surface-2 sm:max-w-xs"
            />
          ) : (
            <div className="mx-auto grid aspect-square w-full max-w-56 place-items-center rounded-lg bg-surface-2 text-xs text-muted sm:max-w-xs">
              Drawing the card…
            </div>
          )}
          <p className="text-sm leading-relaxed text-muted">{LAUNCH_TEXT}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              {
                id: "x",
                label: "X",
                onClick: () => openLink(links.x),
              },
              {
                id: "facebook",
                label: "Facebook",
                onClick: () => {
                  (copyText(LAUNCH_TEXT, "caption"), openLink(links.facebook));
                },
              },
              {
                id: "threads",
                label: "Threads",
                onClick: () => openLink(links.threads),
              },
              {
                id: "linkedin",
                label: "LinkedIn",
                onClick: () => openLink(links.linkedin),
              },
              {
                id: "reddit",
                label: "Reddit",
                onClick: () => openLink(links.reddit),
              },
              {
                id: "bluesky",
                label: "Bluesky",
                onClick: () => openLink(links.bluesky),
              },
              {
                id: "whatsapp",
                label: "WhatsApp",
                onClick: () => openLink(links.whatsapp),
              },
              {
                id: "telegram",
                label: "Telegram",
                onClick: () => openLink(links.telegram),
              },
              {
                id: "hn",
                label: "Hacker News",
                onClick: () => openLink(links.hn),
              },
            ].map((e) => (
              <Button key={e.id}
                variant="secondary"
                className="min-h-11"
                onClick={e.onClick}
              >
                {e.label}
              </Button>
            ))}
            <Button
              variant="secondary"
              className="min-h-11"
              onClick={() => void shareTo("instagram")}
            >
              Instagram
            </Button>
            <Button
              variant="secondary"
              className="min-h-11"
              onClick={() => void shareTo("snapchat")}
            >
              Snapchat
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {canNativeShare && (
              <Button
                className="col-span-2 min-h-11"
                onClick={() => void shareTo("system")}
              >
                <Share2 />
                System share
              </Button>
            )}
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => void copyText(LAUNCH_TEXT, "caption")}
            >
              {copied === "caption" ? <Check /> : <Copy />}
              {copied === "caption" ? "Copied" : "Caption"}
            </Button>
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => void copyText(LAUNCH_URL, "link")}
            >
              {copied === "link" ? <Check /> : <Copy />}
              {copied === "link" ? "Copied" : "Link"}
            </Button>
            <Button
              variant="ghost"
              className="col-span-2 min-h-11"
              onClick={saveCard}
            >
              <Download />
              Save card
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}
