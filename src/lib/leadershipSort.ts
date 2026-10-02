import { LeaderItem } from '@/lib/dataStore';

const leadershipRoleOrder = [
  'Direktor',
  'OʻIB direktor oʻrinbosari',
  'MM va TIB direktor oʻrinbosari',
  'M va XTB direktor oʻrinbosari',
  'Oʻquv kursi komandiri',
  'Kafedra boshligʻi',
  'Bosh mutaxassis',
  'Yoshlar yetakchisi',
  'Oʻquv boʻlim mudiri',
  'Oʻquv boʻlim uslubchisi',
  'Toʻgarak rahbari',
  'Yuriskonsult',
  'Psixolog',
  'Katta inspektor',
  'Bosh buxgalter',
  'Buxgalter',
  'Tibbiy xamshira',
  'Kanselyariya ish yurituvchisi',
  'Arm rahbari',
  'Kutubxonachi',
  'Ona tili va adabiyot fani oʻqituvchisi',
  'Rus tili fani oʻqituvchisi',
  'Ingliz tili fani oʻqituvchisi',
  'Fransuz tili fani oʻqituvchisi',
  'Nemis tili fani oʻqituvchisi',
  'Tarix fani oʻqituvchisi',
  'Matematika fani oʻqituvchisi',
  'Fizika fani oʻqituvchisi',
  'Huquq fani oʻqituvchisi',
  'Kasbiy fan',
  'Informatika',
  'Biologiya fani oʻqituvchisi',
  'Jismoniy tarbiya oʻqituvchisi',
  'Ombor mudiri',
  'Komendant',
  'Yotoqxona navbatchisi',
  'Avtobus xaydovchi',
  'Haydovchi',
  'Qorovul',
  'Duradgor',
  'Elektromonter',
  'Xovli supuruvchi',
  'Farrosh',
  'Chilangar-santexnik',
];

const cyrillicToLatin: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', ғ: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z',
  и: 'i', й: 'y', к: 'k', қ: 'q', л: 'l', м: 'm', н: 'n', о: 'o', ў: 'o', п: 'p',
  р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ҳ: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'shch', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

function normalizeLeadershipRole(role: string): string {
  return role.normalize('NFKC').toLocaleLowerCase('uz-UZ')
    .replace(/[а-яёөүғқҳцчшщъыьэюя]/g, (letter) => cyrillicToLatin[letter] ?? letter)
    .replace(/[ʻ’‘ʼ`']/g, '')
    .replace(/[‐‑‒–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

const leadershipRoleRanks = new Map<string, number>(
  leadershipRoleOrder.map((role, index) => [normalizeLeadershipRole(role), index] as const)
);

const leadershipRoleAliases = new Map<string, string>([
  ['Oʻquv ishlari boʻyicha direktor oʻrinbosari', 'OʻIB direktor oʻrinbosari'],
  ['Maʼnaviyat-maʼrifat va tarbiyaviy ishlar boʻyicha direktor oʻrinbosari', 'MM va TIB direktor oʻrinbosari'],
  ['Maʼnaviyat va xoʻjalik ishlari boʻyicha direktor oʻrinbosari', 'M va XTB direktor oʻrinbosari'],
  ['Oʻquv kurs komandiri', 'Oʻquv kursi komandiri'],
  ['ARM raxbari', 'Arm rahbari'],
  ['Bosh bugalter', 'Bosh buxgalter'],
  ['Bugalter', 'Buxgalter'],
  ['Oʻquv boʻlimi mudiri', 'Oʻquv boʻlim mudiri'],
  ['Tibbiy hamshira', 'Tibbiy xamshira'],
  ['Toʻgarak raxbari', 'Toʻgarak rahbari'],
  ['Fransuz tili oʻqituvchisi', 'Fransuz tili fani oʻqituvchisi'],
  ['Informatika fani oʻqituvchisi', 'Informatika'],
  ['Avtobus haydovchi', 'Avtobus xaydovchi'],
  ['Hovli supuruvchi', 'Xovli supuruvchi'],
  ['Қоравул', 'Qorovul'],
].map(([role, canonicalRole]) => [normalizeLeadershipRole(role), normalizeLeadershipRole(canonicalRole)] as const));

function getLeadershipRoleRank(role: string): number {
  const normalizedRole = normalizeLeadershipRole(role);
  const canonicalRole = leadershipRoleAliases.get(normalizedRole) ?? normalizedRole;
  return leadershipRoleRanks.get(canonicalRole) ?? leadershipRoleOrder.length;
}

export type LeaderSortMode = 'name' | 'role';

export function sortLeaders(leaders: LeaderItem[], mode: LeaderSortMode): LeaderItem[] {
  return [...leaders].sort((first, second) => {
    const primaryOrder = mode === 'name'
      ? first.name.localeCompare(second.name, 'uz-UZ')
      : getLeadershipRoleRank(first.role) - getLeadershipRoleRank(second.role) || first.role.localeCompare(second.role, 'uz-UZ');
    return primaryOrder || first.name.localeCompare(second.name, 'uz-UZ');
  });
}