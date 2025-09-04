export type Attribute =
  | "Auric Ink"
  | "Electric"
  | "Ether"
  | "Fire"
  | "Frost"
  | "Ice"
  | "Physical";

export type Rank = "A" | "S" | "S-2";

export type Specialty =
  | "Attack"
  | "Defense"
  | "Support"
  | "Anomaly"
  | "Healing"
  | "Stun";

export interface Character {
  id: string;
  name: string;
  imageUrl: string;
  attribute?: Attribute;
  specialty?: Specialty;
  rank?: Rank;
}

export function getAttributeIcon(attribute: Attribute): string {
  const iconMap: Record<Attribute, string> = {
    "Auric Ink": "/attribute/Icon_Auric_Ink.webp",
    Electric: "/attribute/Icon_Electric.webp",
    Ether: "/attribute/Icon_Ether.webp",
    Fire: "/attribute/Icon_Fire.webp",
    Frost: "/attribute/Icon_Frost.webp",
    Ice: "/attribute/Icon_Ice.webp",
    Physical: "/attribute/Icon_Physical.webp",
  };
  return iconMap[attribute] || "/attribute/Icon_Physical.webp";
}

export function getRankIcon(rank: Rank): string {
  // For 'S' rank, use the 'S-2' icon since we don't have a separate 'S' icon
  const rankValue = rank === "S" ? "S-2" : rank;
  return `/ranks/Icon_AgentRank_${rankValue}.webp`;
}

export function getSpecialtyIcon(specialty: Specialty): string {
  const iconMap: Record<Specialty, string> = {
    Attack: "/specialty/Icon_Attack.webp",
    Defense: "/specialty/Icon_Defense.webp",
    Support: "/specialty/Icon_Support.webp",
    Anomaly: "/specialty/Icon_Anomaly.webp",
    Healing: "/specialty/Icon_Healing.webp",
    Stun: "/specialty/Icon_Stun.webp",
  };
  return iconMap[specialty] || "/specialty/Icon_Support.webp";
}
