import { Button } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import classes from './Header.module.css';

interface NavLinkItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onNavigate?: () => void;
}

export function NavLinkItem({ to, icon, label, onNavigate }: NavLinkItemProps) {
  return (
    <Button
      component={Link}
      to={to}
      variant="subtle"
      color="gray"
      fullWidth
      justify="flex-start"
      leftSection={icon}
      onClick={onNavigate}
      className={classes.navLinkButton}
    >
      {label}
    </Button>
  );
}
