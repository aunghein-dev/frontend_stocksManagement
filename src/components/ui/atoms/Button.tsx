import { buttonVariants } from './button.utils';
import { ButtonProps } from './button.types';

export const Button = ({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      className={`${buttonVariants({ variant, size })} ${className}`}
    />
  );
};