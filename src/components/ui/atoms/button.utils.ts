import clsx from 'clsx';

export const buttonVariants = ({
  variant = 'primary',
  size = 'md',
}: {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
}) => {
  const base = 'rounded px-4 py-2 font-medium transition-all ease-in-out duration-300';

  const variantMap = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500',
    secondary: 'bg-gray-200 text-black hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent hover:bg-gray-100',
  };

  const sizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return clsx(base, variantMap[variant], sizeMap[size]);
};
