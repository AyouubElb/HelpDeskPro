import type { SVGProps } from 'react';

// The three Phosphor icons (regular weight) the app uses, inlined to keep the bundle small.
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 15, path, ...props }: IconProps & { path: string }) {
  return (
    <svg viewBox="0 0 256 256" width={size} height={size} fill="currentColor" aria-hidden="true" {...props}>
      <path d={path} />
    </svg>
  );
}

export const PlusIcon = (props: IconProps) => (
  <Icon
    path="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"
    {...props}
  />
);

export const SearchIcon = (props: IconProps) => (
  <Icon
    path="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
    {...props}
  />
);

export const CloseIcon = (props: IconProps) => (
  <Icon
    path="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"
    {...props}
  />
);
