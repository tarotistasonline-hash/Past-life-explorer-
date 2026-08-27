import React from "react";
import { Sparkles } from "lucide-react";

interface MarseilleCardArtProps {
  cardId: number; // 0 to 21
  romanNumber: string;
  marseilleTitle?: string;
  name: string;
  colorHex: string;
  isFlipping?: boolean;
  isHovered?: boolean;
}

/**
 * Marseille Woodcut Artwork & Living Flickering Candlelight Shimmer Component
 */
export const MarseilleCardArt: React.FC<MarseilleCardArtProps> = ({
  cardId,
  romanNumber,
  marseilleTitle,
  name,
  colorHex,
  isFlipping = false,
  isHovered = false,
}) => {
  // Render specific SVG iconography matching the traditional Tarot de Marseille woodcut iconography
  const renderMarseilleIllustration = () => {
    switch (cardId) {
      case 0: // LE MAT (The Fool)
        return (
          <g>
            {/* Ground with sparse grass */}
            <path d="M 10 160 Q 60 150 110 160" stroke="#1e293b" strokeWidth="2" fill="none" />
            <path d="M 25 155 L 28 145 M 85 155 L 82 145" stroke="#15803d" strokeWidth="2" />
            {/* Dog / Animal following */}
            <path d="M 32 140 C 25 130 20 145 28 152 C 34 156 38 148 35 142 Z" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 22 132 C 18 128 20 122 25 125 Z" fill="#ef4444" stroke="#0f172a" strokeWidth="1" />
            {/* Le Mat Figure */}
            {/* Legs walking left-to-right */}
            <path d="M 45 155 L 50 120 L 60 155" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 42 155 L 50 155" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
            <path d="M 60 155 L 68 155" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
            {/* Tunic (Red & Blue party-colored) */}
            <path d="M 42 120 L 48 80 L 64 80 L 68 120 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 42 120 L 48 80 L 56 80 L 52 120 Z" fill="#dc2626" />
            {/* Belt bells */}
            <circle cx="48" cy="120" r="2" fill="#fbbf24" stroke="#0f172a" strokeWidth="1" />
            <circle cx="56" cy="120" r="2" fill="#fbbf24" stroke="#0f172a" strokeWidth="1" />
            <circle cx="64" cy="120" r="2" fill="#fbbf24" stroke="#0f172a" strokeWidth="1" />
            {/* Staff with bundle over shoulder */}
            <line x1="72" y1="130" x2="35" y2="60" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
            {/* Bag / Bundle */}
            <ellipse cx="32" cy="62" rx="9" ry="7" fill="#fbbf24" stroke="#0f172a" strokeWidth="1.5" />
            {/* Walking Stick in hand */}
            <line x1="68" y1="95" x2="88" y2="155" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            {/* Head & Jester / Fez Cap */}
            <circle cx="58" cy="68" r="7" fill="#fed7aa" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 54 64 C 54 50 66 52 64 64 Z" fill="#ef4444" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="65" cy="52" r="2.5" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
            {/* Feather */}
            <path d="M 65 52 Q 74 44 76 50" stroke="#facc15" strokeWidth="2" fill="none" />
          </g>
        );

      case 1: // LE BATELEUR (The Magician)
        return (
          <g>
            {/* Wooden 3-Legged Table */}
            <polygon points="20,115 100,115 95,125 25,125" fill="#ca8a04" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="28" y1="125" x2="22" y2="155" stroke="#78350f" strokeWidth="2" />
            <line x1="92" y1="125" x2="98" y2="155" stroke="#78350f" strokeWidth="2" />
            <line x1="60" y1="125" x2="60" y2="155" stroke="#78350f" strokeWidth="2" />
            {/* Tools on table: Cup, Knife/Dagger, Dice/Coin */}
            <path d="M 36 115 L 34 105 L 42 105 L 40 115 Z" fill="#fbbf24" stroke="#0f172a" strokeWidth="1" />
            <line x1="50" y1="113" x2="65" y2="107" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="76" cy="110" r="3.5" fill="#eab308" stroke="#0f172a" strokeWidth="1" />
            <circle cx="85" cy="112" r="3" fill="#dc2626" stroke="#0f172a" strokeWidth="1" />
            {/* Body of Le Bateleur */}
            <path d="M 45 105 L 50 65 L 70 65 L 75 105 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 48 85 L 72 85" stroke="#ef4444" strokeWidth="3" />
            {/* Left Arm raising wand */}
            <path d="M 50 72 L 32 55" stroke="#fed7aa" strokeWidth="3" strokeLinecap="round" />
            <line x1="30" y1="52" x2="22" y2="40" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="21" cy="38" r="2" fill="#ef4444" />
            {/* Right Arm pointing to table coin */}
            <path d="M 70 72 L 80 95" stroke="#fed7aa" strokeWidth="3" strokeLinecap="round" />
            {/* Head */}
            <circle cx="60" cy="52" r="7" fill="#fed7aa" stroke="#0f172a" strokeWidth="1.5" />
            {/* Hat: Iconic Lemniscate / Infinity Wide Brim Hat (Chapeau en huit) */}
            <ellipse cx="60" cy="46" rx="22" ry="6" fill="#ef4444" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 48 45 C 50 32 70 32 72 45 Z" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
          </g>
        );

      case 2: // LA PAPESSE (The High Priestess)
        return (
          <g>
            {/* Veil / Curtain pillars behind */}
            <rect x="18" y="45" width="8" height="110" fill="#1e3a8a" stroke="#0f172a" strokeWidth="1.5" />
            <rect x="94" y="45" width="8" height="110" fill="#78350f" stroke="#0f172a" strokeWidth="1.5" />
            {/* Throne */}
            <rect x="26" y="55" width="68" height="95" fill="#334155" stroke="#0f172a" strokeWidth="1.5" />
            {/* Papal Robes & Mantle */}
            <path d="M 32 150 L 40 75 L 80 75 L 88 150 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 42 75 L 60 145 L 78 75 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="1" />
            {/* Golden Crossed Stole */}
            <line x1="46" y1="80" x2="74" y2="120" stroke="#facc15" strokeWidth="2.5" />
            <line x1="74" y1="80" x2="46" y2="120" stroke="#facc15" strokeWidth="2.5" />
            {/* Open Book / Torah / Registros on lap */}
            <polygon points="46,110 60,115 74,110 72,128 60,132 48,128" fill="#fef08a" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="60" y1="115" x2="60" y2="132" stroke="#78350f" strokeWidth="1.5" />
            {/* Head & Veil */}
            <circle cx="60" cy="56" r="7" fill="#fed7aa" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 48 56 C 48 40 72 40 72 56 L 74 76 L 46 76 Z" fill="#f8fafc" stroke="#0f172a" strokeWidth="1" opacity="0.9" />
            {/* Triple Papal Tiara */}
            <path d="M 52 46 L 60 25 L 68 46 Z" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="50" y1="40" x2="70" y2="40" stroke="#dc2626" strokeWidth="2" />
            <line x1="53" y1="33" x2="67" y2="33" stroke="#2563eb" strokeWidth="2" />
            <circle cx="60" cy="24" r="2" fill="#ef4444" />
          </g>
        );

      case 3: // L'IMPERATRICE (The Empress)
        return (
          <g>
            {/* Winged Throne */}
            <path d="M 22 55 Q 35 30 45 65" stroke="#eab308" strokeWidth="2" fill="#fef08a" />
            <path d="M 98 55 Q 85 30 75 65" stroke="#eab308" strokeWidth="2" fill="#fef08a" />
            {/* Imperial Robes */}
            <path d="M 36 150 L 44 65 L 76 65 L 84 150 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 46 65 L 60 145 L 74 65 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1" />
            {/* Eagle Shield in right arm */}
            <path d="M 32 105 Q 32 135 48 140 Q 60 135 60 105 Z" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 40 115 L 46 110 L 52 115 L 49 125 L 43 125 Z" fill="#0f172a" />
            {/* Scepter with globe & cross in left hand */}
            <line x1="72" y1="85" x2="84" y2="135" stroke="#ca8a04" strokeWidth="2.5" />
            <circle cx="72" cy="80" r="5" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
            <line x1="72" y1="72" x2="72" y2="78" stroke="#facc15" strokeWidth="1.5" />
            <line x1="69" y1="75" x2="75" y2="75" stroke="#facc15" strokeWidth="1.5" />
            {/* Head & Crown */}
            <circle cx="60" cy="50" r="7" fill="#fed7aa" stroke="#0f172a" strokeWidth="1.5" />
            <polygon points="50,44 54,34 60,40 66,34 70,44" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
          </g>
        );

      case 4: // L'EMPEREUR (The Emperor)
        return (
          <g>
            {/* Stone Throne & Profile Pose */}
            <rect x="25" y="65" width="40" height="85" fill="#475569" stroke="#0f172a" strokeWidth="1.5" />
            {/* Crossed Legs (4-shape leg cross) */}
            <path d="M 40 150 L 50 110 L 75 130 L 75 150" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
            <line x1="50" y1="125" x2="70" y2="110" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
            {/* Tunic & Armor */}
            <path d="M 45 110 L 48 65 L 75 65 L 78 110 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="62" cy="88" r="8" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
            {/* Golden Scepter */}
            <line x1="72" y1="75" x2="88" y2="110" stroke="#ca8a04" strokeWidth="2.5" />
            <circle cx="70" cy="72" r="4.5" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
            {/* Eagle Shield resting on floor */}
            <path d="M 72 118 Q 72 145 88 148 Q 100 145 100 118 Z" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 80 128 L 86 123 L 92 128 L 89 138 L 83 138 Z" fill="#0f172a" />
            {/* Profile Head & Helmet Crown */}
            <circle cx="62" cy="48" r="7.5" fill="#fed7aa" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 52 46 C 52 32 72 32 74 46 L 76 56 L 50 56 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="1.5" />
            <polygon points="54,34 62,26 70,34" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
          </g>
        );

      case 5: // LE PAPE (The Hierophant / Pope)
        return (
          <g>
            {/* Columns of Wisdom */}
            <rect x="22" y="40" width="8" height="90" fill="#64748b" stroke="#0f172a" strokeWidth="1.5" />
            <rect x="90" y="40" width="8" height="90" fill="#64748b" stroke="#0f172a" strokeWidth="1.5" />
            {/* Enthroned Pope */}
            <path d="M 38 135 L 44 65 L 76 65 L 82 135 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 46 65 L 60 125 L 74 65 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1" />
            {/* Benediction Hand */}
            <circle cx="48" cy="78" r="3.5" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            {/* Triple Cross Staff in left hand */}
            <line x1="75" y1="40" x2="75" y2="125" stroke="#ca8a04" strokeWidth="2.5" />
            <line x1="67" y1="46" x2="83" y2="46" stroke="#ca8a04" strokeWidth="2" />
            <line x1="69" y1="53" x2="81" y2="53" stroke="#ca8a04" strokeWidth="2" />
            <line x1="71" y1="60" x2="79" y2="60" stroke="#ca8a04" strokeWidth="2" />
            {/* Head & Triple Tiara */}
            <circle cx="60" cy="50" r="7" fill="#fed7aa" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 52 42 L 60 22 L 68 42 Z" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="50" y1="36" x2="70" y2="36" stroke="#dc2626" strokeWidth="2" />
            <line x1="53" y1="29" x2="67" y2="29" stroke="#2563eb" strokeWidth="2" />
            {/* Two Acolytes Kneeling at bottom */}
            <circle cx="40" cy="142" r="5" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <path d="M 32 160 L 40 148 L 48 160 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1" />
            <circle cx="80" cy="142" r="5" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <path d="M 72 160 L 80 148 L 88 160 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="1" />
          </g>
        );

      case 6: // L'AMOUREUX (The Lovers)
        return (
          <g>
            {/* Ground */}
            <path d="M 10 160 Q 60 152 110 160" stroke="#0f172a" strokeWidth="2" fill="none" />
            {/* Radiant Sun and Cupid / Eros on Top */}
            <circle cx="60" cy="28" r="14" fill="#fbbf24" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 52 28 L 68 28 M 60 20 L 60 36" stroke="#ef4444" strokeWidth="1.5" />
            {/* Cupid */}
            <circle cx="60" cy="40" r="4" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <path d="M 52 38 Q 45 32 50 45" stroke="#3b82f6" strokeWidth="1.5" fill="#bfdbfe" />
            <path d="M 68 38 Q 75 32 70 45" stroke="#3b82f6" strokeWidth="1.5" fill="#bfdbfe" />
            <line x1="56" y1="46" x2="64" y2="58" stroke="#78350f" strokeWidth="1.5" />
            <line x1="53" y1="48" x2="59" y2="44" stroke="#ef4444" strokeWidth="1.5" />
            {/* 3 Figures: Elder Woman (Left), Youth (Center), Maiden (Right) */}
            {/* Elder Woman */}
            <circle cx="34" cy="85" r="5.5" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <path d="M 24 155 L 34 92 L 44 155 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1.5" />
            {/* Youth in striped tunic */}
            <circle cx="60" cy="80" r="6" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <path d="M 50 155 L 60 88 L 70 155 Z" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 54 110 L 66 110 M 52 130 L 68 130" stroke="#dc2626" strokeWidth="2.5" />
            {/* Maiden */}
            <circle cx="86" cy="85" r="5.5" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <path d="M 76 155 L 86 92 L 96 155 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="1.5" />
          </g>
        );

      case 7: // LE CHARIOT (The Chariot)
        return (
          <g>
            {/* Star Canopy & 4 Columns */}
            <rect x="25" y="32" width="70" height="12" fill="#1e3a8a" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="30" y1="44" x2="30" y2="95" stroke="#ca8a04" strokeWidth="2" />
            <line x1="90" y1="44" x2="90" y2="95" stroke="#ca8a04" strokeWidth="2" />
            {/* Chariot Body */}
            <rect x="32" y="85" width="56" height="40" fill="#dc2626" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="60" cy="105" r="7" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
            {/* Crowned Prince */}
            <path d="M 44 95 L 48 55 L 72 55 L 76 95 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="60" cy="46" r="6.5" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <polygon points="52,40 60,32 68,40" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
            <line x1="68" y1="65" x2="78" y2="52" stroke="#ca8a04" strokeWidth="2" />
            {/* Two Horses in front (Red & Blue) */}
            <path d="M 20 155 Q 35 120 48 145 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 72 145 Q 85 120 100 155 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="30" cy="130" r="4" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <circle cx="90" cy="130" r="4" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
          </g>
        );

      case 8: // LA JUSTICE (Justice)
        return (
          <g>
            {/* Golden Carved Throne */}
            <rect x="25" y="45" width="70" height="105" fill="#eab308" stroke="#0f172a" strokeWidth="1.5" />
            {/* Robes */}
            <path d="M 34 150 L 44 65 L 76 65 L 86 150 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 46 65 L 60 145 L 74 65 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1" />
            {/* Upright Sword in right hand */}
            <line x1="82" y1="52" x2="82" y2="115" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            <line x1="76" y1="100" x2="88" y2="100" stroke="#facc15" strokeWidth="2" />
            {/* Balanced Scales in left hand */}
            <line x1="32" y1="85" x2="48" y2="85" stroke="#ca8a04" strokeWidth="2" />
            <line x1="40" y1="75" x2="40" y2="85" stroke="#ca8a04" strokeWidth="1.5" />
            <path d="M 30 100 Q 34 105 38 100 Z" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
            <path d="M 42 100 Q 46 105 50 100 Z" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
            <line x1="34" y1="85" x2="34" y2="100" stroke="#0f172a" strokeWidth="0.8" />
            <line x1="46" y1="85" x2="46" y2="100" stroke="#0f172a" strokeWidth="0.8" />
            {/* Head & Crown */}
            <circle cx="60" cy="50" r="7" fill="#fed7aa" stroke="#0f172a" strokeWidth="1.5" />
            <polygon points="50,44 60,34 70,44" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
          </g>
        );

      case 9: // L'HERMITE (The Hermit)
        return (
          <g>
            {/* Mountain Slope */}
            <path d="M 10 160 L 110 145" stroke="#0f172a" strokeWidth="2" />
            {/* Long Heavy Hooded Cloak */}
            <path d="M 35 155 L 45 60 L 80 60 L 85 155 Z" fill="#1e3a8a" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 45 70 L 60 155 L 75 70 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="1" />
            {/* Raised Lantern illuminating the path */}
            <line x1="72" y1="70" x2="88" y2="58" stroke="#fed7aa" strokeWidth="3" strokeLinecap="round" />
            <rect x="84" y="48" width="14" height="20" fill="#fef08a" stroke="#0f172a" strokeWidth="1.5" rx="2" />
            <circle cx="91" cy="58" r="4" fill="#fbbf24" className="animate-pulse" />
            {/* Yellow light rays from lantern */}
            <line x1="98" y1="52" x2="108" y2="48" stroke="#facc15" strokeWidth="1.5" />
            <line x1="98" y1="58" x2="110" y2="58" stroke="#facc15" strokeWidth="1.5" />
            <line x1="98" y1="64" x2="108" y2="68" stroke="#facc15" strokeWidth="1.5" />
            {/* Golden Walking Cane */}
            <line x1="50" y1="90" x2="35" y2="155" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" />
            {/* Head, Hood and White Beard */}
            <circle cx="58" cy="52" r="6.5" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <path d="M 48 52 C 48 38 68 38 68 52 Z" fill="#1e3a8a" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 54 55 Q 58 66 62 55 Z" fill="#f8fafc" stroke="#0f172a" strokeWidth="1" />
          </g>
        );

      case 10: // LA ROUE DE FORTUNE (Wheel of Fortune)
        return (
          <g>
            {/* Wooden Base Pillars */}
            <line x1="35" y1="155" x2="52" y2="100" stroke="#78350f" strokeWidth="3" />
            <line x1="85" y1="155" x2="68" y2="100" stroke="#78350f" strokeWidth="3" />
            <line x1="30" y1="155" x2="90" y2="155" stroke="#78350f" strokeWidth="2" />
            {/* Wheel with 6 Spokes */}
            <circle cx="60" cy="95" r="30" fill="none" stroke="#ca8a04" strokeWidth="3.5" />
            <circle cx="60" cy="95" r="24" fill="#fef08a" stroke="#0f172a" strokeWidth="1.5" opacity="0.5" />
            <circle cx="60" cy="95" r="5" fill="#dc2626" stroke="#0f172a" strokeWidth="1.5" />
            {/* Spokes */}
            <line x1="60" y1="65" x2="60" y2="125" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="34" y1="80" x2="86" y2="110" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="34" y1="110" x2="86" y2="80" stroke="#0f172a" strokeWidth="1.5" />
            {/* Sphinx on top of Wheel holding sword */}
            <path d="M 52 65 C 52 48 68 48 68 65 Z" fill="#3b82f6" stroke="#0f172a" strokeWidth="1.5" />
            <polygon points="56,48 60,40 64,48" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
            <line x1="68" y1="52" x2="78" y2="44" stroke="#94a3b8" strokeWidth="2" />
            {/* Ascending Creature (Hermanubis) on Right */}
            <circle cx="94" cy="85" r="4.5" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
            <path d="M 88 102 L 95 85 L 98 102 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1" />
            {/* Descending Creature (Typhon) on Left */}
            <circle cx="26" cy="105" r="4.5" fill="#ef4444" stroke="#0f172a" strokeWidth="1" />
            <path d="M 22 92 L 26 108 L 32 92 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="1" />
          </g>
        );

      case 11: // LA FORCE (Strength)
        return (
          <g>
            {/* Woman Figure */}
            <path d="M 32 155 L 42 75 L 70 75 L 78 155 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 44 75 L 56 150 L 68 75 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="1" />
            {/* Head & Lemniscate Hat */}
            <circle cx="56" cy="55" r="7" fill="#fed7aa" stroke="#0f172a" strokeWidth="1.5" />
            <ellipse cx="56" cy="48" rx="20" ry="6" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 46 48 C 48 36 64 36 66 48 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="1" />
            {/* Yellow Lion */}
            <path d="M 62 110 Q 90 95 92 145 L 68 155 Z" fill="#fbbf24" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="78" cy="115" r="10" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.5" />
            {/* Hands gently holding the Lion's mouth */}
            <path d="M 64 108 L 74 112" stroke="#fed7aa" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 64 122 L 74 118" stroke="#fed7aa" strokeWidth="3.5" strokeLinecap="round" />
            {/* Lion Mane details */}
            <path d="M 72 105 Q 80 98 88 108" stroke="#78350f" strokeWidth="1.5" fill="none" />
          </g>
        );

      case 12: // LE PENDU (The Hanged Man)
        return (
          <g>
            {/* Wooden Gallows Structure (2 side trees with cut branches & 1 crossbeam) */}
            <rect x="22" y="28" width="76" height="6" fill="#78350f" stroke="#0f172a" strokeWidth="1.5" />
            <rect x="22" y="34" width="8" height="125" fill="#15803d" stroke="#0f172a" strokeWidth="1.5" />
            <rect x="90" y="34" width="8" height="125" fill="#15803d" stroke="#0f172a" strokeWidth="1.5" />
            {/* Rope tied to left ankle */}
            <line x1="60" y1="34" x2="60" y2="60" stroke="#fbbf24" strokeWidth="2.5" />
            {/* Legs: Right leg hanging straight, Left leg forming a '4' */}
            <line x1="60" y1="60" x2="60" y2="95" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
            <path d="M 60 78 L 42 78 L 60 95" stroke="#dc2626" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Blue and Gold Tunic with buttons */}
            <path d="M 50 95 L 70 95 L 68 130 L 52 130 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="60" cy="104" r="2" fill="#fbbf24" />
            <circle cx="60" cy="114" r="2" fill="#fbbf24" />
            <circle cx="60" cy="124" r="2" fill="#fbbf24" />
            {/* Hands folded behind back */}
            <path d="M 48 118 L 40 108 L 48 100" stroke="#fed7aa" strokeWidth="2" fill="none" />
            <path d="M 72 118 L 80 108 L 72 100" stroke="#fed7aa" strokeWidth="2" fill="none" />
            {/* Inverted Head with Golden Halo / Radiance */}
            <circle cx="60" cy="142" r="8" fill="#fed7aa" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="60" cy="142" r="14" fill="none" stroke="#facc15" strokeWidth="1.5" strokeDasharray="3 3" className="animate-spin-slow" />
          </g>
        );

      case 13: // L'ARCANE SANS NOM / LA MORT (Death)
        return (
          <g>
            {/* Black Earth littered with bones and sprouting heads */}
            <rect x="15" y="140" width="90" height="20" fill="#0f172a" />
            <circle cx="30" cy="148" r="4.5" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <polygon points="28,144 32,141 36,144" fill="#facc15" />
            <circle cx="90" cy="148" r="4.5" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            {/* Sprouting grass from dark soil */}
            <path d="M 50 142 L 53 134 M 70 142 L 67 134" stroke="#eab308" strokeWidth="1.5" />
            {/* Skeleton Figure walking to the right */}
            {/* Pelvis and Legs */}
            <line x1="45" y1="145" x2="52" y2="105" stroke="#fed7aa" strokeWidth="3" />
            <line x1="68" y1="145" x2="58" y2="105" stroke="#fed7aa" strokeWidth="3" />
            {/* Ribcage */}
            <ellipse cx="55" cy="80" rx="9" ry="14" fill="#fed7aa" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="47" y1="74" x2="63" y2="74" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="46" y1="80" x2="64" y2="80" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="48" y1="86" x2="62" y2="86" stroke="#0f172a" strokeWidth="1.5" />
            {/* Skull */}
            <circle cx="56" cy="54" r="7" fill="#fed7aa" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="54" cy="53" r="1.5" fill="#0f172a" />
            <circle cx="59" cy="53" r="1.5" fill="#0f172a" />
            {/* Great Scythe */}
            <path d="M 45 150 L 72 45" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 72 45 Q 98 35 92 65" stroke="#94a3b8" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );

      case 14: // TEMPERANCE (Temperance)
        return (
          <g>
            {/* Great Angelic Wings */}
            <path d="M 48 65 Q 15 35 25 85 Q 40 85 46 80" fill="#3b82f6" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 72 65 Q 105 35 95 85 Q 80 85 74 80" fill="#3b82f6" stroke="#0f172a" strokeWidth="1.5" />
            {/* Two-Toned Gown (Red & Blue) */}
            <path d="M 38 155 L 46 75 L 74 75 L 82 155 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 46 75 L 60 150 L 74 75 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1" />
            {/* Golden Flower / Five-Petal Rosette on forehead */}
            <circle cx="60" cy="52" r="7" fill="#fed7aa" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="60" cy="46" r="2.5" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
            {/* Two Urns: Blue & Red with fluid stream passing between them */}
            {/* Upper Blue Urn */}
            <path d="M 42 95 Q 40 82 48 85 Q 52 95 48 100 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1" />
            {/* Lower Red Urn */}
            <path d="M 72 120 Q 70 107 78 110 Q 82 120 78 125 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="1" />
            {/* Living Stream of Celestial Water */}
            <path d="M 48 95 Q 60 105 74 112" stroke="#38bdf8" strokeWidth="3" fill="none" className="animate-pulse" />
          </g>
        );

      case 15: // LE DIABLE (The Devil)
        return (
          <g>
            {/* Altar / Pedestal with ring */}
            <rect x="42" y="125" width="36" height="30" fill="#78350f" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="60" cy="138" r="4" fill="none" stroke="#facc15" strokeWidth="1.5" />
            {/* Two Imps Chained to pedestal */}
            <circle cx="28" cy="135" r="4.5" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <path d="M 22 155 L 28 140 L 34 155 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="1" />
            <line x1="28" y1="140" x2="56" y2="138" stroke="#0f172a" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="92" cy="135" r="4.5" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <path d="M 86 155 L 92 140 L 98 155 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="1" />
            <line x1="92" y1="140" x2="64" y2="138" stroke="#0f172a" strokeWidth="1" strokeDasharray="2 2" />
            {/* Devil Figure on Pedestal */}
            <path d="M 45 125 L 48 75 L 72 75 L 75 125 Z" fill="#3b82f6" stroke="#0f172a" strokeWidth="1.5" />
            {/* Bat Wings */}
            <path d="M 45 75 Q 10 50 30 90 Z" fill="#eab308" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 75 75 Q 110 50 90 90 Z" fill="#eab308" stroke="#0f172a" strokeWidth="1.5" />
            {/* Head with Stag Antlers */}
            <circle cx="60" cy="56" r="7" fill="#fed7aa" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 54 48 Q 42 32 46 22 M 50 34 L 44 38" stroke="#ca8a04" strokeWidth="2" fill="none" />
            <path d="M 66 48 Q 78 32 74 22 M 70 34 L 76 38" stroke="#ca8a04" strokeWidth="2" fill="none" />
            {/* Torch held downward in left hand */}
            <line x1="74" y1="85" x2="84" y2="70" stroke="#78350f" strokeWidth="2" />
            <circle cx="85" cy="67" r="3.5" fill="#ef4444" className="animate-pulse" />
          </g>
        );

      case 16: // LA MAISON DIEU (The Tower)
        return (
          <g>
            {/* Stone Brick Tower */}
            <polygon points="35,155 40,65 80,65 85,155" fill="#fef08a" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="40" y1="95" x2="80" y2="95" stroke="#0f172a" strokeWidth="1" />
            <line x1="38" y1="125" x2="82" y2="125" stroke="#0f172a" strokeWidth="1" />
            {/* Windows */}
            <rect x="46" y="105" width="8" height="12" fill="#2563eb" stroke="#0f172a" strokeWidth="1" />
            <rect x="66" y="105" width="8" height="12" fill="#2563eb" stroke="#0f172a" strokeWidth="1" />
            {/* Lightning bolt striking from sun/cloud */}
            <path d="M 85 20 L 68 45 L 76 48 L 56 70" stroke="#facc15" strokeWidth="3" fill="none" className="animate-pulse" />
            {/* Falling Golden Crown */}
            <polygon points="48,45 54,35 60,42 66,35 72,45" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" transform="rotate(-20 60 40)" />
            {/* Sparkles / Yods raining from heaven */}
            <circle cx="28" cy="45" r="2" fill="#ef4444" />
            <circle cx="34" cy="65" r="2.5" fill="#facc15" />
            <circle cx="88" cy="75" r="2" fill="#2563eb" />
            <circle cx="94" cy="55" r="2.5" fill="#ef4444" />
            {/* Two falling human figures */}
            <circle cx="28" cy="110" r="4" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <line x1="28" y1="114" x2="22" y2="135" stroke="#dc2626" strokeWidth="3" />
            <circle cx="92" cy="115" r="4" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <line x1="92" y1="119" x2="98" y2="140" stroke="#2563eb" strokeWidth="3" />
          </g>
        );

      case 17: // L'ETOILE (The Star)
        return (
          <g>
            {/* Night Sky & Great 8-Pointed Star */}
            <polygon points="60,20 63,30 73,33 63,36 60,46 57,36 47,33 57,30" fill="#facc15" stroke="#0f172a" strokeWidth="1" className="animate-pulse" />
            {/* 7 Smaller Colored Stars */}
            <circle cx="26" cy="30" r="3" fill="#ef4444" />
            <circle cx="42" cy="22" r="3" fill="#3b82f6" />
            <circle cx="78" cy="22" r="3" fill="#ef4444" />
            <circle cx="94" cy="30" r="3" fill="#3b82f6" />
            <circle cx="20" cy="50" r="2.5" fill="#eab308" />
            <circle cx="100" cy="50" r="2.5" fill="#eab308" />
            <circle cx="88" cy="60" r="2" fill="#10b981" />
            {/* Tree with small Blackbird / Phoenix perched */}
            <path d="M 95 130 L 98 85 M 98 85 L 90 75 M 98 85 L 105 78" stroke="#78350f" strokeWidth="2" />
            <circle cx="90" cy="72" r="3" fill="#0f172a" />
            {/* Kneeling Naked Maiden */}
            <circle cx="56" cy="78" r="6" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <path d="M 52 84 L 56 125 L 45 150" stroke="#fed7aa" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 56 115 L 75 145" stroke="#fed7aa" strokeWidth="4" strokeLinecap="round" />
            {/* Two Pitchers pouring into Earth & Water */}
            <path d="M 38 105 Q 35 95 44 95 Q 46 105 40 112 Z" fill="#ef4444" stroke="#0f172a" strokeWidth="1" />
            <path d="M 72 108 Q 70 98 78 98 Q 80 108 74 115 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1" />
            {/* Rivers of living water flowing */}
            <path d="M 38 112 Q 30 130 15 145" stroke="#38bdf8" strokeWidth="2.5" fill="none" />
            <path d="M 72 115 Q 65 135 50 155" stroke="#38bdf8" strokeWidth="2.5" fill="none" />
          </g>
        );

      case 18: // LA LUNE (The Moon)
        return (
          <g>
            {/* Radiant Moon Face in Profile with 19 colored moisture drops */}
            <circle cx="60" cy="38" r="18" fill="#fef08a" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 54 22 C 66 26 66 50 54 54 Z" fill="#38bdf8" stroke="#0f172a" strokeWidth="1" />
            <circle cx="58" cy="34" r="1.5" fill="#0f172a" />
            {/* Colored Drops */}
            <circle cx="34" cy="45" r="2" fill="#ef4444" />
            <circle cx="42" cy="55" r="2" fill="#3b82f6" />
            <circle cx="78" cy="55" r="2" fill="#ef4444" />
            <circle cx="86" cy="45" r="2" fill="#facc15" />
            {/* Two Stone Watchtowers */}
            <rect x="15" y="65" width="16" height="55" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.5" />
            <polygon points="12,65 23,55 34,65" fill="#dc2626" stroke="#0f172a" strokeWidth="1" />
            <rect x="89" y="65" width="16" height="55" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.5" />
            <polygon points="86,65 97,55 108,65" fill="#dc2626" stroke="#0f172a" strokeWidth="1" />
            {/* Two Howling Dogs / Wolves */}
            <path d="M 38 128 C 32 112 45 105 45 128 Z" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 82 128 C 88 112 75 105 75 128 Z" fill="#3b82f6" stroke="#0f172a" strokeWidth="1.5" />
            {/* Water Pool with Great Crayfish / Lobster */}
            <ellipse cx="60" cy="148" rx="42" ry="12" fill="#0284c7" stroke="#0f172a" strokeWidth="1.5" />
            <ellipse cx="60" cy="148" rx="14" ry="6" fill="#ef4444" stroke="#0f172a" strokeWidth="1" />
            <line x1="50" y1="145" x2="42" y2="142" stroke="#ef4444" strokeWidth="2" />
            <line x1="70" y1="145" x2="78" y2="142" stroke="#ef4444" strokeWidth="2" />
          </g>
        );

      case 19: // LE SOLEIL (The Sun)
        return (
          <g>
            {/* Radiant Sun Face with Alternating Straight & Flame Rays */}
            <circle cx="60" cy="38" r="18" fill="#fbbf24" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="54" cy="34" r="1.5" fill="#0f172a" />
            <circle cx="66" cy="34" r="1.5" fill="#0f172a" />
            <path d="M 55 44 Q 60 48 65 44" stroke="#0f172a" strokeWidth="1.5" fill="none" />
            {/* Sun Rays */}
            <line x1="60" y1="15" x2="60" y2="5" stroke="#ef4444" strokeWidth="2.5" />
            <line x1="60" y1="61" x2="60" y2="71" stroke="#ef4444" strokeWidth="2.5" />
            <line x1="37" y1="38" x2="27" y2="38" stroke="#ef4444" strokeWidth="2.5" />
            <line x1="83" y1="38" x2="93" y2="38" stroke="#ef4444" strokeWidth="2.5" />
            <line x1="43" y1="21" x2="35" y2="13" stroke="#facc15" strokeWidth="2" />
            <line x1="77" y1="21" x2="85" y2="13" stroke="#facc15" strokeWidth="2" />
            <line x1="43" y1="55" x2="35" y2="63" stroke="#facc15" strokeWidth="2" />
            <line x1="77" y1="55" x2="85" y2="63" stroke="#facc15" strokeWidth="2" />
            {/* Yellow Brick Wall */}
            <rect x="25" y="115" width="70" height="40" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="25" y1="128" x2="95" y2="128" stroke="#78350f" strokeWidth="1" />
            <line x1="25" y1="141" x2="95" y2="141" stroke="#78350f" strokeWidth="1" />
            {/* Two Twin Children Embracing */}
            <circle cx="48" cy="92" r="6" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <path d="M 42 120 L 48 98 L 54 120 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1" />
            <circle cx="72" cy="92" r="6" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <path d="M 66 120 L 72 98 L 78 120 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="1" />
            {/* Embracing Arms */}
            <line x1="52" y1="100" x2="68" y2="100" stroke="#fed7aa" strokeWidth="3" strokeLinecap="round" />
          </g>
        );

      case 20: // LE JUGEMENT (Judgement)
        return (
          <g>
            {/* Radiant Celestial Clouds */}
            <path d="M 20 30 Q 35 15 50 25 Q 60 10 70 25 Q 85 15 100 30" stroke="#38bdf8" strokeWidth="2" fill="#e0f2fe" />
            {/* Archangel with Golden Trumpet and St. George Banner */}
            <circle cx="60" cy="40" r="7" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <path d="M 45 60 Q 20 40 32 75" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
            <path d="M 75 60 Q 100 40 88 75" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
            {/* Trumpet */}
            <line x1="62" y1="44" x2="85" y2="60" stroke="#ca8a04" strokeWidth="2.5" />
            <polygon points="85,55 95,50 95,70 85,65" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
            {/* Flag with Red Cross */}
            <rect x="70" y="60" width="16" height="14" fill="#f8fafc" stroke="#0f172a" strokeWidth="1" />
            <line x1="78" y1="60" x2="78" y2="74" stroke="#ef4444" strokeWidth="2" />
            <line x1="70" y1="67" x2="86" y2="67" stroke="#ef4444" strokeWidth="2" />
            {/* Open Tomb and 3 Resurrected Figures */}
            <rect x="35" y="130" width="50" height="25" fill="#64748b" stroke="#0f172a" strokeWidth="1.5" />
            {/* Youth rising with hands in prayer (seen from back) */}
            <circle cx="60" cy="115" r="5" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <path d="M 54 135 L 60 120 L 66 135 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="1" />
            {/* Mother on left */}
            <circle cx="42" cy="120" r="4.5" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <path d="M 36 140 L 42 125 L 48 140 Z" fill="#dc2626" stroke="#0f172a" strokeWidth="1" />
            {/* Father on right */}
            <circle cx="78" cy="120" r="4.5" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <path d="M 72 140 L 78 125 L 84 140 Z" fill="#15803d" stroke="#0f172a" strokeWidth="1" />
          </g>
        );

      case 21: // LE MONDE (The World)
        return (
          <g>
            {/* Oval Laurel Wreath (Mandorla / Vesica Piscis) */}
            <ellipse cx="60" cy="90" rx="28" ry="42" fill="#fef08a" stroke="#15803d" strokeWidth="4" opacity="0.9" />
            <ellipse cx="60" cy="90" rx="26" ry="40" fill="none" stroke="#ca8a04" strokeWidth="1.5" />
            {/* Red Ribbons tying top and bottom of wreath */}
            <polygon points="56,48 60,44 64,48 60,52" fill="#ef4444" />
            <polygon points="56,132 60,128 64,132 60,136" fill="#ef4444" />
            {/* Central Dancing Maiden (Nymph) holding two wands */}
            <circle cx="60" cy="74" r="6" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            {/* Flowing Violet Scarf */}
            <path d="M 52 80 Q 45 95 62 105 Q 75 95 68 80 Z" fill="#9333ea" stroke="#0f172a" strokeWidth="1" />
            <line x1="58" y1="105" x2="58" y2="120" stroke="#fed7aa" strokeWidth="3" strokeLinecap="round" />
            <line x1="58" y1="112" x2="68" y2="106" stroke="#fed7aa" strokeWidth="2.5" strokeLinecap="round" />
            {/* Two Wand Sticks in Hands */}
            <line x1="46" y1="72" x2="46" y2="98" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
            <line x1="74" y1="72" x2="74" y2="98" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
            {/* 4 Evangelist Creatures in the Four Corners */}
            {/* Top Left: Angel (Human / Aquarius) */}
            <circle cx="22" cy="30" r="5" fill="#fed7aa" stroke="#0f172a" strokeWidth="1" />
            <path d="M 16 42 L 22 35 L 28 42 Z" fill="#38bdf8" stroke="#0f172a" strokeWidth="1" />
            {/* Top Right: Eagle (Scorpio / Air) */}
            <path d="M 94 25 L 102 32 L 98 42 L 90 35 Z" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
            {/* Bottom Left: Ox / Bull (Taurus / Earth) */}
            <ellipse cx="22" cy="148" rx="7" ry="5" fill="#ca8a04" stroke="#0f172a" strokeWidth="1" />
            {/* Bottom Right: Lion (Leo / Fire) */}
            <ellipse cx="98" cy="148" rx="7" ry="5" fill="#ef4444" stroke="#0f172a" strokeWidth="1" />
          </g>
        );

      default:
        return (
          <g>
            <circle cx="60" cy="90" r="25" fill="#facc15" opacity="0.3" />
            <polygon points="60,65 75,95 45,95" fill="#fbbf24" stroke="#0f172a" strokeWidth="1.5" />
          </g>
        );
    }
  };

  const traditionalMarseilleLabel =
    marseilleTitle ||
    [
      "LE MAT",
      "LE BATELEVR",
      "LA PAPESSE",
      "L'IMPERATRICE",
      "L'EMPEREVR",
      "LE PAPE",
      "L'AMOUREVX",
      "LE CHARIOT",
      "LA IVSTICE",
      "L'HERMITE",
      "LA ROVE DE FORTVNE",
      "LA FORCE",
      "LE PENDV",
      "L'ARCANE SANS NOM",
      "TEMPERANCE",
      "LE DIABLE",
      "LA MAISON DIEV",
      "L'ESTOILLE",
      "LA LVNE",
      "LE SOLEIL",
      "LE IVGEMENT",
      "LE MONDE",
    ][cardId] ||
    name.toUpperCase();

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden select-none flex flex-col justify-between p-2 bg-[#f6eee0] text-[#1c1308] border-2 border-[#3d2b1f] shadow-inner font-cinzel">
      {/* Antique Paper Texture & Medieval Woodblock Vignette Filter */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.85)_0%,rgba(240,225,195,0.7)_60%,rgba(195,160,110,0.5)_100%)] pointer-events-none" />

      {/* Medieval Dual Woodcut Outer Border */}
      <div className="absolute inset-1 border-2 border-[#2b1810] rounded-lg pointer-events-none opacity-90" />
      <div className="absolute inset-2 border border-[#8a6240]/60 rounded-md pointer-events-none" />

      {/* === LIVING FLICKERING CANDLELIGHT & AURA SHIMMER ("CARACTERÍSTICAS TITILANTES") === */}
      {/* 1. Main Candlelight Flame Glow Layer */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-500 mix-blend-color-dodge ${
          isFlipping ? "animate-candle-flicker-fast opacity-95" : "animate-candle-flicker opacity-85"
        }`}
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${colorHex}99 0%, rgba(251,191,36,0.45) 40%, rgba(217,119,6,0.2) 65%, transparent 80%)`,
        }}
      />

      {/* 2. Secondary Warm Flame Dancing Atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none animate-flame-dancing mix-blend-soft-light opacity-80"
        style={{
          background: "radial-gradient(circle at 48% 55%, rgba(254,240,138,0.7) 0%, rgba(245,158,11,0.3) 50%, transparent 75%)",
        }}
      />

      {/* 3. Shimmering Holographic Ray across the card */}
      <div
        className={`absolute inset-0 pointer-events-none overflow-hidden ${
          isFlipping || isHovered ? "opacity-100" : "opacity-45"
        }`}
      >
        <div className="w-36 h-full bg-gradient-to-r from-transparent via-amber-200/50 to-transparent -skew-x-25 animate-holo-shimmer" />
      </div>

      {/* 4. Golden Sparkle Glints & Mystic Embers */}
      <div className="absolute top-3 right-3 text-amber-500 animate-spark-twinkle pointer-events-none opacity-90">
        <Sparkles className="w-3.5 h-3.5 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
      </div>
      <div className="absolute bottom-11 left-3 text-amber-500 animate-spark-twinkle pointer-events-none opacity-85" style={{ animationDelay: "1.1s" }}>
        <Sparkles className="w-3 h-3 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]" />
      </div>
      <div className="absolute top-12 left-2.5 text-amber-400 animate-spark-twinkle pointer-events-none opacity-70" style={{ animationDelay: "1.8s" }}>
        <Sparkles className="w-2.5 h-2.5 drop-shadow" />
      </div>

      {/* === TOP MARSEILLE BANNER: ROMAN NUMERAL === */}
      <div className="relative z-10 text-center pt-0.5 pb-1 border-b border-[#2b1810]">
        <span className="text-xs sm:text-sm font-cinzel font-black tracking-widest text-[#2b1810] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
          {romanNumber}
        </span>
      </div>

      {/* === CENTER SVG WOODCUT ARTWORK (Tarot de Marseille) === */}
      <div className="relative z-10 my-auto flex items-center justify-center py-1">
        <svg
          viewBox="0 0 120 180"
          className="w-full max-h-52 sm:max-h-56 filter drop-shadow-[0_2px_4px_rgba(43,24,16,0.25)] transition-transform duration-500 group-hover:scale-105"
        >
          {/* Subtle Vintage Etching Grid / Sky Tint */}
          <rect x="10" y="10" width="100" height="160" fill="none" stroke="#d4b896" strokeWidth="0.5" strokeDasharray="2 4" />
          {renderMarseilleIllustration()}
        </svg>
      </div>

      {/* === BOTTOM MARSEILLE BANNER: FRENCH TRADITIONAL TITLE === */}
      <div className="relative z-10 text-center py-1 bg-[#ecd9b8]/90 border-t-2 border-[#2b1810] rounded-b-md shadow-sm">
        <h4 className="text-[10px] sm:text-[11px] font-black font-cinzel text-[#2b1810] tracking-wider uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
          {traditionalMarseilleLabel}
        </h4>
        <div className="text-[8px] font-semibold text-[#664228] font-gothic tracking-tight">
          {name}
        </div>
      </div>
    </div>
  );
};
