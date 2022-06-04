import app from 'flarum/admin/app';
import registerWidget from '../common/registerWidget';
import isExtensionEnabled from 'flarum/admin/utils/isExtensionEnabled';

import type { SettingsComponentOptions } from 'flarum/admin/components/AdminPage';

function buildSettingData(settingName: string): SettingsComponentOptions {
  return {
    type: 'bool',
    label: app.translator.trans(`davwheat-blog-featured-widget.admin.settings.${settingName}`),
    setting: `davwheat-blog-featured-widget.${settingName}`,
  };
}

app.initializers.add('davwheat/blog-featured-widget', () => {
  registerWidget();

  const extData = app.extensionData.for('davwheat-blog-featured-widget');

  extData.registerSetting(() => {
    return (
      <p style="margin-bottom: 24px; padding: 4px 0; padding-left: 12px; border-left: 4px solid var(--primary-color);">
        {app.translator.trans('davwheat-blog-featured-widget.admin.settings.location_note')}
      </p>
    );
  });

  if (isExtensionEnabled('flarum-tags')) extData.registerSetting(buildSettingData('show_on_tag_pages'));
  if (isExtensionEnabled('flarum-subscriptions')) extData.registerSetting(buildSettingData('show_on_following_page'));
  if (isExtensionEnabled('fof-byobu')) extData.registerSetting(buildSettingData('show_on_byobu_page'));
  if (isExtensionEnabled('clarkwinkelmann-bookmarks')) extData.registerSetting(buildSettingData('show_on_bookmarks_page'));
});
