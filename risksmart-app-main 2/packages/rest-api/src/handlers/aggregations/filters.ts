import type { ControlFilter, Controls } from './types';

export const filterControls = (
  controls: Partial<Controls>,
  config: ControlFilter | undefined | null
) => {
  let filteredControls = [...controls];

  if (config?.controlFilterField && config?.controlFilterValues) {
    if (
      config?.controlFilterField === 'CustomAttributeData' &&
      config?.controlFilterCustomAttributeKey
    ) {
      filteredControls = controls.filter(
        (control) =>
          control?.control?.CustomAttributeData?.[
            config.controlFilterCustomAttributeKey!
          ] &&
          config.controlFilterValues?.includes(
            control.control.CustomAttributeData[
              config.controlFilterCustomAttributeKey!
            ]
          )
      );
    }

    if (config?.controlFilterField !== 'CustomAttributeData') {
      filteredControls = controls.filter(
        (control) =>
          control?.control?.[config.controlFilterField!] &&
          config.controlFilterValues?.includes(
            control.control[config.controlFilterField!]
          )
      );
    }
  }

  return filteredControls;
};
