"use no memo";

import React from 'react';
import type { WidgetTaskHandler } from 'react-native-android-widget';
import { SehaticaDashboardWidget } from './SehaticaDashboardWidget';
import { loadWidgetSnapshot } from './snapshot-storage';
import { SEHATICA_DASHBOARD_WIDGET } from './types';

export const widgetTaskHandler: WidgetTaskHandler = async ({
  widgetInfo,
  widgetAction,
  renderWidget,
}) => {
  if (widgetInfo.widgetName !== SEHATICA_DASHBOARD_WIDGET) return;
  if (widgetAction === 'WIDGET_DELETED') return;

  const data = await loadWidgetSnapshot();
  renderWidget(<SehaticaDashboardWidget data={data} />);
};
