import html2canvas from "html2canvas";
import { getPublicPortalUrl } from "./constants";

/**
 * Generates an HTMLCanvasElement from a target DOM element with high DPI and astral styling
 */
export async function generateParchmentCanvas(elementId: string): Promise<HTMLCanvasElement | null> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn("Element not found for canvas generation:", elementId);
    return null;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: "#0d0718",
      scale: 2, // High DPI for crisp text & graphics
      useCORS: true,
      logging: false,
      scrollY: 0,
      scrollX: 0,
    });
    return canvas;
  } catch (error) {
    console.error("Error generating canvas from element:", error);
    return null;
  }
}

/**
 * Downloads a DOM element as a high-definition parchment image (PNG)
 */
export async function downloadParchmentImage(elementId: string, filename = "revelacion-oraculo.png"): Promise<boolean> {
  const canvas = await generateParchmentCanvas(elementId);
  if (!canvas) return false;

  try {
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
    return true;
  } catch (error) {
    console.error("Error triggering parchment image download:", error);
    return false;
  }
}

/**
 * Exports a DOM element as both a Blob and DataURL, suitable for Web Share API and image previews
 */
export async function exportParchmentImageBlob(
  elementId: string
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number } | null> {
  const canvas = await generateParchmentCanvas(elementId);
  if (!canvas) return null;

  try {
    const dataUrl = canvas.toDataURL("image/png");
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/png", 0.95);
    });

    if (!blob) return null;

    return {
      blob,
      dataUrl,
      width: canvas.width,
      height: canvas.height,
    };
  } catch (error) {
    console.error("Error converting canvas to blob:", error);
    return null;
  }
}

/**
 * Checks whether the current browser / OS supports sharing files via the Web Share API
 */
export function canShareFiles(): boolean {
  if (typeof navigator === "undefined" || !navigator.share) {
    return false;
  }
  try {
    if (typeof (navigator as any).canShare === "function") {
      const dummyFile = new File([""], "test.png", { type: "image/png" });
      return (navigator as any).canShare({ files: [dummyFile] });
    }
  } catch {
    // ignore
  }
  return false;
}

/**
 * Shares an image file directly through the native operating system share sheet
 * (Instagram Stories, WhatsApp, Facebook, X, Telegram, Messages, AirDrop, etc.)
 */
export async function shareImageFile(options: {
  blob: Blob;
  filename?: string;
  title: string;
  text?: string;
  url?: string;
}): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) {
    return false;
  }

  const filename = options.filename || `revelacion-oraculo-${Date.now()}.png`;
  const file = new File([options.blob], filename, { type: "image/png" });

  try {
    const canShare =
      typeof (navigator as any).canShare === "function" ? (navigator as any).canShare({ files: [file] }) : true;

    if (canShare) {
      await navigator.share({
        files: [file],
        title: options.title,
        text: options.text,
        url: options.url || (typeof window !== "undefined" ? window.location.origin : undefined),
      });
      return true;
    }
  } catch (err: any) {
    if (err?.name === "AbortError") {
      // User dismissed the native share dialog
      return true;
    }
    console.warn("Navigator share with image file failed:", err);
  }
  return false;
}

/**
 * Copies an image Blob directly to the user's system clipboard (PNG format)
 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (
      typeof window !== "undefined" &&
      typeof (window as any).ClipboardItem !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.write === "function"
    ) {
      const item = new (window as any).ClipboardItem({ "image/png": blob });
      await navigator.clipboard.write([item]);
      return true;
    }
  } catch (e) {
    console.warn("ClipboardItem write failed or not supported in this browser:", e);
  }
  return false;
}

/**
 * Copies formatted mystical text for WhatsApp / Social Media sharing
 */
export async function copyMysticShareText(options: {
  title: string;
  seekerName: string;
  bodyText: string;
  karmicLesson?: string;
  relic?: string;
  type?: "PAST_LIFE" | "TAROT" | "SPREAD";
}): Promise<boolean> {
  const portalUrl = getPublicPortalUrl();

  let formattedText = `📜 ✧ *PAPIRO DE LA REVELACIÓN AKÁSHICA* ✧ 📜\n`;
  formattedText += `🔮 *Portal de Vidas Pasadas & Oráculo Astral*\n`;
  formattedText += `👤 *Consultante:* ${options.seekerName || "Alma Buscadora"}\n`;
  formattedText += `✨ *Revelación:* ${options.title}\n`;
  formattedText += `──────────────────────\n\n`;
  formattedText += `${options.bodyText}\n\n`;

  if (options.karmicLesson) {
    formattedText += `🗝️ *Lección Kármica:* ${options.karmicLesson}\n`;
  }
  if (options.relic) {
    formattedText += `🏺 *Reliquia del Alma:* ${options.relic}\n`;
  }

  formattedText += `\n──────────────────────\n`;
  formattedText += `🕯️ *Descubre tus vidas pasadas y tu arcano aquí:*\n${portalUrl}\n`;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(formattedText);
      return true;
    } else {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = formattedText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    }
  } catch (e) {
    console.warn("Could not copy share text", e);
    return false;
  }
}
