import { Flashcard, MatchTileModel } from '@/src/types';
import { cardSideText } from '@/src/utils/cardText';

export const MATCH_ROUND_SIZE = 6;
export const MATCH_MIN_CARDS = 3;

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function normalize(value: string): string {
    return value.trim().toLowerCase();
}

export function eligibleCards(cards: Flashcard[]): Flashcard[] {
    const seen = new Set<string>();
    const picked: Flashcard[] = [];

    for (const card of cards) {
        const term = normalize(card.term);
        const definition = normalize(card.definition);
        if (!term || !definition) continue;
        if (seen.has(term) || seen.has(definition)) continue;
        seen.add(term);
        seen.add(definition);
        picked.push(card);
    }

    return picked;
}

export function pickRoundCards(
    cards: Flashcard[],
    size: number = MATCH_ROUND_SIZE,
): Flashcard[] {
    return eligibleCards(shuffle(cards)).slice(0, size);
}

export function buildTiles(cards: Flashcard[]): MatchTileModel[] {
    const tiles: MatchTileModel[] = cards.flatMap((card) => [
        {
            tileId: `${card.id}:term`,
            cardId: card.id,
            side: 'term' as const,
            text: cardSideText(card.term),
            state: 'idle' as const,
        },
        {
            tileId: `${card.id}:definition`,
            cardId: card.id,
            side: 'definition' as const,
            text: cardSideText(card.definition),
            state: 'idle' as const,
        },
    ]);

    return shuffle(tiles);
}

export function isPair(a: MatchTileModel, b: MatchTileModel): boolean {
    return a.cardId === b.cardId && a.side !== b.side;
}
