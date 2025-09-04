export type Attribute = 
  | 'Auric Ink'
  | 'Electric'
  | 'Ether'
  | 'Fire'
  | 'Frost'
  | 'Ice'
  | 'Physical';

export type Rank = 'A' | 'S-2';

export interface Character {
  id: string;
  name: string;
  imageUrl: string;
  attribute: Attribute;
  rarity: 3 | 4 | 5; 
  rank: Rank;
}

export function getAttributeIcon(attribute: Attribute): string {
  const iconMap: Record<Attribute, string> = {
    'Auric Ink': '/attribute/Icon_Auric_Ink.webp',
    'Electric': '/attribute/Icon_Electric.webp',
    'Ether': '/attribute/Icon_Ether.webp',
    'Fire': '/attribute/Icon_Fire.webp',
    'Frost': '/attribute/Icon_Frost.webp',
    'Ice': '/attribute/Icon_Ice.webp',
    'Physical': '/attribute/Icon_Physical.webp'
  };
  return iconMap[attribute] || '/attribute/Icon_Physical.webp';
}

export function getRankIcon(rank: Rank): string {
  return `/ranks/Icon_AgentRank_${rank}.webp`;
}
