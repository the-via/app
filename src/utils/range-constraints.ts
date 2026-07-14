import type {RangeConstraint, VIAControlItem} from '@the-via/reader';

export type RangeControl = Extract<VIAControlItem, {type: 'range'}>;
export type RangeControlMap = Record<string, RangeControl>;
export type LogicalRangeValues = Record<string, number>;

const referenceId = (constraint: RangeConstraint) =>
  typeof constraint.reference === 'string'
    ? constraint.reference
    : constraint.reference[0];

export const decodeRangeValue = (value: number[], max: number) =>
  max > 255 ? (value[0] << 8) | value[1] : value[0];

export const encodeRangeValue = (value: number, max: number) =>
  max > 255 ? [value >> 8, value & 255] : [value];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const constraintBoundary = (
  constraint: RangeConstraint,
  referencedValue: number,
) => {
  const offsetValue = referencedValue + (constraint.offset ?? 0);
  switch (constraint.operator) {
    case '>':
      return offsetValue + 1;
    case '>=':
      return offsetValue;
    case '<':
      return offsetValue - 1;
    case '<=':
      return offsetValue;
  }
};

const violates = (
  value: number,
  constraint: RangeConstraint,
  referencedValue: number,
) => {
  const comparedValue = referencedValue + (constraint.offset ?? 0);
  switch (constraint.operator) {
    case '>':
      return value <= comparedValue;
    case '>=':
      return value < comparedValue;
    case '<':
      return value >= comparedValue;
    case '<=':
      return value > comparedValue;
  }
};

export const getRangeBounds = (
  id: string,
  controls: RangeControlMap,
  values: LogicalRangeValues,
  clampConstraintsOnly = false,
  ignoredReferenceId?: string,
) => {
  const control = controls[id];
  let [min, max] = control.options;

  for (const constraint of control.constraints ?? []) {
    if (
      (clampConstraintsOnly && constraint.onViolation === 'push') ||
      referenceId(constraint) === ignoredReferenceId
    ) {
      continue;
    }
    const referencedValue = values[referenceId(constraint)];
    if (referencedValue === undefined) {
      continue;
    }
    const boundary = constraintBoundary(constraint, referencedValue);
    if (constraint.operator === '>' || constraint.operator === '>=') {
      min = Math.max(min, boundary);
    } else {
      max = Math.min(max, boundary);
    }
  }

  return {min, max};
};

export const resolveRangeChange = (
  id: string,
  requestedValue: number,
  controls: RangeControlMap,
  currentValues: LogicalRangeValues,
): LogicalRangeValues => {
  const control = controls[id];
  const values = {...currentValues};
  values[id] = clamp(requestedValue, control.options[0], control.options[1]);

  for (const constraint of control.constraints ?? []) {
    const referencedId = referenceId(constraint);
    const referencedValue = values[referencedId];
    if (
      referencedValue === undefined ||
      !violates(values[id], constraint, referencedValue)
    ) {
      continue;
    }

    if (constraint.onViolation === 'push') {
      const strictAdjustment =
        constraint.operator === '>' ? -1 : constraint.operator === '<' ? 1 : 0;
      const desiredReference =
        values[id] - (constraint.offset ?? 0) + strictAdjustment;
      const referenceBounds = getRangeBounds(
        referencedId,
        controls,
        values,
        false,
        id,
      );
      values[referencedId] = clamp(
        desiredReference,
        referenceBounds.min,
        referenceBounds.max,
      );
    }

    const boundary = constraintBoundary(constraint, values[referencedId]);
    if (constraint.operator === '>' || constraint.operator === '>=') {
      values[id] = Math.max(values[id], boundary);
    } else {
      values[id] = Math.min(values[id], boundary);
    }
  }

  const finalBounds = getRangeBounds(id, controls, values);
  values[id] = clamp(values[id], finalBounds.min, finalBounds.max);
  return values;
};

export const collectRangeControls = (menus: unknown[]): RangeControlMap => {
  const controls: RangeControlMap = {};
  const visit = (value: unknown) => {
    if (!value || typeof value !== 'object') {
      return;
    }
    if ('type' in value && value.type === 'range' && 'content' in value) {
      const range = value as RangeControl;
      controls[range.content[0]] = range;
      return;
    }
    if ('content' in value && Array.isArray(value.content)) {
      value.content.forEach(visit);
    }
  };
  menus.forEach(visit);
  return controls;
};
