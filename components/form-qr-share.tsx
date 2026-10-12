"use client";

import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Download, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FormQrShareProps = {
  formId: string;
  formTitle: string;
};

export function FormQrShare({ formId, formTitle }: FormQrShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  function openShareDialog() {
    setShareUrl(
      `${window.location.origin}/respond/${encodeURIComponent(formId)}`,
    );
    setCopyMessage("");
    setIsOpen(true);
  }

  async function copyShareUrl() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyMessage("Link copied.");
    } catch (error) {
      console.error("Unable to copy public form link:", error);
      setCopyMessage("Could not copy the link. Please copy it from above.");
    }
  }

  function downloadQrCode() {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) {
      setCopyMessage("QR code is not ready to download yet.");
      return;
    }

    const svgMarkup = new XMLSerializer().serializeToString(svg);
    const file = new Blob([svgMarkup], {
      type: "image/svg+xml;charset=utf-8",
    });
    const downloadUrl = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `formcraft-${formId}-qr.svg`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(downloadUrl);
  }

  return (
    <>
      <button
        type="button"
        onClick={openShareDialog}
        aria-label={`Show QR code for ${formTitle}`}
        title="Share with QR code"
        className="flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-orange-50 hover:text-orange-700"
      >
        <QrCode size={16} />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader className="pr-8">
            <DialogTitle className="normal-case tracking-normal">
              Share this form
            </DialogTitle>
            <DialogDescription>
              Customers can scan this QR code with their phone camera to open
              the response form.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-center text-sm font-semibold text-foreground">
              {formTitle}
            </p>
            <div
              ref={qrRef}
              className="mx-auto w-fit rounded-xl border border-border bg-white p-4"
            >
              <QRCodeSVG
                value={shareUrl}
                size={240}
                level="H"
                marginSize={4}
                title={`QR code for ${formTitle}`}
              />
            </div>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block break-all rounded-lg bg-muted px-3 py-2 text-center text-xs text-muted-foreground underline underline-offset-2"
            >
              {shareUrl}
            </a>
            {copyMessage && (
              <p role="status" className="text-center text-xs text-muted-foreground">
                {copyMessage}
              </p>
            )}
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={copyShareUrl}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Copy size={15} />
                Copy link
              </button>
              <button
                type="button"
                onClick={downloadQrCode}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-orange-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
              >
                <Download size={15} />
                Download QR
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
