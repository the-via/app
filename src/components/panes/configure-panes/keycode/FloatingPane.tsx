import React from 'react';
import cntl from 'cntl';
import {getKeycodes, getOtherMenu} from 'src/utils/key';
import KeycodeCategory from './KeycodeCategory';
import KeycodeCategoryLabel from './KeycodeCategoryLabel';
import ControlButton from 'src/components/controls/ControlButton';

const KeycodeCategories = getKeycodes()
  .concat(getOtherMenu())
  .filter((menu) => !['Other', 'Mod+_'].includes(menu.label));

const floatingPaneClassName = cntl`
  border
  border-dark
  bottom-4
  flex
  flex-col
  left-5
  m-8
  rounded
  w-1/4
`;

const keycodesListClassName = cntl`
  flex
  flex-col
  px-4
  pb-4
  gap-6
  overflow-y-auto
`;

const searchInputClassName = cntl`
  bg-inherit
  border-secondary
  border-2
  border-solid
  px-2
  py-1
  rounded-lg
  text-light
  w-full
  focus:border-accent
`;

export default function FloatingPane() {
  const [search, setSearch] = React.useState<string>();

  const onSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    [],
  );

  const Categories = KeycodeCategories.map((keycodeCategory) => {
    return (
      <KeycodeCategory
        activeSearch={search}
        key={keycodeCategory.label}
        keycodes={keycodeCategory.keycodes}
      >
        <KeycodeCategoryLabel>{keycodeCategory.label}</KeycodeCategoryLabel>
      </KeycodeCategory>
    );
  });

  return (
    <div className={floatingPaneClassName}>
      <div className="grid grid-flow-col">
        <div className="flex m-4 items-center justify-center">
          <ControlButton isSelected={true}>Keymap</ControlButton>
        </div>
        <div className="flex items-center justify-center">
          <ControlButton isSelected={false}>Lighting</ControlButton>
        </div>
      </div>
      <div className="m-4">
        <input
          className={searchInputClassName}
          placeholder="Search…"
          onChange={onSearchChange}
        />
      </div>
      <div className={keycodesListClassName}>{Categories}</div>
    </div>
  );
}
