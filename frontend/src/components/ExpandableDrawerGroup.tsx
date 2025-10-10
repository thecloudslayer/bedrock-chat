import React, { ReactNode, useState } from 'react';
import { PiCaretDown } from 'react-icons/pi';
import { twMerge } from 'tailwind-merge';

type Props = {
  className?: string;
  label: string;
  children: ReactNode;
  isDefaultShow?: boolean;
};

const ExpandableDrawerGroup: React.FC<Props> = ({
  isDefaultShow = true,
  ...props
}) => {
  const [isShow, setIsShow] = useState(isDefaultShow);

  return (
    <div className={twMerge('px-2 py-2', props.className)}>
      <div
        className="mb-1 flex w-full cursor-pointer items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-aws-font-color-gray/80 transition hover:brightness-110"
        onClick={() => {
          setIsShow(!isShow);
        }}>
        <PiCaretDown className={`mx-0.5 text-xs ${isShow ? '' : 'rotate-180'}`} />
        <div>{props.label}</div>
      </div>
      <div>
        <div
          className={`origin-top transition-all ${
            isShow ? 'visible' : 'h-0 scale-y-0'
          }`}>
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default ExpandableDrawerGroup;
