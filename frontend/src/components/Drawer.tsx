import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BaseProps } from '../@types/common';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useDrawer from '../hooks/useDrawer';
import ButtonIcon from './ButtonIcon';
import {
  PiArrowRight,
  PiChartLine,
  PiChat,
  PiChatCenteredDotsDuotone,
  PiCheck,
  PiCompass,
  PiListBullets,
  PiArrowCircleRightLight,
  PiArrowCircleLeftLight,
  PiNotePencil,
  PiPencilLine,
  PiPlugs,
  PiPresentationChart,
  PiRobot,
  PiTrash,
  PiX,
} from 'react-icons/pi';
import LazyOutputText from './LazyOutputText';
import { ConversationMeta } from '../@types/conversation';
import { BotListItem } from '../@types/bot';
import useChat from '../hooks/useChat';
import { useTranslation } from 'react-i18next';
import Menu from './Menu';
import DrawerItem from './DrawerItem';
import ExpandableDrawerGroup from './ExpandableDrawerGroup';
import { usePageLabel } from '../routes';
import { twMerge } from 'tailwind-merge';
import Button from './Button';
import Skeleton from './Skeleton';
import { isPinnedBot } from '../utils/BotUtils';
import IconPinnedBot from './IconPinnedBot';

type Props = BaseProps & {
  isAdmin: boolean;
  conversations?: ConversationMeta[];
  starredBots?: BotListItem[];
  recentlyUsedUnstarredBots?: BotListItem[];
  updateConversationTitle: (
    conversationId: string,
    title: string
  ) => Promise<void>;
  onSignOut: () => void;
  onDeleteConversation: (conversation: ConversationMeta) => void;
  onClearConversations: () => void;
  onSelectLanguage: () => void;
  onClickDrawerOptions: () => void;
};

type ItemProps = BaseProps & {
  label: string;
  conversationId: string;
  generatedTitle?: boolean;
  updateTitle: (conversationId: string, title: string) => Promise<void>;
  onClick: () => void;
  onDelete: () => void;
};

const Item: React.FC<ItemProps> = (props) => {
  const { pathname } = useLocation();
  const { conversationId: pathParam } = useParams();
  const { conversationId } = useChat();
  const [tempLabel, setTempLabel] = useState('');
  const [editing, setEditing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const active = useMemo<boolean>(() => {
    return (
      pathParam === props.conversationId ||
      ((pathname === '/' || pathname.startsWith('/bot/')) &&
        conversationId == props.conversationId)
    );
  }, [conversationId, pathParam, pathname, props.conversationId]);

  const onClickEdit = useCallback(() => {
    setEditing(true);
    setTempLabel(props.label);
  }, [props.label]);

  const onClickUpdate = useCallback(() => {
    props.updateTitle(props.conversationId, tempLabel).then(() => {
      setEditing(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempLabel, props.conversationId, props.updateTitle]);

  const onClickDelete = useCallback(() => {
    props.onDelete();
  }, [props]);

  useLayoutEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  useLayoutEffect(() => {
    if (editing) {
      const listener = (e: DocumentEventMap['keypress']) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();

          // dispatch 処理の中で Title の更新を行う（同期を取るため）
          setTempLabel((newLabel) => {
            props.updateTitle(props.conversationId, newLabel).then(() => {
              setEditing(false);
            });
            return newLabel;
          });
        }
      };
      inputRef.current?.addEventListener('keypress', listener);

      inputRef.current?.focus();

      return () => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        inputRef.current?.removeEventListener('keypress', listener);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  return (
    <DrawerItem
      isActive={active}
      isBlur={!editing}
      to={`/${props.conversationId}`}
      onClick={props.onClick}
      icon={<PiChat />}
      labelComponent={
        <>
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-transparent"
              value={tempLabel}
              onChange={(e) => {
                setTempLabel(e.target.value);
              }}
            />
          ) : (
            <>
              {props.generatedTitle ? (
                <LazyOutputText text={props.label} />
              ) : (
                <>{props.label}</>
              )}
            </>
          )}
        </>
      }
      actionComponent={
        <>
          {active && !editing && (
            <>
              <ButtonIcon className="text-base" onClick={onClickEdit}>
                <PiPencilLine />
              </ButtonIcon>

              <ButtonIcon className="text-base" onClick={onClickDelete}>
                <PiTrash />
              </ButtonIcon>
            </>
          )}
          {editing && (
            <>
              <ButtonIcon className="text-base" onClick={onClickUpdate}>
                <PiCheck />
              </ButtonIcon>

              <ButtonIcon
                className="text-base"
                onClick={() => {
                  setEditing(false);
                }}>
                <PiX />
              </ButtonIcon>
            </>
          )}
        </>
      }
    />
  );
};

const Drawer: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getPageLabel } = usePageLabel();
  const { opened, switchOpen, drawerOptions } = useDrawer();
  const { conversations, starredBots, recentlyUsedUnstarredBots } = props;

  const location = useLocation();

  const [prevConversations, setPrevConversations] =
    useState<typeof conversations>();
  const [generateTitleIndex, setGenerateTitleIndex] = useState(-1);

  const { newChat, conversationId } = useChat();
  const { botId } = useParams();

  useEffect(() => {
    setPrevConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    // 新規チャットの場合はTitleをLazy表示にする
    if (!conversations || !prevConversations) {
      return;
    }
    if (conversations.length > prevConversations?.length) {
      setGenerateTitleIndex(
        conversations?.findIndex(
          (c) =>
            (prevConversations?.findIndex((pc) => c.id === pc.id) ?? -1) < 0
        ) ?? -1
      );
    }
  }, [conversations, prevConversations]);

  const onClickNewChat = useCallback(() => {
    newChat();
    closeSmallDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClickNewBotChat = useCallback(
    () => {
      newChat();
      closeSmallDrawer();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Ref used only to attach to the small-screen overlay container.
  // Note: we intentionally do not rely on this ref for toggle logic anymore.
  const smallDrawer = useRef<HTMLDivElement>(null);

  const closeSmallDrawer = useCallback(() => {
    // On small screens, close the drawer after navigation/actions
    if (
      opened &&
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 1023px)').matches
    ) {
      switchOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const isAdminPanel = useMemo(() => {
    return location.pathname.startsWith('/admin');
  }, [location.pathname]);

  return (
    <>
      <div className="relative h-full overflow-y-auto px-1 py-2 lg:px-2 lg:py-3">
        {!opened && (
          <button
            className="hidden lg:flex fixed left-3 top-3 z-50 items-center gap-2 rounded-full glass-surface px-3 py-1.5 text-sm text-aws-font-color-light dark:text-aws-font-color-white-dark shadow-soft ring-1 ring-black/5 dark:ring-white/10 hover:bg-white/70 dark:hover:bg-white/20"
            onClick={switchOpen}
            aria-label="Open menu"
            title="Open menu"
          >
            <PiArrowCircleRightLight className="text-base" />
          </button>
        )}
        <nav
          className={`${
            opened ? 'visible w-64' : 'invisible w-0'
          } transition-width relative z-50`}
          aria-hidden={!opened}
        >
          <div className="mx-2 rounded-2xl glass-surface ring-1 ring-black/5 dark:ring-white/10 text-sm text-aws-font-color-light dark:text-aws-font-color-white-dark shadow-soft overflow-hidden">
            {/* Desktop collapse button */}
            <div className="hidden lg:flex items-center justify-end p-2 border-b border-black/5 dark:border-white/10">
              <button
                className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-blue-400/50"
                onClick={switchOpen}
                aria-label="Hide menu"
                title="Hide menu"
              >
                <PiArrowCircleLeftLight className="text-base" />
                <span className="sr-only">Hide</span>
              </button>
            </div>
          {!isAdminPanel && (
            <>
              <DrawerItem
                isActive={false}
                icon={<PiNotePencil />}
                to="/"
                onClick={onClickNewChat}
                labelComponent={t('button.newChat')}
              />
              <DrawerItem
                isActive={false}
                icon={<PiListBullets />}
                to="/bot/my"
                labelComponent={getPageLabel('/bot/my')}
                onClick={closeSmallDrawer}
              />
              <DrawerItem
                isActive={false}
                icon={<PiCompass />}
                to="/bot/discover"
                labelComponent={getPageLabel('/bot/discover')}
                onClick={closeSmallDrawer}
              />
              <DrawerItem
                isActive={false}
                icon={<PiChartLine />}
                to="/analytics"
                labelComponent={getPageLabel('/analytics')}
                onClick={closeSmallDrawer}
              />

              <ExpandableDrawerGroup
                label={t('app.starredBots')}
                className="border-t pt-1">
                {starredBots === undefined && (
                  <div className="flex flex-col gap-2 p-2">
                    <Skeleton className="h-10 w-full bg-aws-sea-blue-light/50 dark:bg-aws-sea-blue-dark/50" />
                    <Skeleton className="h-10 w-full bg-aws-sea-blue-light/50 dark:bg-aws-sea-blue-dark/50" />
                    <Skeleton className="h-10 w-full bg-aws-sea-blue-light/50 dark:bg-aws-sea-blue-dark/50" />
                    <Skeleton className="h-10 w-full bg-aws-sea-blue-light/50 dark:bg-aws-sea-blue-dark/50" />
                    <Skeleton className="h-10 w-full bg-aws-sea-blue-light/50 dark:bg-aws-sea-blue-dark/50" />
                  </div>
                )}
                {starredBots
                  ?.slice(0, drawerOptions.displayCount.starredBots)
                  .map((bot) => (
                    <DrawerItem
                      key={bot.id}
                      isActive={botId === bot.id && !conversationId}
                      to={`/bot/${bot.id}`}
                      icon={
                        isPinnedBot(bot.sharedStatus) ? (
                          <IconPinnedBot showAlways />
                        ) : (
                          <PiRobot />
                        )
                      }
                      labelComponent={bot.title}
                      onClick={onClickNewBotChat}
                    />
                  ))}

                {starredBots && starredBots.length > 15 && (
                  <Button
                    text
                    rightIcon={<PiArrowRight />}
                    className="w-full"
                    onClick={() => {
                      navigate('/bot/starred');
                      closeSmallDrawer();
                    }}>
                    {t('bot.button.viewAll')}
                  </Button>
                )}
              </ExpandableDrawerGroup>

              <ExpandableDrawerGroup
                label={t('app.recentlyUsedBots')}
                className="border-t pt-1">
                {recentlyUsedUnstarredBots === undefined && (
                  <div className="flex flex-col gap-2 p-2">
                    <Skeleton className="h-10 w-full bg-aws-sea-blue-light/50 dark:bg-aws-sea-blue-dark/50" />
                    <Skeleton className="h-10 w-full bg-aws-sea-blue-light/50 dark:bg-aws-sea-blue-dark/50" />
                    <Skeleton className="h-10 w-full bg-aws-sea-blue-light/50 dark:bg-aws-sea-blue-dark/50" />
                    <Skeleton className="h-10 w-full bg-aws-sea-blue-light/50 dark:bg-aws-sea-blue-dark/50" />
                    <Skeleton className="h-10 w-full bg-aws-sea-blue-light/50 dark:bg-aws-sea-blue-dark/50" />
                  </div>
                )}
                {recentlyUsedUnstarredBots
                  ?.slice(0, drawerOptions.displayCount.recentlyUsedBots)
                  .map((bot) => (
                    <DrawerItem
                      key={bot.id}
                      isActive={false}
                      to={`/bot/${bot.id}`}
                      icon={
                        isPinnedBot(bot.sharedStatus) ? (
                          <IconPinnedBot showAlways />
                        ) : (
                          <PiRobot />
                        )
                      }
                      labelComponent={bot.title}
                      onClick={onClickNewBotChat}
                    />
                  ))}

                {recentlyUsedUnstarredBots && (
                  <Button
                    text
                    rightIcon={<PiArrowRight />}
                    className="w-full"
                    onClick={() => {
                      navigate('/bot/recently-used');
                      closeSmallDrawer();
                    }}>
                    {t('bot.button.viewAll')}
                  </Button>
                )}
              </ExpandableDrawerGroup>

              <ExpandableDrawerGroup
                label={t('app.conversationHistory')}
                className={twMerge(
                  'border-t pt-1',
                  props.isAdmin ? 'mb-20' : 'mb-10'
                )}>
                {conversations === undefined && (
                  <div className="flex flex-col gap-2 p-2">
                    <Skeleton className="h-10 w-full bg-aws-sea-blue-light/50 dark:bg-aws-sea-blue-dark/50" />
                    <Skeleton className="h-10 w-full bg-aws-sea-blue-light/50 dark:bg-aws-sea-blue-dark/50" />
                    <Skeleton className="h-10 w-full bg-aws-sea-blue-light/50 dark:bg-aws-sea-blue-dark/50" />
                    <Skeleton className="h-10 w-full bg-aws-sea-blue-light/50 dark:bg-aws-sea-blue-dark/50" />
                    <Skeleton className="h-10 w-full bg-aws-sea-blue-light/50 dark:bg-aws-sea-blue-dark/50" />
                  </div>
                )}
                {conversations
                  ?.slice(0, drawerOptions.displayCount.conversationHistory)
                  .map((conversation, idx) => (
                    <Item
                      key={idx}
                      className="grow"
                      label={conversation.title}
                      conversationId={conversation.id}
                      generatedTitle={idx === generateTitleIndex}
                      updateTitle={props.updateConversationTitle}
                      onClick={closeSmallDrawer}
                      onDelete={() => props.onDeleteConversation(conversation)}
                    />
                  ))}

                {conversations && (
                  <Button
                    text
                    rightIcon={<PiArrowRight />}
                    className="w-full"
                    onClick={() => {
                      navigate('/conversations');
                      closeSmallDrawer();
                    }}>
                    {t('bot.button.viewAll')}
                  </Button>
                )}
              </ExpandableDrawerGroup>
            </>
          )}

          {isAdminPanel && (
            <>
              <div className="px-2 py-1 italic">{t('app.adminConsoles')}</div>
              <DrawerItem
                className="w-60"
                isActive={location.pathname === '/admin/shared-bot-analytics'}
                icon={<PiChartLine />}
                to="/admin/shared-bot-analytics"
                labelComponent={getPageLabel('/admin/shared-bot-analytics')}
                onClick={closeSmallDrawer}
              />
              <DrawerItem
                className="w-60"
                isActive={location.pathname === '/admin/api-management'}
                icon={<PiPlugs />}
                to="/admin/api-management"
                labelComponent={getPageLabel('/admin/api-management')}
                onClick={closeSmallDrawer}
              />
            </>
          )}

          <div
            className={twMerge(
              opened ? 'w-64' : 'w-0',
              props.isAdmin ? 'h-20' : 'h-10',
              'fixed -bottom-2 z-50 mb-2 flex flex-col items-start border-t transition-width lg:w-64 glass-surface ring-1 ring-black/5 dark:ring-white/10'
            )}>
            {props.isAdmin && !isAdminPanel && (
              <DrawerItem
                className="w-60"
                isActive={false}
                icon={<PiPresentationChart />}
                to="/admin/shared-bot-analytics"
                labelComponent={t('app.adminConsoles')}
                onClick={closeSmallDrawer}
              />
            )}
            {isAdminPanel && (
              <DrawerItem
                className="w-60"
                isActive={false}
                icon={<PiChatCenteredDotsDuotone />}
                to="/"
                labelComponent={t('app.backChat')}
                onClick={closeSmallDrawer}
              />
            )}
            <Menu
              className="mx-2 flex h-10 w-60 justify-start text-aws-font-color-light dark:text-aws-font-color-white-dark"
              onSignOut={props.onSignOut}
              onSelectLanguage={props.onSelectLanguage}
              onClearConversations={props.onClearConversations}
              onClickDrawerOptions={props.onClickDrawerOptions}
            />
          </div>
          </div>
        </nav>
      </div>

      <div
        ref={smallDrawer}
        className={`lg:hidden ${opened ? 'visible' : 'hidden'}`}>
        <ButtonIcon
          className="fixed left-64 top-0 z-50 text-white"
          onClick={switchOpen}>
          <PiX />
        </ButtonIcon>
        <div
          className="fixed z-40 h-dvh w-screen bg-dark-gray/90"
          onClick={switchOpen}></div>
      </div>
    </>
  );
};

export default Drawer;
