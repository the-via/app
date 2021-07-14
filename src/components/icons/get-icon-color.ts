export default function getIconColor(isSelected: boolean) {
  return {
    style: {
      color: isSelected ? 'var(--color_light-grey)' : 'var(--color_medium-grey)'
    }
  };
}
