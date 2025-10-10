import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

type Props = {
  className?: string;
  isActive?: boolean;
  isBlur?: boolean;
  to: string;
  icon: ReactNode;
  labelComponent: ReactNode;
  actionComponent?: ReactNode;
  onClick?: () => void;
};

const DrawerItem: React.FC<Props> = (props) => {
  return (
    <Link
      className={twMerge(
        'group mx-2 my-1 flex h-10 items-center rounded-lg px-2 transition-colors',
        (props.isActive ?? true)
          ? 'bg-white/70 text-aws-font-color-light shadow-soft ring-1 ring-black/5 dark:bg-white/10 dark:text-aws-font-color-white-dark dark:ring-white/10'
          : '',
        props.className
      )}
      to={props.to}
      onClick={props.onClick}>
      <div className={`flex h-8 max-h-5 w-full justify-start overflow-hidden`}>
        <div className="mr-2 pt-0.5">{props.icon}</div>
        <div className="relative flex-1 truncate">
          {props.labelComponent}
        </div>

        <div className="flex">{props.actionComponent}</div>
      </div>
    </Link>
  );
};

export default DrawerItem;
