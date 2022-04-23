import React from 'react';
import ControlCategoryLabel, { ControlCategoryLabelProps } from 'src/components/controls/ControlCategoryLabel';

interface KeycodeCategoryLabelProps extends ControlCategoryLabelProps { }

export default function KeycodeCategoryLabel(props: KeycodeCategoryLabelProps) {

  return (
    <ControlCategoryLabel className="sticky top-0 z-2" {...props} />
  );
}
