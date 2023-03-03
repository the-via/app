export enum RawKeycodeSequenceAction {
  Tap = 1,
  Down = 2,
  Up = 3,
  Delay = 4,
  CharacterStream = 5,
}

export enum GroupedKeycodeSequenceAction {
  Chord = 6,
}

export type RawKeycodeSequenceItem = [
  RawKeycodeSequenceAction,
  string | number,
];

export type RawKeycodeSequence = RawKeycodeSequenceItem[];

export type GroupedKeycodeSequenceItem = [
  GroupedKeycodeSequenceAction,
  string[],
];

export type OptimizedKeycodeSequenceItem =
  | RawKeycodeSequenceItem
  | GroupedKeycodeSequenceItem;

export type OptimizedKeycodeSequence = OptimizedKeycodeSequenceItem[];
