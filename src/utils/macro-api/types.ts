export enum RawKeycodeSequenceAction {
  Tap = 1, // \x01
  Down = 2, // \x02
  Up = 3, // \x03
  Delay = 4, // \x04
  Character = 42, // This is not a real QMK tag, it is implied from the absence of a tag
}

export enum GroupedKeycodeSequenceAction {
  Chord = 5,
  CharacterStream = 6,
}

export type RawKeycodeSequenceItem = [
  RawKeycodeSequenceAction,
  string | number,
];

export type GroupedKeycodeSequenceItem = [
  GroupedKeycodeSequenceAction,
  string[],
];

export type RawKeycodeSequence = RawKeycodeSequenceItem[];
export type OptimizedKeycodeSequence = (
  | RawKeycodeSequenceItem
  | RawKeycodeSequence
)[];
