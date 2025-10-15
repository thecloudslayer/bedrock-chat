import { BaseProps } from '../@types/common';
import useModel from '../hooks/useModel';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react/jsx-runtime';
import { useMemo } from 'react';
import { PiCaretDown, PiCheck } from 'react-icons/pi';
import { ActiveModels } from '../@types/bot';
import { toCamelCase } from '../utils/StringUtils';

interface Props extends BaseProps {
  activeModels: ActiveModels;
  botId?: string | null;
}

const SwitchBedrockModel: React.FC<Props> = (props) => {
  const {
    availableModels: allModels,
    modelId,
    setModelId,
  } = useModel(props.botId, props.activeModels);

  const availableModels = useMemo(() => {
    return allModels.filter((model) => {
      if (props.activeModels) {
        return (
          props.activeModels[
            toCamelCase(model.modelId) as keyof ActiveModels
          ] === true
        );
      }
      return true;
    });
  }, [allModels, props.activeModels]);

  const modelName = useMemo(() => {
    return (
      availableModels.find((model) => model.modelId === modelId)?.label ?? ''
    );
  }, [availableModels, modelId]);

  return (
    <div className="">
      <Popover className="relative">
        {() => (
          <>
            <Popover.Button
              className={`${
                props.className ?? ''
              } group inline-flex max-w-xs items-center whitespace-nowrap bg-transparent px-0 py-0 text-sm font-semibold text-dark-gray hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-aws-aqua/50 dark:text-light-gray`}>
              <div className="flex items-center">
                <span className="truncate">{modelName}</span>
                <PiCaretDown className="ml-1 text-xs opacity-80" />
              </div>
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1">
              <Popover.Panel className="absolute left-0 top-12 z-10 w-72">
                <div className="mt-1 overflow-hidden rounded-xl border border-aws-font-color-light/30 bg-white/95 shadow-xl backdrop-blur dark:border-aws-font-color-dark/30 dark:bg-aws-ui-color-dark/95">
                  <div className="flex flex-col whitespace-nowrap text-sm max-h-80 overflow-y-auto">
                    {availableModels.map((model) => (
                      <div
                        key={model.modelId}
                        className="m-1.5 flex cursor-pointer rounded-lg p-2 hover:bg-light-gray dark:hover:bg-aws-paper-dark"
                        onClick={() => {
                          setModelId(model.modelId);
                        }}>
                        <div className="mr-2 flex items-center">
                          <PiCheck
                            className={
                              model.modelId === modelId ? 'text-aws-aqua' : 'text-transparent'
                            }
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="block truncate text-left font-medium">
                            <span>{model.label}</span>
                          </div>
                          {model.description && (
                            <div className="block whitespace-normal text-left text-[11px] text-dark-gray/80 dark:text-aws-font-color-dark/80">
                              <span>{model.description}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
};

export default SwitchBedrockModel;
