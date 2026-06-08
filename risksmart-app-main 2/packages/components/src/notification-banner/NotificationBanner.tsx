import Button from '@risk-smart/themed-cloudscape-components/button';
import { AlertCircle, Check, X } from '@untitled-ui/icons-react';
import type { MotionProps } from 'framer-motion';
import { AnimatePresence, motion } from 'framer-motion';
import type * as React from 'react';
import { useEffect } from 'react';
import type { Toast } from 'react-hot-toast';
import { toast as hotToast } from 'react-hot-toast';

import LoadingImage from '../assets/Loading.png';

interface NotificationBannerProps {
  type?: 'error' | 'loading' | 'success';
  content: React.ReactNode;
  toast: Toast;
  dismissable?: boolean;
  durationMs: number;
}

const iconAnimationProps: MotionProps = {
  initial: { opacity: 0.75, scale: 0, rotate: -120 },
  animate: { opacity: 1, scale: 1, rotate: 0 },
  exit: { opacity: 0 },
  transition: { type: 'spring', bounce: 0.4, duration: 0.5, delay: 0.1 },
};

export const NotificationBanner = (props: NotificationBannerProps) => {
  useEffect(() => {
    if (props.durationMs !== Infinity) {
      const timeout = setTimeout(() => {
        hotToast.dismiss(props.toast.id);
      }, props.durationMs);

      return () => clearTimeout(timeout);
    }
  }, [props.durationMs, props.toast.id]);

  return (
    <AnimatePresence>
      {props.toast.visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.1, ease: 'easeInOut' }}
          key={props.toast.id}
          className={`font-sans text-md font-semibold max-w-md w-full ${
            props.type === 'error' ? 'bg-[#d91515] text-white' : 'bg-white'
          } shadow-md rounded-md flex transition-all`}
        >
          <div
            className={'p-5 w-0 flex-1 flex justify-between items-center'}
            data-testid={'notification-banner'}
          >
            <div className={'flex gap-3 items-center'}>
              <AnimatePresence mode={'wait'}>
                {props.type === 'success' && (
                  <motion.div
                    {...iconAnimationProps}
                    key={'success'}
                    className={'grid place-items-center'}
                  >
                    <div
                      className={
                        'bg-teal rounded-full w-[24px] h-[24px] grid place-items-center'
                      }
                    >
                      <Check
                        viewBox={'0 0 24 24'}
                        className={'text-white w-[18px] h-[18px]'}
                      />
                    </div>
                  </motion.div>
                )}
                {props.type === 'error' && (
                  <motion.div
                    {...iconAnimationProps}
                    key={'error'}
                    className={'grid place-items-center'}
                  >
                    <AlertCircle viewBox={'0 0 24 24'} />
                  </motion.div>
                )}
                {props.type === 'loading' && (
                  <motion.div
                    key={'loading'}
                    className={'grid place-items-center'}
                  >
                    <img
                      src={LoadingImage}
                      alt={'Loading'}
                      className={'animate-spin w-[24px] h-[24px]'}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              {props.content}
            </div>
            {props.dismissable && (
              <Button
                variant={'inline-icon'}
                iconSvg={
                  <X
                    viewBox={'0 0 24 24'}
                    color={props.type === 'error' ? 'white' : undefined}
                  />
                }
                onClick={() => hotToast.dismiss(props.toast.id)}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
