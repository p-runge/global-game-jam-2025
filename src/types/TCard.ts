export type TCard = {
    id: string
    name: string
    location: Location
    opponentsHand: boolean
}
export enum Location {
    Hand = "Hand",
    Board = "Board",
    Graveyard = "Graveyard",
    Deck = "Deck"
}