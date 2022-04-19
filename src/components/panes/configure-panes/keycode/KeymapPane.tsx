import React from 'react';
import cntl from 'cntl';
import {getKeycodes, getOtherMenu} from 'src/utils/key';
import KeycodeCategory from './KeycodeCategory';
import KeycodeCategoryLabel from './KeycodeCategoryLabel';

const KeycodeCategories = getKeycodes()
  .concat(getOtherMenu())
  .filter((menu) => !['Other', 'Mod+_'].includes(menu.label));

const keycodesListClassName = cntl`
  flex
  flex-col
  flex-1
  px-4
  pb-4
  gap-6
  overflow-y-auto
`;

const searchInputClassName = cntl`
  bg-inherit
  border-2
  border-secondary
  border-solid
  focus:border-primary
  hover:border-primary
  placeholder:text-secondary
  px-3
  py-1
  rounded-lg
  text-light
  transition-button
  w-full
`;

interface Props {};

export default function KeymapPane(_props: Props) {
  console.info('created');
  const [search, setSearch] = React.useState<string>();

  const onSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    [],
  );

  const Categories = React.useMemo(() => {
    return KeycodeCategories.map((keycodeCategory) => {
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
  }, [KeycodeCategories, search]);

  return (
    <div className="flex flex-col overflow-y-auto">
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
