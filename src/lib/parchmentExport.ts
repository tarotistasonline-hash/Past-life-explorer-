import html2canvas from "html2canvas";
import { PastLifeDetails, DailyArcana } from "../types";
import { ThreeCardSpreadResult } from "./grimorioStorage";

/**
 * Downloads a DOM element as a high-definition parchment image (PNG)
 */
export async function downloadParchmentImage(elementId: string, filename = "revelacion-oraculo.png"): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn("Element not found for parchment download:", elementId);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: "#0d0718",
      scale: 2, // High DPI
      useCORS: true,
      logging: false,
    });

    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
    return true;
  } catch (error) {
    console.error("Error generating parchment image:", error);
    return false;
  }
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
  const portalUrl = typeof window !== "undefined" ? window.location.origin : "";
  
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
