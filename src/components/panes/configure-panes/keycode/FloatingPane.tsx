import React from 'react';
import cntl from 'cntl';
import {getKeycodes, getOtherMenu} from 'src/utils/key';
import KeycodeCategory from './KeycodeCategory';
import KeycodeCategoryLabel from './KeycodeCategoryLabel';

const KeycodeCategories = getKeycodes()
  .concat(getOtherMenu())
  .filter((menu) => !['Other', 'Mod+_'].includes(menu.label));

const floatingPaneClassName = cntl`
  bg-background
  border
  border-dark
  bottom-4
  flex
  flex-col
  left-5
  rounded
  w-1/3
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
  bg-background
  border-medium
  border
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

  const onSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const Categories = KeycodeCategories.map((keycodeCategory) => {
    return (
      <KeycodeCategory
        activeSearch={search}
        key={keycodeCategory.label}
        keycodes={keycodeCategory.keycodes}
      >
        <KeycodeCategoryLabel>
          {keycodeCategory.label}
        </KeycodeCategoryLabel>
      </KeycodeCategory>
    );
  });

  return (
    <div className={floatingPaneClassName}>
      <div className="m-4">
        <input className={searchInputClassName} placeholder="Search…" onChange={onSearchChange} />
      </div>
      <div className={keycodesListClassName}>
        {Categories}
      </div>
    </div>
  );
}
