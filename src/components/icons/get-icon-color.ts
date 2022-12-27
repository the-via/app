export default function getIconColor(isSelected: boolean) {
  return {
    style: {
      color: isSelected ? 'var(--bg_icon-highlighted)' : 'var(--bg_icon)',
    },
  };
}
